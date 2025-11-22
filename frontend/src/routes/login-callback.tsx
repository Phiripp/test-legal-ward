import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../services/auth";
import { useEffect, useState } from "react";
import { Box, Text } from "@seisveinte/react";

export const Route = createFileRoute("/login-callback")({
  component: RouteComponent,
});

function RouteComponent() {
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, updateSession } = useAuth();

  useEffect(() => {
    if (!resolved) {
      // Agregar timeout para evitar que se quede en Loading... indefinidamente
      const timeoutId = setTimeout(() => {
        console.error("Timeout al actualizar sesión después del login");
        setError("Timeout al verificar la sesión. Por favor, intenta nuevamente.");
        setResolved(true);
      }, 10000); // 10 segundos de timeout

      updateSession()
        .catch((err) => {
          console.error("Error al actualizar sesión:", err);
          setError("Error al verificar la sesión. Por favor, intenta iniciar sesión nuevamente.");
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setResolved(true);
        });
    }
  }, [updateSession, resolved]);

  if (!resolved) {
    return (
      <Box>
        <Text size="3" color="gray" align="center">
          Loading...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text size="3" color="red" align="center">
          {error}
        </Text>
      </Box>
    );
  }

  return session.authenticated ? (
    <Navigate to="/" replace />
  ) : (
    <Box>
      <Text size="3" color="gray" align="center">
        Failed to login
      </Text>
    </Box>
  );
}
