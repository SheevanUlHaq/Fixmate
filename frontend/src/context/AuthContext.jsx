import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("fixmate_token", data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("fixmate_token", data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem("fixmate_token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("fixmate_token");
    if (!token) return setLoading(false);
    api
      .get("/auth/me")
      .then(({ data }) => {
        const u = data.data.user;
        setUser({ id: u._id, name: u.name, email: u.email, role: u.role });
      })
      .catch(() => localStorage.removeItem("fixmate_token"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
