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
  emailLogin: {
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
  
  console.log("Auth URLs:", { configUrl, sessionUrl, authUrl });

  const updateSession = useMemo(
    () => async () => {
      console.log("Updating session from:", sessionUrl);
      try {
        const res = await fetch(sessionUrl, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        console.log("Session response status:", res.status, res.statusText);
        
        if (res.status === 200) {
          const data = await res.json();
          console.log("Session data:", data);
          setSession({
            ...data,
            authenticated: true,
          });
        } else {
          console.log("Session not authenticated, status:", res.status);
          setSession(ANON);
        }
      } catch (error) {
        console.error("Error updating session:", error);
        setSession(ANON);
      }
    },
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
    Promise.allSettled([
      fetch(configUrl, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Config fetch failed: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .catch((error) => {
          console.error("Error fetching config:", error);
          throw error;
        }),
      updateSession(),
    ]).then((results) => {
      const configResult = results[0];
      if (configResult.status !== "fulfilled") {
        console.error("Config fetch failed:", configResult.reason);
        setIsConfigured(true);
        return;
      }

      const configData = configResult.value?.data;
      console.log("Config data:", configData);

      // Only support email login, ignore social providers
      if (configData?.account?.login_methods?.includes("email")) {
        setConfig({
          emailLogin: {
            id: configData.account?.login_methods?.[0] || "email",
            login: async (email: string, password: string) => {
              const response = await fetch(`${authUrl}/browser/v1/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.errors?.[0]?.message || `Login failed: ${response.status}`);
              }
              
              return response.json();
            },
          },
        });
      } else {
        console.warn("Email login not available in config");
      }
      
      setIsConfigured(true);
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
