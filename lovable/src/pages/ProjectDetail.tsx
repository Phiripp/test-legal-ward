import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X, ArrowLeft, FileText, Scale } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - en producción vendría de una API
  const project = {
    title: "Ley de Protección de Datos Personales",
    status: "En Comisión - Cámara de Diputados",
    impact: "Alto",
    category: "Legal / Compliance",
    dateIntroduced: "10 Diciembre 2023",
    fullText: "Esta ley tiene por objeto regular el tratamiento de los datos personales en posesión de particulares y entidades gubernamentales, con el fin de proteger los derechos de privacidad y autodeterminación informativa de las personas...",
    aiAnalysis: "Este proyecto de ley impacta directamente las operaciones de tu empresa en los siguientes aspectos: (1) Requerirá implementar nuevos controles de acceso y cifrado para datos de clientes, (2) Obligará a obtener consentimiento explícito para cualquier tratamiento de datos personales, (3) Establecerá responsabilidad administrativa con multas de hasta 5% de facturación anual por incumplimiento. Se recomienda iniciar auditoría de prácticas actuales de manejo de datos y preparar plan de implementación con plazos de 6 meses desde promulgación.",
    affectedDocuments: [
      {
        name: "Política de Privacidad Interna",
        chunk: "...La empresa recopila y procesa datos personales de clientes incluyendo nombre, email, dirección, número de teléfono y datos de pago. Esta información se utiliza para procesamiento de pedidos, comunicaciones de marketing y análisis de comportamiento del usuario...",
        relevance: 95,
      },
      {
        name: "Manual de RRHH",
        chunk: "...Se mantienen registros de empleados que incluyen datos personales, información médica, evaluaciones de desempeño y datos bancarios para procesamiento de nómina. El acceso a esta información está limitado al departamento de Recursos Humanos...",
        relevance: 87,
      },
      {
        name: "Contrato Marco de Servicios",
        chunk: "...El proveedor tendrá acceso a datos de clientes finales únicamente para efectos de prestación del servicio contratado, comprometiéndose a mantener confidencialidad de la información...",
        relevance: 78,
      },
    ],
    lawChunks: [
      {
        article: "Artículo 7",
        content: "El tratamiento de datos personales deberá contar con el consentimiento previo, expreso e informado del titular. El consentimiento deberá constar por escrito o por medios electrónicos equivalentes.",
      },
      {
        article: "Artículo 15",
        content: "Los responsables del tratamiento de datos deberán implementar medidas de seguridad técnicas y organizativas apropiadas para proteger los datos personales contra el acceso no autorizado, la pérdida, alteración o divulgación.",
      },
    ],
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Alto":
        return "bg-alert-high text-alert-high-foreground";
      case "Medio":
        return "bg-alert-medium text-alert-medium-foreground";
      case "Bajo":
        return "bg-alert-low text-alert-low-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/discoveries")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-normal">
              {project.status}
            </Badge>
            <Badge className={getImpactColor(project.impact)}>
              Impacto {project.impact}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {project.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <X className="mr-2 h-4 w-4" />
            Descartar
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Eye className="mr-2 h-4 w-4" />
            Dar Seguimiento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Afectados
            </CardTitle>
            <CardDescription>
              Secciones de tus documentos que se relacionan con este proyecto de ley
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.affectedDocuments.map((doc, index) => (
              <div key={index} className="space-y-2 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm">{doc.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {doc.relevance}% relevancia
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded">
                  {doc.chunk}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Artículos Relevantes del Proyecto
            </CardTitle>
            <CardDescription>
              Secciones del proyecto de ley que impactan tu operación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.lawChunks.map((chunk, index) => (
              <div key={index} className="space-y-2 pb-4 border-b border-border last:border-0 last:pb-0">
                <p className="font-semibold text-sm text-primary">{chunk.article}</p>
                <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded">
                  {chunk.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Impacto (IA)</CardTitle>
          <CardDescription>
            Análisis generado automáticamente sobre cómo este proyecto afecta tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{project.aiAnalysis}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Fecha de Ingreso
            </p>
            <p className="text-foreground">{project.dateIntroduced}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Estado Actual
            </p>
            <p className="text-foreground">{project.status}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Texto del Proyecto
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.fullText}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
