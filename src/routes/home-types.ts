interface Language {
    level: string;
    language: string;
  }
  
  interface Software {
    name: string;
    level: string;
    yearsOfExperience: string;
  }
  
  interface Availability {
    canTravel: boolean;
    needsSponsor: boolean;
    canWorkHybrid: boolean;
    immediateStart: boolean;
    canWorkInPerson: boolean;
  }
  
  interface Link {
    url: string;
    name: string;
  }
  
  interface Account {
    id: number;
    aboutMe: string;
    experience: string;
    links: Link[];
    availability: Availability;
    languages: Language[];
    softwares: Software[];
    softSkills: string;
    hardSkills: string;
    proficiency: string;
    cv1: string;
    cv1filePath: string;
    cv2: string;
    cv2filePath: string;
    coverLetter1: string;
    coverLetter1filePath: string;
    coverLetter2: string;
    coverLetter2filePath: string;
    technologies: { name: string; yearsOfExperience: string }[];
    createdAt: string;
    updatedAt: string;
  }
  
  interface User {
    id: number;
    name: string;
    email: string;
    expiration: null | string;
    paymentDate: null | string;
    hasPurchased: boolean;
    accountId: number;
    account: Account;
  }
  
  export interface UserResponse {
    user: User;
  }
  