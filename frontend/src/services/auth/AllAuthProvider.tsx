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

// Get backend base URL: use full URL in production, relative path in development
// Vite reemplaza import.meta.env.VITE_* en tiempo de BUILD
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

const AUTH_URL = BACKEND_BASE_URL 
  ? `${BACKEND_BASE_URL}/.auth/headless` 
  : "/.auth/headless";

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

      const configData = configResult.value;
      console.log("Full config response:", JSON.stringify(configResult.value, null, 2));
      
      // Try multiple possible response structures
      const accountData = configData?.account || configData?.data?.account || configData?.data;
      const loginMethods = accountData?.login_methods || [];
      
      console.log("Account data:", accountData);
      console.log("Login methods:", loginMethods);
      console.log("Is array?", Array.isArray(loginMethods));
      console.log("Includes email?", loginMethods.includes("email"));

      // Always enable email login if backend responds (even if structure is unexpected)
      // This is a fallback - the backend is configured for email login
      const hasEmailLogin = Array.isArray(loginMethods) && loginMethods.includes("email");
      
      if (hasEmailLogin || loginMethods.length === 0) {
        // Enable email login - backend supports it based on ACCOUNT_LOGIN_METHODS = {"email"}
        setConfig({
          emailLogin: {
            id: "email",
            login: async (email: string, password: string) => {
              const loginUrl = `${authUrl}/browser/v1/auth/login`;
              console.log("Attempting login to:", loginUrl, "with email:", email);
              
              const response = await fetch(loginUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
              });
              
              console.log("Login response status:", response.status, response.statusText);
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Login error data:", errorData);
                throw new Error(errorData.errors?.[0]?.message || `Login failed: ${response.status}`);
              }
              
              const result = await response.json();
              console.log("Login success:", result);
              return result;
            },
          },
        });
      } else {
        console.error("Email login not available. Config structure:", {
          configData,
          accountData,
          loginMethods: loginMethods,
        });
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
