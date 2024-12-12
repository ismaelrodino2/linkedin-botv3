import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { User } from '../types/user';
import { SignInFormData } from "../routes/login";
import { AuthService } from '../services/auth-service';
import { SubscriptionService } from '../services/subscription-service';

interface AuthContextType {
  user: User | null;
  login: (data: SignInFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  cookies: { authToken?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function verifyTokenAndReset() {
      const token = cookies.authToken;
      if (!token) return;

      try {
        const userData = await AuthService.getUserData(token);
        if (!userData) throw new Error('Invalid user data');

        // Verifica e atualiza status do plano
        const planStatus = SubscriptionService.checkAndUpdatePlanStatus(userData);
        if (userData.planType !== planStatus.newPlanType) {
          await AuthService.updateUser(token, { planType: planStatus.newPlanType });
          userData.planType = planStatus.newPlanType;
        }

        // Verifica e reseta uso diário se necessário
        if (SubscriptionService.shouldResetDailyUsage(userData)) {
          const updated = await AuthService.updateUser(token, {
            dailyUsage: 0,
            lastUsage: new Date()
          });
          if (updated) {
            userData.dailyUsage = 0;
            userData.lastUsage = new Date();
          }
        }

        setUser(userData);
      } catch (err) {
        console.error('Token verification error:', err);
        removeCookie("authToken");
        setUser(null);
      }
    }

    verifyTokenAndReset();
  }, [cookies.authToken, removeCookie]);

  const login = async (data: SignInFormData) => {
    try {
      const user = await AuthService.signIn(data.email, data.password);
      if (!user) throw new Error('Login failed');

      const token = await AuthService.generateToken(user);
      if (!token) throw new Error('Token generation failed');

      setCookie("authToken", token);
      setUser(user);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    removeCookie("authToken");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      cookies: { authToken: cookies.authToken }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
