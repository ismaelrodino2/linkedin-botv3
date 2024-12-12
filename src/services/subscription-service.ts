import { User } from "../types/user";

interface SubscriptionLimits {
  dailyLimit: number;
  daysRemaining: number | null;
  canApply: boolean;
  reason?: string;
}

export class SubscriptionService {
  private static PREMIUM_DAILY_LIMIT = 80;
  private static FREE_DAILY_LIMIT = 10;
  private static FREE_TOTAL_DAYS = 4;

  static checkSubscriptionStatus(user: User): SubscriptionLimits {
    // Verifica se é usuário premium (tem pagamento válido)
    if (this.hasPremiumAccess(user)) {
      return {
        dailyLimit: this.PREMIUM_DAILY_LIMIT,
        daysRemaining: this.calculatePremiumDaysRemaining(user),
        canApply: user.dailyUsage < this.PREMIUM_DAILY_LIMIT
      };
    }

    // Usuário free
    if (user.planType === 'free') {
      const freeTrialInfo = this.checkFreeTrialStatus(user);
      return {
        dailyLimit: this.FREE_DAILY_LIMIT,
        daysRemaining: freeTrialInfo.daysRemaining,
        canApply: freeTrialInfo.canApply,
        reason: freeTrialInfo.reason
      };
    }

    return {
      dailyLimit: 0,
      daysRemaining: 0,
      canApply: false,
      reason: 'Invalid subscription status'
    };
  }

  private static hasPremiumAccess(user: User): boolean {
    const now = new Date();

    // Verifica pagamento único válido
    const hasValidPayment = user.payment && 
      user.payment.status === 'completed' && 
      user.payment.endDate && 
      new Date(user.payment.endDate) > now;

    // Verifica assinatura ativa
    const hasActiveSubscription = user.subscription && 
      user.subscription.status === 'active';

    return hasValidPayment || hasActiveSubscription || false;
  }

  private static calculatePremiumDaysRemaining(user: User): number {
    const now = new Date();

    if (user.payment?.endDate) {
      const endDate = new Date(user.payment.endDate);
      const diffTime = Math.abs(endDate.getTime() - now.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Para assinatura ativa, retorna null (ilimitado enquanto ativo)
    if (user.subscription?.status === 'active') {
      return -1; // -1 indica ilimitado
    }

    return 0;
  }

  private static checkFreeTrialStatus(user: User): {
    canApply: boolean;
    daysRemaining: number;
    reason?: string;
  } {
    const now = new Date();
    const startDate = new Date(user.startDate);
    const daysSinceStart = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Verifica se ainda está dentro dos 4 dias
    if (daysSinceStart >= this.FREE_TOTAL_DAYS) {
      return {
        canApply: false,
        daysRemaining: 0,
        reason: 'Free trial expired'
      };
    }

    // Verifica se ainda tem aplicações disponíveis hoje
    const canApply = user.dailyUsage < this.FREE_DAILY_LIMIT;
    
    return {
      canApply,
      daysRemaining: this.FREE_TOTAL_DAYS - daysSinceStart,
      reason: canApply ? undefined : 'Daily limit reached'
    };
  }

  static shouldResetDailyUsage(user: User): boolean {
    if (!user.lastUsage) return true;

    const now = new Date();
    const lastUsage = new Date(user.lastUsage);

    return (
      now.getDate() !== lastUsage.getDate() ||
      now.getMonth() !== lastUsage.getMonth() ||
      now.getFullYear() !== lastUsage.getFullYear()
    );
  }

  static checkAndUpdatePlanStatus(user: User): { 
    isValid: boolean; 
    newPlanType: 'premium' | 'free' | 'none';
  } {
    const now = new Date();

    // Verifica pagamento único válido
    const hasValidPayment = user.payment && 
      user.payment.status === 'completed' && 
      user.payment.endDate && 
      new Date(user.payment.endDate) >= now;

    // Verifica assinatura ativa
    const hasActiveSubscription = user.subscription && 
      user.subscription.status.toLowerCase() === 'active';

    // Se tem alguma forma válida de pagamento, mantém premium
    if (hasValidPayment || hasActiveSubscription) {
      return { 
        isValid: true, 
        newPlanType: 'premium' 
      };
    }

    // Se não tem pagamento válido, verifica se está no período gratuito
    const startDate = new Date(user.startDate);
    const daysSinceStart = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceStart < this.FREE_TOTAL_DAYS) {
      return { 
        isValid: true, 
        newPlanType: 'free' 
      };
    }

    // Se não tem nada válido, muda para 'none'
    return { 
      isValid: false, 
      newPlanType: 'none' 
    };
  }
} 