"""API endpoints para conflict detector."""

from ninja import File, Router, Schema, UploadedFile

from .services import detect_conflicts


class ConflictDetectionResponse(Schema):
    """Response schema para detección de conflictos."""

    resultado: str
    conflictos: dict
    total_conflictos: int


router = Router()


@router.post("/detect", response=ConflictDetectionResponse)
async def detect_conflicts_endpoint(request, file: UploadedFile = File(...)):
    """
    Detecta conflictos usando el agente LangGraph.

    Recibe un archivo PDF y retorna el resultado del análisis del agente.
    Los conflictos están organizados por proyecto y artículo, indicando las páginas con conflicto.
    """
    # Leer el contenido del archivo PDF
    pdf_content = await file.read()

    # Procesar el PDF y detectar conflictos
    result = await detect_conflicts(pdf_content)
    return ConflictDetectionResponse(
        resultado=result["resultado"],
        conflictos=result["conflictos"],
        total_conflictos=result["total_conflictos"],
    )

