import { createFileRoute } from "@tanstack/react-router";
import { FileText, Upload, Calendar, AlertCircle, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  detectConflicts,
  listDocuments,
  deleteDocument,
  type DetectConflictsResponse,
  type DocumentoList
} from "../../services/api/conflictDetector";

export const Route = createFileRoute("/_authenticated/documents")({
  component: Documents,
});

function Documents() {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectConflictsResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentoList[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea un PDF
    if (file.type !== 'application/pdf') {
      setUploadError('Por favor selecciona un archivo PDF');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setDetectionResult(null);

    try {
      const result = await detectConflicts(file);
      setDetectionResult(result);
      // Recargar la lista de documentos
      await loadDocuments();
    } catch (error) {
      console.error('Error al subir documento:', error);
      setUploadError(error instanceof Error ? error.message : 'Error desconocido al procesar el documento');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (documentId: number, documentName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el documento "${documentName}"?`)) {
      return;
    }

    try {
      await deleteDocument(documentId);
      // Recargar la lista de documentos
      await loadDocuments();
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el documento');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Documentos</h1>
          <p className="text-muted-foreground">
            Perfil corporativo y documentación analizada
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))]/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir Documento
              </>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error al procesar documento</h3>
            <p className="text-sm mt-1">{uploadError}</p>
          </div>
        </div>
      )}

      {detectionResult && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Documento Procesado Exitosamente</h3>
              <p className="text-sm mb-3">
                <strong>{detectionResult.documento_nombre}</strong> ha sido analizado.
              </p>
              {detectionResult.descubrimientos.length === 0 ? (
                <p className="text-sm">No se detectaron conflictos en el documento.</p>
              ) : (
                <div className="text-sm space-y-2">
                  <p className="font-semibold">
                    Se encontraron {detectionResult.descubrimientos.length} proyecto(s) con conflictos:
                  </p>
                  {detectionResult.descubrimientos.map((desc) => (
                    <div key={desc.id} className="bg-white/50 rounded p-3">
                      <p className="font-semibold">{desc.proyecto_titulo}</p>
                      <p className="text-xs mt-1">
                        {desc.cantidad_impactos} impacto(s) detectado(s)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <span className="ml-3 text-muted-foreground">Cargando documentos...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-[hsl(var(--border))]">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay documentos</h3>
          <p className="text-muted-foreground">
            Comienza subiendo tu primer documento para detectar conflictos
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-card rounded-lg border border-[hsl(var(--border))] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-lg">
                    <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-foreground">{doc.nombre}</h3>
                    <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(doc.fecha_carga)}
                      </span>
                      <span>
                        {doc.cantidad_descubrimientos} descubrimiento(s)
                      </span>
                    </div>
                    {doc.cantidad_descubrimientos > 0 && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Conflictos detectados
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-[hsl(var(--status-active))] text-white rounded">
                    Procesado
                  </span>
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.nombre)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Eliminar documento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
