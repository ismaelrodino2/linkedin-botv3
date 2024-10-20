// const today = new Date();

// const generalInfo = `Gabriel Cunha | UI/UX & Mobile Designer | Rio de Janeiro, Brazil | Email: designbycunha@gmail.com | LinkedIn: www.linkedin.com/in/cunha2c | Portfolio: www.behance.net/gabrielcunha5 | Summary: Dedicated UI/UX designer with a passion for learning and overcoming challenges. Experienced with Figma, and committed to working in leading teams. | Experience: UI Designer, i2 Capital (May–Aug 2024): Led design projects, UX research, prototypes. | Social Media Manager, Torie Propaganda (Jan 2024–Present): Managed content creation and social media strategy. | UI/UX Designer, Curiba (Jan 2023–Mar 2024): Specialized in design systems, color theory, typography. | Freelance (Nov 2023–Jan 2024): E-commerce project development. | Social Media Manager, beofficesbrasil (May–Dec 2021): Digital marketing and social media strategies. | Languages: English, Spanish, Portuguese. Available immediately. Desired salary: 40,000 USD. Earliest start date: ${today}. Location: Rua Álvaro Proença, Parque São Nicolau.`;

// export const globalPrompt = `You are a highly experienced UI/UX and Mobile Designer named Gabriel Cunha. Your role is to fill out job application forms using the information provided below. Respond confidently as if you were Gabriel, using your expertise in UI/UX to frame answers. Keep responses relevant to your profile and concise. If any details are missing, create plausible responses that align with Gabriel's professional background. The date is ${today}. Here is Gabriel's personal and professional information:
// ${generalInfo}
// Your goal is to present Gabriel as an ideal candidate for design roles. Always provide an appropriate response, avoid leaving blanks, and do not ask for more information. If necessary, invent details to fill gaps.`; 



// Função para criar o globalPrompt
// Função para criar o globalPrompt
function createGlobalPrompt({
  name,
  role,
  location,
  email,
  linkedin,
  portfolio,
  summary,
  experiences,
  languages,
  availability,
  desiredSalary,
  startDate,
  address,
}: {
  name: string;
  role: string;
  location: string;
  email: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experiences: string;
  languages: string;
  availability: string;
  desiredSalary: string;
  startDate: Date | string;
  address: string;
}) {
  const today = new Date();

  const generalInfo = `${name} | ${role} | ${location} | Email: ${email} | LinkedIn: ${linkedin} | Portfolio: ${portfolio} | Summary: ${summary} | Experience: ${experiences} | Languages: ${languages}. Available: ${availability}. Desired salary: ${desiredSalary}. Earliest start date: ${startDate}. Location: ${address}.`;

  const globalPrompt = `You are a highly experienced ${role} named ${name}. Your role is to fill out job application forms using the information provided below. Respond confidently as if you were ${name}, using your expertise in ${role.split("&")[0].trim()} to frame answers. Keep responses relevant to your profile and concise. If any details are missing, create plausible responses that align with ${name}'s professional background. The date is ${today}. Here is ${name}'s personal and professional information:
${generalInfo}
Your goal is to present ${name} as an ideal candidate for design roles. Always provide an appropriate response, avoid leaving blanks, and do not ask for more information. If necessary, invent details to fill gaps.`;

  // Armazenar o prompt globalmente
  (global as any).globalPrompt = globalPrompt;

  return globalPrompt;
}

// Exemplo de uso
createGlobalPrompt({
  name: "Gabriel Cunha",
  role: "UI/UX & Mobile Designer",
  location: "Rio de Janeiro, Brazil",
  email: "designbycunha@gmail.com",
  linkedin: "www.linkedin.com/in/cunha2c",
  portfolio: "www.behance.net/gabrielcunha5",
  summary: "Dedicated UI/UX designer with a passion for learning and overcoming challenges. Experienced with Figma, and committed to working in leading teams.",
  experiences: "UI Designer, i2 Capital (May–Aug 2024): Led design projects, UX research, prototypes. | Social Media Manager, Torie Propaganda (Jan 2024–Present): Managed content creation and social media strategy. | UI/UX Designer, Curiba (Jan 2023–Mar 2024): Specialized in design systems, color theory, typography. | Freelance (Nov 2023–Jan 2024): E-commerce project development. | Social Media Manager, beofficesbrasil (May–Dec 2021): Digital marketing and social media strategies.",
  languages: "English, Spanish, Portuguese",
  availability: "Immediately",
  desiredSalary: "40,000 USD",
  startDate: new Date(),
  address: "Rua Álvaro Proença, Parque São Nicolau",
});

// Agora a variável globalPrompt está disponível globalmente
console.log(global.globalPrompt);
