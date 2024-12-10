import { useCallback } from 'react';
import { useAuth } from "../context/auth-context";

export const useHome = () => {
  const { user } = useAuth();

  const handleOpenBrowser = useCallback(async () => {
    if (!user || !user.account) {
      console.error("Dados do usuário não disponíveis");
      return;
    }

    const profileData = {
      name: user.name,
      role: user.account.proficiency, // assumindo que proficiency é o cargo/role
      location: "Remote", // você pode adicionar location no Account se necessário
      email: user.email,
      linkedin: user.account.links?.linkedin || "", // assumindo que links tem uma propriedade linkedin
      portfolio: user.account.links?.portfolio || "",
      summary: user.account.aboutMe,
      experiences: user.account.experience,
      languages: user.account.languages,
      availability: user.account.availability,
      desiredSalary: user.account.desiredSalaries,
      address: "", // você pode adicionar address no Account se necessário
      softSkills: user.account.softSkills,
      hardSkills: user.account.hardSkills,
      technologies: user.account.technologies
    };

    const url = "http://localhost:3001/open";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: profileData }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [user]);

  return {
    handleOpenBrowser
  };
} 