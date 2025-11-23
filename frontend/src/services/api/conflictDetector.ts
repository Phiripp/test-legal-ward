// Helper para construir URLs de API
const getApiUrl = (path: string): string => {
  return import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}${path}`
    : path;
};

// ============================================
// INTERFACES
// ============================================

export interface ImpactoDescubierto {
  id: number;
  articulo_numero: number;
  extracto_interno: string;
  extracto_articulo: string;
  nivel_relevancia: number;
  descripcion_impacto: string;
  created_at: string;
}

export interface DescubrimientoConflicto {
  id: number;
  proyecto_id: string;
  proyecto_titulo: string;
  descripcion_impacto_consolidada: string | null;
  fecha_analisis: string;
  impactos: ImpactoDescubierto[];
}

export interface DocumentoList {
  id: number;
  nombre: string;
  fecha_carga: string;
  cantidad_descubrimientos: number;
}

export interface DocumentoDetail {
  id: number;
  nombre: string;
  fecha_carga: string;
  descubrimientos: DescubrimientoConflicto[];
}

export interface DetectConflictsResponse {
  documento_id: number;
  documento_nombre: string;
  fecha_carga: string;
  descubrimientos: Array<{
    id: number;
    proyecto_id: string;
    proyecto_titulo: string;
    descripcion_impacto_consolidada: string;
    cantidad_impactos: number;
  }>;
}

export interface DescubrimientoList {
  id: number;
  proyecto_id: string;
  proyecto_titulo: string;
  descripcion_impacto_consolidada: string | null;
  fecha_analisis: string;
  cantidad_impactos: number;
  documento_nombre: string;
  documento_id: number;
}

export interface DescubrimientoDetail {
  id: number;
  proyecto_id: string;
  proyecto_titulo: string;
  descripcion_impacto_consolidada: string | null;
  fecha_analisis: string;
  documento: DocumentoList;
  impactos: ImpactoDescubierto[];
}

// ============================================
// FUNCIONES DE API
// ============================================

export async function detectConflicts(
  file: File
): Promise<DetectConflictsResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(getApiUrl('/api/conflict-detector/detect'), {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al detectar conflictos: ${error}`);
  }

  return response.json();
}

export async function listDocuments(): Promise<DocumentoList[]> {
  const response = await fetch(getApiUrl('/api/conflict-detector/documents'), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al listar documentos: ${error}`);
  }

  return response.json();
}

export async function getDocumentDetail(
  documentId: number
): Promise<DocumentoDetail> {
  const response = await fetch(
    getApiUrl(`/api/conflict-detector/documents/${documentId}`),
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al obtener detalles del documento: ${error}`);
  }

  return response.json();
}

export async function deleteDocument(
  documentId: number
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    getApiUrl(`/api/conflict-detector/documents/${documentId}`),
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al eliminar documento: ${error}`);
  }

  return response.json();
}

export async function listDiscoveries(): Promise<DescubrimientoList[]> {
  const response = await fetch(
    getApiUrl('/api/conflict-detector/discoveries'),
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al listar descubrimientos: ${error}`);
  }

  return response.json();
}

export async function getDiscoveryDetail(
  discoveryId: number
): Promise<DescubrimientoDetail> {
  const response = await fetch(
    getApiUrl(`/api/conflict-detector/discoveries/${discoveryId}`),
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al obtener detalles del descubrimiento: ${error}`);
  }

  return response.json();
}

