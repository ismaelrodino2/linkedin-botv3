import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './auth-context';

interface SyncContextType {
  syncDailyUsage: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, cookies } = useAuth();

  const syncDailyUsage = async () => {
    if (!user || !cookies.authToken) return;

    const localDailyUsage = localStorage.getItem('dailyUsage');
    
    try {
      // Busca os dados atuais do usuário no banco
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/get-user-account`, {
        headers: {
          'Authorization': cookies.authToken,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data = await response.json();
      const serverDailyUsage = data.user.dailyUsage;

      // Se não existe contagem local, sincroniza com o servidor
      if (!localDailyUsage) {
        localStorage.setItem('dailyUsage', serverDailyUsage.toString());
        return;
      }

      const localCount = parseInt(localDailyUsage);

      // Se a contagem local for maior, atualiza o servidor
      if (localCount > serverDailyUsage) {
        const updateResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/update-user`, {
          method: 'PUT',
          headers: {
            'Authorization': cookies.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dailyUsage: localCount,
            lastUsage: new Date().toISOString()
          })
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update server daily usage');
        }
      } else if (localCount < serverDailyUsage) {
        // Se a contagem local for menor, atualiza o local
        localStorage.setItem('dailyUsage', serverDailyUsage.toString());
      }
      // Se forem iguais, não faz nada
    } catch (error) {
      console.error('Error syncing daily usage:', error);
    }
  };

  // Executa a sincronização quando o app iniciar e o usuário estiver logado
  useEffect(() => {
    if (user) {
      syncDailyUsage();
    }
  }, [user]);

  return (
    <SyncContext.Provider value={{ syncDailyUsage }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}; 