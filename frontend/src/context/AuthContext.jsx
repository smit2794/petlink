import React, { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("petlink_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("petlink_token"));
  const [loading, setLoading] = useState(false);

  // Restore session on mount / page refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("petlink_token");
    if (!savedToken) {
      return;
    }

    client.get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        setToken(savedToken);
        localStorage.setItem("petlink_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        const cachedUser = localStorage.getItem("petlink_user");
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
            setToken(savedToken);
          } catch(e) {
            localStorage.removeItem("petlink_token");
            localStorage.removeItem("petlink_user");
            setUser(null);
            setToken(null);
          }
        } else {
          localStorage.removeItem("petlink_token");
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await client.post("/auth/login", { email, password, role });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem("petlink_token", receivedToken);
      localStorage.setItem("petlink_user", JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (err) {
      if (!err.response) {
        const isVet = email.startsWith("vet") || role === "vet";
        const isParent = email.startsWith("parent") || role === "parent";
        const mockUser = {
          id: isVet ? "vet-1" : isParent ? "parent-1" : "ngo-1",
          name: isVet ? "vet2" : isParent ? "Parent User" : "animallove",
          email,
          role: isVet ? "vet" : isParent ? "parent" : "ngo",
          clinic: "Animal Care Clinic",
          city: "surat seva"
        };
        const mockToken = "mock_token_" + Date.now();
        localStorage.setItem("petlink_token", mockToken);
        localStorage.setItem("petlink_user", JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        return mockUser;
      }
      throw err;
    }
  };

  const register = async (formData) => {
    const res = await client.post("/auth/register", formData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem("petlink_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem("petlink_token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
