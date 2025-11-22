import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X, ExternalLink, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Discoveries = () => {
  const navigate = useNavigate();

  const discoveries = [
    {
      id: 1,
      title: "Ley de Protección de Datos Personales",
      description: "Regula el tratamiento de datos personales y establece nuevas obligaciones para empresas que procesan información de clientes.",
      impact: "Alto",
      category: "Legal / Compliance",
      affectedDocs: 3,
      date: "Ingresado: 10 Dic 2023",
    },
    {
      id: 2,
      title: "Reforma Laboral - Artículo 152",
      description: "Modifica los requisitos de contratos a plazo fijo y establece nuevas condiciones para terminación de contrato.",
      impact: "Alto",
      category: "Recursos Humanos",
      affectedDocs: 2,
      date: "Ingresado: 05 Ene 2024",
    },
    {
      id: 3,
      title: "Ley de Transparencia Corporativa",
      description: "Requiere divulgación pública de información financiera y estructura organizacional de empresas medianas y grandes.",
      impact: "Medio",
      category: "Financiero / Legal",
      affectedDocs: 4,
      date: "Ingresado: 20 Nov 2023",
    },
    {
      id: 4,
      title: "Modificación Ley de Seguridad en el Trabajo",
      description: "Actualiza protocolos de seguridad laboral y aumenta responsabilidades del empleador en prevención de riesgos.",
      impact: "Medio",
      category: "Recursos Humanos",
      affectedDocs: 2,
      date: "Ingresado: 15 Dic 2023",
    },
    {
      id: 5,
      title: "Ley de Sostenibilidad Ambiental Empresarial",
      description: "Establece metas de reducción de emisiones y reportes obligatorios de impacto ambiental.",
      impact: "Bajo",
      category: "Operacional / Legal",
      affectedDocs: 1,
      date: "Ingresado: 28 Dic 2023",
    },
  ];

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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Descubrimientos</h1>
        <p className="text-muted-foreground">
          Proyectos de ley que podrían afectar a tu empresa
        </p>
      </div>

      <div className="grid gap-4">
        {discoveries.map((discovery) => (
          <Card
            key={discovery.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/project/${discovery.id}`)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-alert-medium mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {discovery.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {discovery.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge className={getImpactColor(discovery.impact)}>
                    Impacto {discovery.impact}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{discovery.category}</span>
                    <span>•</span>
                    <span>{discovery.affectedDocs} documentos afectados</span>
                    <span>•</span>
                    <span>{discovery.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Lógica para descartar
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Descartar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/tracking");
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Dar Seguimiento
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${discovery.id}`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Discoveries;
