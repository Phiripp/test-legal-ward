import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y preferencias
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
          <CardDescription>
            Datos corporativos para personalizar el análisis legislativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Nombre de la Empresa</Label>
            <Input id="company" placeholder="TechCorp S.A." defaultValue="TechCorp S.A." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industria</Label>
            <Input id="industry" placeholder="Tecnología" defaultValue="Tecnología y Servicios" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employees">Número de Empleados</Label>
            <Input id="employees" type="number" placeholder="150" defaultValue="150" />
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Configura cómo y cuándo recibir alertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Nuevos Descubrimientos</p>
              <p className="text-sm text-muted-foreground">
                Recibe alertas cuando se detecten nuevos proyectos de ley relevantes
              </p>
            </div>
            <Button variant="outline" size="sm">
              Activado
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Actualizaciones de Seguimiento</p>
              <p className="text-sm text-muted-foreground">
                Notificaciones sobre cambios en proyectos que sigues
              </p>
            </div>
            <Button variant="outline" size="sm">
              Activado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
