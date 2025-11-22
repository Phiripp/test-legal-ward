import { Box, Heading, Text, Flex } from "@seisveinte/react";
import { useAuth } from "../services/auth";

export function HomePage() {
  const { session } = useAuth();
  const userName = (session?.display ||
    session?.email?.split("@")[0] ||
    "Usuario") as string;

  return (
    <Box p="6">
      <Flex
        direction="column"
        gap="6"
        align="center"
        style={{ minHeight: "70vh" }}
        justify="center"
      >
        {/* Welcome Header */}
        <Box style={{ textAlign: "center", maxWidth: "600px" }}>
          <Heading size="9" mb="4">
            Welcome to Unholster Webapp Template
          </Heading>
          <Text size="5" color="gray" mb="4">
            With Django Allauth Auth Service
          </Text>
          <Text size="4" mb="2">
            ¡Bienvenido, {userName}!
          </Text>
          <Text size="3" color="gray">
            Esta es tu página principal. Navega usando el sidebar.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
