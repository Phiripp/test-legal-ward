import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Tracking = () => {
  const navigate = useNavigate();

  const trackedProjects = [
    {
      id: 1,
      title: "Ley de Protección de Datos Personales",
      impact: "Alto",
      category: "Legal / Compliance",
      timeline: [
        { stage: "Ingreso", status: "completed", date: "10 Dic 2023" },
        { stage: "Comisión", status: "in-progress", date: "15 Ene 2024" },
        { stage: "Cámara de Diputados", status: "pending", date: null },
        { stage: "Senado", status: "pending", date: null },
        { stage: "Promulgación", status: "pending", date: null },
      ],
      lastUpdate: "Hace 2 días",
      updateDescription: "Ingresada indicación del Ejecutivo modificando Artículo 7",
    },
    {
      id: 2,
      title: "Reforma Laboral - Artículo 152",
      impact: "Alto",
      category: "Recursos Humanos",
      timeline: [
        { stage: "Ingreso", status: "completed", date: "05 Ene 2024" },
        { stage: "Comisión", status: "completed", date: "20 Ene 2024" },
        { stage: "Cámara de Diputados", status: "in-progress", date: "25 Ene 2024" },
        { stage: "Senado", status: "pending", date: null },
        { stage: "Promulgación", status: "pending", date: null },
      ],
      lastUpdate: "Hace 1 día",
      updateDescription: "Votación en general aprobada (89 votos a favor, 45 en contra)",
    },
    {
      id: 3,
      title: "Ley de Transparencia Corporativa",
      impact: "Medio",
      category: "Financiero / Legal",
      timeline: [
        { stage: "Ingreso", status: "completed", date: "20 Nov 2023" },
        { stage: "Comisión", status: "completed", date: "10 Dic 2023" },
        { stage: "Cámara de Diputados", status: "completed", date: "18 Dic 2023" },
        { stage: "Senado", status: "in-progress", date: "08 Ene 2024" },
        { stage: "Promulgación", status: "pending", date: null },
      ],
      lastUpdate: "Hace 5 días",
      updateDescription: "Aprobada en particular en Senado, vuelve a Cámara por modificaciones",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-status-active" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-status-pending" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-status-inactive" />;
      default:
        return null;
    }
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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Seguimiento</h1>
        <p className="text-muted-foreground">
          Proyectos de ley que estás monitoreando activamente
        </p>
      </div>

      <div className="grid gap-6">
        {trackedProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription>{project.category}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(project.impact)}>
                    Impacto {project.impact}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timeline */}
              <div className="relative">
                <div className="absolute top-0 left-2 h-full w-0.5 bg-border" />
                <div className="space-y-4">
                  {project.timeline.map((milestone, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                      <div className="relative z-10 bg-card">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-medium text-sm ${
                              milestone.status === "completed"
                                ? "text-status-active"
                                : milestone.status === "in-progress"
                                ? "text-status-pending"
                                : "text-muted-foreground"
                            }`}
                          >
                            {milestone.stage}
                          </p>
                          {milestone.date && (
                            <span className="text-xs text-muted-foreground">
                              {milestone.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Update */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Última Actualización
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {project.lastUpdate}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.updateDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tracking;
