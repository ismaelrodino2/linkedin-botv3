import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { SignInFormData } from "../routes/login";

// Tipos
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface Account {
  cv1: string | null;
  cv2: string | null;
  coverLetter1: string | null;
  coverLetter2: string | null;
  aboutMe: string;
  experience: string;
  links: JsonValue;
  availability: JsonValue;
  languages: JsonValue;
  softwares: JsonValue;
  softSkills: string;
  hardSkills: string;
  proficiency: string;
  technologies: JsonValue;
  desiredSalaries: JsonValue | null;
  id: number;
  cv1filePath: string | null;
  cv2filePath: string | null;
  coverLetter1filePath: string | null;
  coverLetter2filePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  expiration: Date | null;
  paymentDate: Date | null;
  hasPurchased: boolean;
  accountId: number | null;
  account: Account | null;
}

interface AuthContextType {
  user: User | null;
  login: (data: SignInFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Configuração do JWT

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function signIn(email: string, password: string) {
  try {
    const response = await fetch(`${SERVER_URL}/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro:", errorData.response || errorData.error);
      return;
    }

    const result = (await response.json()).user;
    console.log("Sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro na requisição:", error);
    return;
  }
}

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = cookies.authToken;
      if (token) {
        try {
          const response = await fetch(`${SERVER_URL}/get-user-account`, {
            method: "GET",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error('Token inválido');
          }

          const userData = await response.json();
          setUser(userData); // Salva os dados do usuário retornados pela API
        } catch (err) {
          console.error('Erro ao verificar token:', err);
          removeCookie("authToken"); // Remove o token se for inválido
          setUser(null);
        }
      }
    };

    verifyToken();
  }, [cookies.authToken, removeCookie]); // Adicionei as dependências do useEffect

  async function generateToken(user: User) {
    const response = await fetch(`${SERVER_URL}/encode-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { id: user.id } }),
    });

    const data = await response.json();
    console.log("Generated Token:", data.token);
    return data.token
  }

  const login = async (data: SignInFormData) => {
    try {
      console.log("dataa", data);
      // Faça login e receba o token
      const user = await signIn(data.email, data.password);
      if (user) {
        console.log("o user é:", user)
        const token = await generateToken(user);

        console.log("Token recebido:", token);

        // Salve o token no cookie (evite JSON.stringify, já que o token é uma string)
        setCookie("authToken", token);

        setUser(user); // Salva o usuário no estado
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  };

  const logout = async () => {
    removeCookie("authToken");
    setUser(null);
    navigate("/");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
