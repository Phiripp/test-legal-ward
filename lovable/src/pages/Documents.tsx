import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Documents = () => {
  const documents = [
    {
      name: "Memoria Anual 2023",
      type: "Reporte Corporativo",
      uploadDate: "15 Ene 2024",
      size: "2.4 MB",
      status: "Procesado",
    },
    {
      name: "Contrato Marco de Servicios",
      type: "Legal",
      uploadDate: "12 Ene 2024",
      size: "890 KB",
      status: "Procesado",
    },
    {
      name: "Política de Privacidad Interna",
      type: "Compliance",
      uploadDate: "10 Ene 2024",
      size: "456 KB",
      status: "Procesado",
    },
    {
      name: "Manual de RRHH",
      type: "Recursos Humanos",
      uploadDate: "08 Ene 2024",
      size: "1.8 MB",
      status: "Procesado",
    },
    {
      name: "Estatutos Societarios",
      type: "Legal",
      uploadDate: "05 Ene 2024",
      size: "1.2 MB",
      status: "Procesado",
    },
    {
      name: "Código de Ética Corporativa",
      type: "Compliance",
      uploadDate: "03 Ene 2024",
      size: "678 KB",
      status: "Procesado",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Documentos</h1>
          <p className="text-muted-foreground">
            Perfil corporativo y documentación analizada
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Upload className="mr-2 h-4 w-4" />
          Subir Documento
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{doc.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {doc.uploadDate}
                      </span>
                      <span>{doc.size}</span>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {doc.type}
                    </Badge>
                  </div>
                </div>
                <Badge className="bg-status-active text-white">
                  {doc.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Documents;
