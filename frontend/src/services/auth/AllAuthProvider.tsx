/** AuthContext provider for django-allauth headless API backend
 * - Uses Tanstack Router for navigation
 */
import { useEffect, useMemo, useState, createContext, useContext } from "react";

interface AuthenticatedSession {
  authenticated: true;
  id: number;
  email: string;
  display: string;
  [key: string]: unknown;
}

interface AnonymousSession {
  authenticated: false;
  id: null;
  email: null;
  display: null;
}

type Session = AuthenticatedSession | AnonymousSession;

type AllAuthProviderProps = {
  authUrl?: string;
  callbackUrl?: string;
  children: React.ReactNode;
};

type AllAuthConfig = {
  callbackUrl: string;
  loginUrl: string;
  providerLogin?: {
    id: string;
    loginUrl: string;
    callbackUrl: string;
  };
  emailLogin?: {
    id: string;
    login: (email: string, password: string) => Promise<unknown>;
  };
};

type AuthContextType = {
  config?: AllAuthConfig;
  isConfigured: boolean;
  session: Session;
  updateSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AUTH_URL = "/.auth/headless";

const ANON: Session = {
  authenticated: false,
  id: null,
  email: null,
  display: null,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AllAuthProvider({
  authUrl = AUTH_URL,
  callbackUrl = "/login-callback",
  children,
}: AllAuthProviderProps) {
  const [session, setSession] = useState<Session>(ANON);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [config, setConfig] = useState<AllAuthConfig | null>(null);

  const configUrl = `${authUrl}/browser/v1/config`;
  const sessionUrl = `${authUrl}/browser/v1/auth/session`;

  const updateSession = useMemo(
    () => async () =>
      await fetch(sessionUrl, {
        credentials: "include",
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          }
          throw new Error("Not authenticated");
        })
        .then((data) =>
          setSession({
            ...data,
            authenticated: true,
          })
        )
        .catch(() => {
          setSession(ANON);
        }),
    [sessionUrl]
  );

  const logout = useMemo(
    () => async () => {
      try {
        await fetch(sessionUrl, {
          method: "DELETE",
          credentials: "include",
        });
        setSession(ANON);
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
    [sessionUrl]
  );

  useEffect(() => {
    console.log("🔧 AllAuthProvider: Initializing, fetching config from:", configUrl);
    
    Promise.allSettled([
      fetch(configUrl, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          console.log("🔧 Config fetch response:", res.status, res.statusText);
          if (!res.ok) {
            throw new Error(`Config fetch failed: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .catch((error) => {
          console.error("❌ Error fetching config:", error);
          throw error;
        }),
      updateSession(),
    ]).then((results) => {
      const configResult = results[0];
      
      // SIEMPRE marcar como configurado, incluso si falla
      setIsConfigured(true);
      
      if (configResult.status !== "fulfilled") {
        console.error("❌ Config fetch failed:", configResult.reason);
        // Aún así, habilitar email login como fallback
        setConfig({
          callbackUrl,
          loginUrl: `${authUrl}/browser/v1/auth/login`,
          emailLogin: {
            id: "email",
            login: (email: string, password: string) =>
              fetch(`${authUrl}/browser/v1/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
              }).then((res) => {
                if (!res.ok) {
                  return res.json().then((data) => {
                    throw new Error(data.errors?.[0]?.message || `Login failed: ${res.status}`);
                  });
                }
                return res.json();
              }),
          },
        });
        return;
      }

      const configData = configResult.value;
      console.log("✅ Config data received:", configData);

      if (configData?.data?.socialaccount?.providers?.[0]) {
        console.log("🔧 Using social provider login");
        setConfig({
          ...configData.data,
          callbackUrl,
          loginUrl: `${authUrl}/browser/v1/auth/login`,
          providerLogin: {
            id: configData.data.socialaccount.providers[0].id,
            loginUrl: `${authUrl}/browser/v1/auth/provider/redirect`,
            callbackUrl,
          },
        });
      } else if (
        configData?.data?.account?.login_methods?.includes("email")
      ) {
        console.log("✅ Using email login");
        setConfig({
          ...configData.data,
          callbackUrl,
          loginUrl: `${authUrl}/browser/v1/auth/login`,
          emailLogin: {
            id: configData.data.account.login_methods[0] || "email",
            login: (email: string, password: string) =>
              fetch(`${authUrl}/browser/v1/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
              }).then((res) => {
                if (!res.ok) {
                  return res.json().then((data) => {
                    throw new Error(data.errors?.[0]?.message || `Login failed: ${res.status}`);
                  });
                }
                return res.json();
              }),
          },
        });
      } else {
        console.warn("⚠️ No email login found in config, enabling fallback");
        // Fallback: habilitar email login de todas formas
        setConfig({
          callbackUrl,
          loginUrl: `${authUrl}/browser/v1/auth/login`,
          emailLogin: {
            id: "email",
            login: (email: string, password: string) =>
              fetch(`${authUrl}/browser/v1/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
              }).then((res) => {
                if (!res.ok) {
                  return res.json().then((data) => {
                    throw new Error(data.errors?.[0]?.message || `Login failed: ${res.status}`);
                  });
                }
                return res.json();
              }),
          },
        });
      }
    }).catch((error) => {
      console.error("❌ Unexpected error in AllAuthProvider:", error);
      // Asegurarse de que siempre se marque como configurado
      setIsConfigured(true);
      // Habilitar login de email como último recurso
      setConfig({
        callbackUrl,
        loginUrl: `${authUrl}/browser/v1/auth/login`,
        emailLogin: {
          id: "email",
          login: (email: string, password: string) =>
            fetch(`${authUrl}/browser/v1/auth/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ email, password }),
            }).then((res) => {
              if (!res.ok) {
                return res.json().then((data) => {
                  throw new Error(data.errors?.[0]?.message || `Login failed: ${res.status}`);
                });
              }
              return res.json();
            }),
        },
      });
    });
  }, [authUrl, callbackUrl, configUrl, updateSession]);

  return (
    <AuthContext.Provider
      value={{
        config: config || undefined,
        isConfigured,
        session,
        updateSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
