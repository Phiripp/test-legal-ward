import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Box, Flex, Heading, Button, Text } from "@seisveinte/react";
import { useAuth } from "../services/auth";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { session, config, isConfigured } = useAuth();

  if (session.authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gray-2)",
      }}
    >
      <Box
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          background: "var(--gray-1)",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Flex direction="column" gap="4">
          <Heading size="6" weight="bold" align="center">
            Login
          </Heading>
          {!isConfigured ? (
            <Text size="3" color="gray" align="center">
              Loading...
            </Text>
          ) : config?.emailLogin ? (
            <EmailPasswordLogin emailLogin={config.emailLogin} />
          ) : (
            <Text size="3" color="red" align="center">
              Email login not available. Please check backend configuration.
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
}

type EmailPasswordLoginProps = {
  emailLogin: {
    login: (email: string, password: string) => Promise<unknown>;
  };
};

function EmailPasswordLogin({
  emailLogin: { login },
}: EmailPasswordLoginProps) {
  const { updateSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email) return "Email is required";
    return "";
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password) return "Password is required";
    return "";
  }, [password, touched.password]);

  const canSubmit = useMemo(() => !isLoading, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    setIsLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      console.log("Login response:", data);
      
      if (data && typeof data === 'object' && 'errors' in data) {
        const errorData = data as { errors?: { message: string }[] };
        if (errorData.errors && errorData.errors.length > 0) {
          setError(errorData.errors.map((error) => error.message).join("\n"));
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } else {
        // Login successful
        await updateSession();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Error logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Text size="3" color="gray" align="center">
        Enter your credentials to access
      </Text>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Flex direction="column" gap="4">
          <Box>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${
                  emailError ? "var(--red-9)" : "var(--gray-6)"
                }`,
                borderRadius: "6px",
                fontSize: "1rem",
                background: "var(--gray-1)",
                color: "var(--gray-12)",
              }}
            />
            {emailError && (
              <Text size="2" color="red" style={{ marginTop: "0.5rem" }}>
                {emailError}
              </Text>
            )}
          </Box>
          <Box>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${
                  passwordError ? "var(--red-9)" : "var(--gray-6)"
                }`,
                borderRadius: "6px",
                fontSize: "1rem",
                background: "var(--gray-1)",
                color: "var(--gray-12)",
              }}
            />
            {passwordError && (
              <Text size="2" color="red" style={{ marginTop: "0.5rem" }}>
                {passwordError}
              </Text>
            )}
          </Box>
          {error && (
            <Box
              style={{
                padding: "0.75rem",
                background: "var(--red-2)",
                border: "1px solid var(--red-6)",
                borderRadius: "6px",
              }}
            >
              <Text size="2" color="red">
                {error}
              </Text>
            </Box>
          )}
          <Button type="submit" disabled={!canSubmit} style={{ width: "100%" }}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Flex>
      </form>
    </>
  );
}
