import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("gc_token");
    const storedUser = localStorage.getItem("gc_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("gc_token");
        localStorage.removeItem("gc_user");
      }
    }
  }, []);

  function login(user: AuthUser, token: string) {
    setUser(user);
    setToken(token);
    localStorage.setItem("gc_token", token);
    localStorage.setItem("gc_user", JSON.stringify(user));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("gc_token");
    localStorage.removeItem("gc_user");
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAdmin: user?.role === "admin",
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
