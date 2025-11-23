import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, X, ArrowLeft, FileText, Scale, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getDiscoveryDetail, type DescubrimientoDetail } from "../../services/api/conflictDetector";

export const Route = createFileRoute("/_authenticated/discoveries/$id")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const [discovery, setDiscovery] = useState<DescubrimientoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiscovery();
  }, [id]);

  const loadDiscovery = async () => {
    try {
      setIsLoading(true);
      const data = await getDiscoveryDetail(Number(id));
      setDiscovery(data);
    } catch (err) {
      console.error('Error al cargar descubrimiento:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactLevel = (cantidadImpactos: number): string => {
    if (cantidadImpactos >= 3) return "Alto";
    if (cantidadImpactos >= 1) return "Medio";
    return "Bajo";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Alto":
        return "bg-[hsl(var(--alert-high))] text-white";
      case "Medio":
        return "bg-[hsl(var(--alert-medium))] text-white";
      case "Bajo":
        return "bg-[hsl(var(--alert-low))] text-white";
      default:
        return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        <span className="ml-3 text-muted-foreground">Cargando descubrimiento...</span>
      </div>
    );
  }

  if (error || !discovery) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar</h3>
        <p className="text-muted-foreground">{error || 'No se encontró el descubrimiento'}</p>
        <button
          onClick={() => navigate({ to: "/discoveries" })}
          className="mt-4 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md"
        >
          Volver a Descubrimientos
        </button>
      </div>
    );
  }

  const impactLevel = getImpactLevel(discovery.impactos.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/discoveries" })}
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--muted))] rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            {discovery.proyecto_titulo}
          </h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-sm border border-[hsl(var(--border))] rounded-md">
              Proyecto {discovery.proyecto_id}
            </span>
            <span
              className={`px-3 py-1 text-sm rounded-md ${getImpactColor(impactLevel)}`}
            >
              Impacto {impactLevel}
            </span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {discovery.impactos.length} impacto(s) detectado(s)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-[hsl(var(--border))] rounded-md hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="h-4 w-4" />
            Descartar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(var(--primary))] text-white rounded-md hover:opacity-90 transition-opacity">
            <Eye className="h-4 w-4" />
            Dar Seguimiento
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Extractos del Documento Interno */}
        <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5" />
              Extractos del Documento Analizado
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Secciones de tu documento <strong>{discovery.documento.nombre}</strong> que presentan conflictos
            </p>
          </div>
          <div className="space-y-4">
            {discovery.impactos.map((impacto) => (
              <div
                key={impacto.id}
                className="space-y-2 pb-4 border-b border-[hsl(var(--border))] last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm">Extracto del Documento</p>
                  <span className="px-2 py-1 text-xs bg-[hsl(var(--muted))] rounded">
                    Relevancia: {impacto.nivel_relevancia}%
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] italic bg-[hsl(var(--muted))]/30 p-3 rounded">
                  {impacto.extracto_interno}
                </p>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">
                    Análisis del Impacto:
                  </p>
                  <p className="text-sm text-[hsl(var(--foreground))]">
                    {impacto.descripcion_impacto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Artículos del Proyecto de Ley */}
        <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Scale className="h-5 w-5" />
              Artículos del Proyecto de Ley
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Extractos de los artículos que generan conflicto
            </p>
          </div>
          <div className="space-y-4">
            {discovery.impactos.map((impacto) => (
              <div
                key={impacto.id}
                className="space-y-2 pb-4 border-b border-[hsl(var(--border))] last:border-0 last:pb-0"
              >
                <p className="font-semibold text-sm text-[hsl(var(--primary))]">
                  Extracto del Artículo
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--primary))]/5 p-3 rounded">
                  {impacto.extracto_articulo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Análisis Consolidado de Impacto */}
      {discovery.descripcion_impacto_consolidada && (
        <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Análisis Consolidado de Impacto</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Resumen general de cómo este proyecto afecta tu documento
            </p>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-[hsl(var(--foreground))] leading-relaxed">
              {discovery.descripcion_impacto_consolidada}
            </p>
          </div>
        </div>
      )}

      {/* Información General */}
      <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-6">
        <h2 className="text-lg font-semibold mb-4">Información General</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
              Fecha de Análisis
            </p>
            <p className="text-[hsl(var(--foreground))]">
              {formatDate(discovery.fecha_analisis)}
            </p>
          </div>
          <hr className="border-[hsl(var(--border))]" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
              Documento Analizado
            </p>
            <p className="text-[hsl(var(--foreground))]">{discovery.documento.nombre}</p>
          </div>
          <hr className="border-[hsl(var(--border))]" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
              Proyecto de Ley
            </p>
            <p className="text-[hsl(var(--foreground))]">
              {discovery.proyecto_id} - {discovery.proyecto_titulo}
            </p>
          </div>
          <hr className="border-[hsl(var(--border))]" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
              Impactos Detectados
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              Se detectaron {discovery.impactos.length} impacto(s) con un nivel de relevancia promedio de{' '}
              {Math.round(discovery.impactos.reduce((sum, imp) => sum + imp.nivel_relevancia, 0) / discovery.impactos.length)}%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
