"""Estado del agente de detección de conflictos."""

from pydantic import BaseModel

from .models import Articulo, ConflictoDetectado, ProyectoLey, ProyectoLeyImpacto


class ConflictDetectorState(BaseModel):
    """Estado del agente de detección de conflictos."""

    document_pages: list[str]
    proyectos_ley: list[ProyectoLey] = []
    articulos_distintos: list[Articulo] = []
    conflictos: list[ConflictoDetectado] = []
    proyecto_ley_impacto: ProyectoLeyImpacto | None = None


