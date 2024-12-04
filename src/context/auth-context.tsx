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
export interface User {
  id: number;
}

export type UserFromApi = {
  email: string;
  password: string;
  name: string;
  id: number;
  expiration: Date | null;
  paymentDate: Date | null;
  hasPurchased: boolean;
};

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

async function decodeToken(token: string) {
  try {
    const response = await fetch(`${SERVER_URL}/decode-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json(); // Resultado da decodificação
    console.log("Token decodificado:", result);
    return result as { payload: { id: string } };
  } catch (error) {
    console.error("Erro ao fazer fetch:", error);
    return null;
  }
}

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

    const result: UserFromApi = (await response.json()).user;
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
    // Função assíncrona para verificar o token
    const verifyToken = async () => {
      const token = cookies.authToken;
      console.log("tokenn", token);
      if (token) {
        try {
          const jwt = await decodeToken(token);
          console.log("jwtjwt", jwt)
          setUser(jwt?.payload as unknown as User|null);
        } catch (err) {
          console.error(err);
          //removeCookieAction("authToken"); // Remover token inválido
        }
      }
    };

    verifyToken(); // Chamar a função assíncrona
  }, []);

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
