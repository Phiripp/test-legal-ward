import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, Eye, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Documentos Subidos",
      value: "24",
      description: "En tu perfil corporativo",
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Descubrimientos Activos",
      value: "8",
      description: "Proyectos de ley detectados",
      icon: AlertTriangle,
      color: "text-alert-medium",
    },
    {
      title: "En Seguimiento",
      value: "5",
      description: "Proyectos monitoreados",
      icon: Eye,
      color: "text-status-active",
    },
    {
      title: "Alto Impacto",
      value: "2",
      description: "Requieren atención urgente",
      icon: TrendingUp,
      color: "text-alert-high",
    },
  ];

  const recentActivity = [
    {
      project: "Ley de Protección de Datos Personales",
      status: "Nueva coincidencia",
      impact: "Alto",
      date: "Hace 2 horas",
    },
    {
      project: "Reforma Laboral - Art. 152",
      status: "Actualización disponible",
      impact: "Medio",
      date: "Hace 5 horas",
    },
    {
      project: "Ley de Transparencia Corporativa",
      status: "Votación en Senado",
      impact: "Alto",
      date: "Hace 1 día",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tu radar legislativo corporativo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas actualizaciones en proyectos de ley relevantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {activity.project}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.status}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      activity.impact === "Alto"
                        ? "bg-alert-high text-alert-high-foreground"
                        : "bg-alert-medium text-alert-medium-foreground"
                    }`}
                  >
                    {activity.impact}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {activity.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
