import { useState, useEffect } from "react";

let stopProcessing = false;
let listeners: ((value: boolean) => void)[] = [];

// Funções para gerenciar o valor global
export const getStopProcessing = () => stopProcessing;

// Custom hook para reatividade no React
export const useStopProcessing = () => {
  const [currentValue, setCurrentValue] = useState(stopProcessing);

  useEffect(() => {
    // Registrar o listener ao montar o componente
    const listener = (newValue: boolean) => setCurrentValue(newValue);
    listeners.push(listener);

    // Remover o listener ao desmontar o componente
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  // Retorna o valor atual e uma função para atualizá-lo
  return { isBrowserOpen: currentValue };
};
