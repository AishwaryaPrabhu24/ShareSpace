
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in session when the application loads
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("sharespace_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("sharespace_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    const token = response.data.access_token;

    localStorage.setItem("sharespace_token", token);

    try {
      const profileResponse = await api.get("/api/auth/me");
      setUser(profileResponse.data);

      return profileResponse.data;
    } catch (error) {
      localStorage.removeItem("sharespace_token");
      setUser(null);
      throw error;
    }
  };

  // Register a new Seeker
  const register = async (fullName, email, password) => {
    const response = await api.post("/api/auth/register", {
      full_name: fullName,
      email,
      password,
    });

    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("sharespace_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication details from any component
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
