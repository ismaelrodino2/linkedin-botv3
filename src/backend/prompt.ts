import { User } from "../types/user";

export function createGlobalPrompt({ name, account, email }: User) {
  const today = new Date();
  if (!account) return new Error("No account found");

  const {
    aboutMe,
    availability,
    experience,
    hardSkills,
    languages,
    links,
    proficiency,
    softSkills,
    technologies,
    desiredSalaries,
  } = account;

  // Formata os links em uma string legível
  const formattedLinks = links
    .map((link) => `${link.name}: ${link.url}`)
    .join(" | ");

  // Formata as linguagens em uma string legível
  const formattedLanguages = languages
    .map((lang) => `${lang.language} (${lang.level})`)
    .join(", ");

  // Formata as tecnologias em uma string legível
  const formattedTechnologies = technologies
    .map((tech) => `${tech.name} (${tech.yearsOfExperience} years)`)
    .join(", ");

  // Formata a disponibilidade em uma string legível
  const formattedAvailability = [
    availability.canTravel && "Available to travel",
    availability.canWorkInPerson && "Can work in person",
    availability.canWorkHybrid && "Available for hybrid work",
    availability.immediateStart && "Available for immediate start",
    availability.needsSponsor && "Needs visa sponsorship",
  ]
    .filter(Boolean)
    .join(", ");

  // Formata os salários desejados em uma string legível
  const formattedSalaries =
    desiredSalaries
      ?.map((salary) => `${salary.country}: ${salary.amount}`)
      .join(", ") || "Negotiable";

  const generalInfo = `
Professional Profile:
Name: ${name}
Role: ${proficiency}
Email: ${email}

About Me:
${aboutMe}

Professional Experience:
${experience}

Technical Skills:
Hard Skills: ${hardSkills}
Technologies: ${formattedTechnologies}
Soft Skills: ${softSkills}

Languages: ${formattedLanguages}

Availability: ${formattedAvailability}
Desired Salary: ${formattedSalaries}

Professional Links:
${formattedLinks}
`.trim();

  const globalPrompt = `You are acting as ${name}, a ${proficiency}. Your role is to fill out job application forms and respond to job-related questions using the information provided below. 

Here is your professional profile:

${generalInfo}

Instructions:
1. Respond as if you are ${name}, using first-person perspective
2. Keep responses professional, relevant, and concise
3. Use the provided experience and skills to frame your answers
4. If specific details are needed but not provided, create reasonable responses that align with the overall profile
5. Maintain consistency with the professional background provided
6. The current date is ${today.toLocaleDateString()}
7. If the question is about the city, please respond in the format: "City, Country" (e.g., "Rio de Janeiro, Brazil").
8. If the question is about email, please respond it fully including @service.com.

Your goal is to present yourself (${name}) as an ideal candidate for ${proficiency} roles. Always provide appropriate responses that highlight your relevant experience and skills. If necessary, elaborate on the provided information while staying consistent with your professional background.`;

  // Armazenar o prompt globalmente
  (global as any).globalPrompt = globalPrompt;

  return globalPrompt;
}

export function setPromptLanguage(language: string) {
  const basePrompt = (global as any).globalPrompt || "";
  const updatedPrompt = `${basePrompt}\nPlease generate all responses in ${language}.`;
  (global as any).globalPrompt = updatedPrompt;
  return updatedPrompt;
}
