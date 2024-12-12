// import { User } from "../types/user";

// // Constantes
// const PREMIUM_DAILY_LIMIT = 80;
// const FREE_DAILY_LIMIT = 10;
// const FREE_TOTAL_DAYS = 4;

// interface SubscriptionLimits {
//   dailyLimit: number;
//   daysRemaining: number | null;
//   canApply: boolean;
//   reason?: string;
// }

// // Verifica se o usuário tem acesso premium válido
// function hasPremiumAccess(user: User): boolean {
//   const now = new Date();

//   const hasValidPayment = user.payment && 
//     user.payment.status === 'completed' && 
//     user.payment.endDate && 
//     new Date(user.payment.endDate) > now;

//   const hasActiveSubscription = user.subscription && 
//     user.subscription.status === 'active' || false;

//   return hasValidPayment || hasActiveSubscription;
// }

// // Calcula dias restantes do plano premium
// function calculatePremiumDaysRemaining(user: User): number {
//   const now = new Date();

//   if (user.payment?.endDate) {
//     const endDate = new Date(user.payment.endDate);
//     const diffTime = Math.abs(endDate.getTime() - now.getTime());
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   }

//   if (user.subscription?.status === 'active') {
//     return -1; // -1 indica ilimitado
//   }

//   return 0;
// }

// // Verifica status do período gratuito
// function checkFreeTrialStatus(user: User): {
//   canApply: boolean;
//   daysRemaining: number;
//   reason?: string;
// } {
//   const now = new Date();
//   const startDate = new Date(user.startDate);
//   const daysSinceStart = Math.floor(
//     (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
//   );

//   if (daysSinceStart >= FREE_TOTAL_DAYS) {
//     return {
//       canApply: false,
//       daysRemaining: 0,
//       reason: 'Free trial expired'
//     };
//   }

//   const canApply = user.dailyUsage < FREE_DAILY_LIMIT;
  
//   return {
//     canApply,
//     daysRemaining: FREE_TOTAL_DAYS - daysSinceStart,
//     reason: canApply ? undefined : 'Daily limit reached'
//   };
// }

// // Verifica status da assinatura e limites
// export function checkSubscriptionStatus(user: User): SubscriptionLimits {
//   if (hasPremiumAccess(user)) {
//     return {
//       dailyLimit: PREMIUM_DAILY_LIMIT,
//       daysRemaining: calculatePremiumDaysRemaining(user),
//       canApply: user.dailyUsage < PREMIUM_DAILY_LIMIT
//     };
//   }

//   if (user.planType === 'free') {
//     const freeTrialInfo = checkFreeTrialStatus(user);
//     return {
//       dailyLimit: FREE_DAILY_LIMIT,
//       daysRemaining: freeTrialInfo.daysRemaining,
//       canApply: freeTrialInfo.canApply,
//       reason: freeTrialInfo.reason
//     };
//   }

//   return {
//     dailyLimit: 0,
//     daysRemaining: 0,
//     canApply: false,
//     reason: 'Invalid subscription status'
//   };
// }

// // Verifica se o uso diário deve ser resetado
// export function shouldResetDailyUsage(user: User): boolean {
//   if (!user.lastUsage) return true;

//   const now = new Date();
//   const lastUsage = new Date(user.lastUsage);

//   return (
//     now.getDate() !== lastUsage.getDate() ||
//     now.getMonth() !== lastUsage.getMonth() ||
//     now.getFullYear() !== lastUsage.getFullYear()
//   );
// }

// // Verifica e atualiza o status do plano
// export function checkAndUpdatePlanStatus(user: User): { 
//   isValid: boolean; 
//   newPlanType: 'premium' | 'free' | 'none';
// } {
//   const now = new Date();

//   // Se nunca comprou e está com planType free, verifica período gratuito
//   if (!user.hasPurchased && user.planType === 'free') {
//     const startDate = new Date(user.startDate);
//     const daysSinceStart = Math.floor(
//       (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
//     );

//     if (daysSinceStart < FREE_TOTAL_DAYS) {
//       return { 
//         isValid: true,
//         newPlanType: 'free'
//       };
//     }
//   }

//   // Se já comprou, verifica se tem acesso válido
//   if (user.hasPurchased) {
//     if (hasPremiumAccess(user)) {
//       return { 
//         isValid: true, 
//         newPlanType: 'premium' 
//       };
//     }

//     return { 
//       isValid: false, 
//       newPlanType: 'free' 
//     };
//   }

//   return { 
//     isValid: false, 
//     newPlanType: 'free' 
//   };
// } 



// -> como vai funcionar o processo contra espertinhos:
// ao dar stop, sincroniza
// ao pegar um usuário novo no useeffect, sincroniza


