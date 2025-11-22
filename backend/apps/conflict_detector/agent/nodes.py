"""Nodos del grafo del agente de detección de conflictos."""

import json
import os
import time
from pathlib import Path

import numpy as np
from openai import OpenAI

from .models import ConflictoDetectado, ImpactoConflicto, ProyectoLey, ProyectoLeyImpacto
from .prompts import MAP_EXTRACCION_MATRICES
from .state import ConflictDetectorState
from django.conf import settings
from .llm_map import llm_map


# Variables globales de configuración
SIMILITUD_THRESHOLD = 0.4
MAX_ARTICULOS_POR_PAGINA = 10
EMBEDDING_MODEL = "text-embedding-3-small"

# Inicializar cliente de OpenAI
_client = None


def get_openai_client() -> OpenAI:
    """Obtiene o crea el cliente de OpenAI."""
    global _client
    _client = OpenAI(api_key=settings.PROJECT_OPENAI_API_KEY)
    return _client


def similitud_coseno(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Calcula la similitud coseno entre dos vectores.

    Args:
        vec1: Primer vector
        vec2: Segundo vector

    Returns:
        Valor de similitud coseno (entre -1 y 1)
    """
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


def generar_embeddings(textos: list[str], batch_size: int = 100) -> list[list[float]]:
    """
    Genera embeddings usando la API de OpenAI.

    Args:
        textos: Lista de textos a convertir en embeddings
        batch_size: Tamaño del lote para procesamiento

    Returns:
        Lista de vectores de embeddings
    """
    client = get_openai_client()
    embeddings = []

    # Procesar en lotes para manejar rate limits
    for i in range(0, len(textos), batch_size):
        batch = textos[i : i + batch_size]

        try:
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=batch,
            )

            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)

            # Pequeña pausa para evitar rate limits
            time.sleep(0.1)

        except Exception as e:
            print(f"Error al procesar lote {i//batch_size + 1}: {e}")
            raise

    return embeddings


def load_proyectos_ley() -> list[ProyectoLey]:
    """
    Carga los proyectos de ley desde los archivos JSON en data/proyectos_ley/.

    Returns:
        Lista de proyectos de ley cargados
    """
    proyectos = []
    # Buscar el directorio data/proyectos_ley desde la raíz del backend
    # El path se construye desde el paquete hacia arriba hasta encontrar el backend
    current_path = Path(__file__).parent
    backend_root = None

    # Buscar hacia arriba hasta encontrar el directorio backend
    for parent in current_path.parents:
        if parent.name == "backend" and (parent / "data" / "proyectos_ley").exists():
            backend_root = parent
            break

    if backend_root is None:
        # Si no encontramos el backend, intentar desde la raíz del workspace
        backend_root = current_path.parent.parent.parent.parent.parent

    proyectos_dir = backend_root / "data" / "proyectos_ley"

    if not proyectos_dir.exists():
        return proyectos

    for json_file in proyectos_dir.glob("*.json"):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                proyecto = ProyectoLey(**data)
                proyectos.append(proyecto)
        except Exception as e:
            # Si hay un error al cargar un archivo, lo ignoramos y continuamos
            print(f"Error al cargar {json_file}: {e}")
            continue

    return proyectos


def detectar_conflictos(
    document_pages: list[str],
    proyectos_ley: list[ProyectoLey],
) -> list[ConflictoDetectado]:
    """
    Detecta conflictos comparando cada página con cada artículo.

    Args:
        document_pages: Lista de páginas del documento
        proyectos_ley: Lista de proyectos de ley

    Returns:
        Lista de conflictos detectados
    """
    # Extraer todos los artículos con información del proyecto
    articulos_con_proyecto = []
    for proyecto in proyectos_ley:
        for articulo in proyecto.articulos:
            articulos_con_proyecto.append(
                {
                    "proyecto_id": proyecto.id,
                    "proyecto_titulo": proyecto.titulo,
                    "articulo": articulo,
                }
            )

    if not articulos_con_proyecto or not document_pages:
        return []

    # Generar embeddings para páginas
    print(f"Generando embeddings para {len(document_pages)} páginas...")
    embeddings_paginas = generar_embeddings(document_pages)
    embeddings_paginas_np = np.array(embeddings_paginas)

    # Generar embeddings para artículos
    textos_articulos = [item["articulo"].descripcion_semantica for item in articulos_con_proyecto]
    print(f"Generando embeddings para {len(textos_articulos)} artículos...")
    embeddings_articulos = generar_embeddings(textos_articulos)
    embeddings_articulos_np = np.array(embeddings_articulos)

    # Comparar cada página con cada artículo
    conflictos = []

    for pagina_num, pagina_text in enumerate(document_pages):
        embedding_pagina = embeddings_paginas_np[pagina_num]

        # Calcular similitud con todos los artículos
        similitudes_articulos = []
        for idx, item in enumerate(articulos_con_proyecto):
            embedding_articulo = embeddings_articulos_np[idx]
            similitud = similitud_coseno(embedding_pagina, embedding_articulo)

            similitudes_articulos.append(
                {
                    "proyecto_id": item["proyecto_id"],
                    "proyecto_titulo": item["proyecto_titulo"],
                    "articulo": item["articulo"],
                    "similitud": similitud,
                }
            )

        # Ordenar por similitud descendente
        similitudes_articulos.sort(key=lambda x: x["similitud"], reverse=True)

        # Tomar solo los que superan el threshold (máximo MAX_ARTICULOS_POR_PAGINA)
        articulos_conflicto = [
            item
            for item in similitudes_articulos
            if item["similitud"] >= SIMILITUD_THRESHOLD
        ][:MAX_ARTICULOS_POR_PAGINA]

        # Crear conflictos detectados
        for item in articulos_conflicto:
            conflicto = ConflictoDetectado(
                proyecto_id=item["proyecto_id"],
                proyecto_titulo=item["proyecto_titulo"],
                articulo_numero=item["articulo"].numero,
                articulo_tipo=item["articulo"].tipo,
                pagina_numero=pagina_num,
                similitud=item["similitud"],
                pagina_texto=pagina_text,
                articulo_texto=item["articulo"].texto,
            )
            conflictos.append(conflicto)

    return conflictos


def calcular_impacto_conflictos(conflictos: list[ConflictoDetectado]):
    """
    Calcula el impacto de los conflictos detectados usando LLM con llm_map.

    Args:
        conflictos: Lista de conflictos detectados

    Returns:
        MapResult con los resultados del procesamiento LLM
    """
    if not conflictos:
        from .llm_map import MapResult
        return MapResult(map_results=[])

    # Convertir conflictos a strings usando __str__
    textos_para_procesar = [str(conflicto) for conflicto in conflictos]

    # Usar llm_map para procesar los conflictos
    result = llm_map(
        texts=textos_para_procesar,
        map_prompt=MAP_EXTRACCION_MATRICES,
        map_output_parser=ImpactoConflicto,
        concurrency_limit=16,
    )

    print(f"✅ Impacto calculado para {len(result.map_results)} conflictos")

    return result

def process_document(state: ConflictDetectorState) -> ConflictDetectorState:
    """
    Procesa las páginas del documento y carga los proyectos de ley.

    Detecta conflictos comparando cada página con cada artículo.
    """
    document_pages = state.document_pages

    # Cargar proyectos de ley
    proyectos_ley = load_proyectos_ley()

    # Extraer artículos distintos
    articulos_distintos = [
        articulo for proyecto in proyectos_ley for articulo in proyecto.articulos
    ]

    # Detectar conflictos
    conflictos = detectar_conflictos(document_pages, proyectos_ley)
    
    # Calcular impacto de los conflictos usando LLM
    conflictos_impacto = calcular_impacto_conflictos(conflictos)

    proyecto_ley_impacto = ProyectoLeyImpacto(
        proyecto_id=conflictos_impacto.map_results[0].proyecto_id,
        proyecto_titulo=conflictos_impacto.map_results[0].proyecto_titulo,
        impactos=conflictos_impacto.map_results,
    )

    # Actualizar el estado
    state.proyectos_ley = proyectos_ley
    state.articulos_distintos = articulos_distintos
    state.conflictos = conflictos
    state.proyecto_ley_impacto = proyecto_ley_impacto

    return state
