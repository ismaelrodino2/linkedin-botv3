export const returnStartService = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3001/return-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const message = await response.text();
        console.log(message); // Exibe: "Processamento será interrompido."
      } else {
        console.error('Falha ao interromper o processamento');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };
  

  