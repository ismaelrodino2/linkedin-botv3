// export const enCV = "https://res.cloudinary.com/dntfrxqpw/image/upload/v1727919577/cv-en_vpjjhs.pdf"

import { updateUser } from "../services/auth-service";
import { User } from "../types/user";

// export const ptCV = "https://res.cloudinary.com/dntfrxqpw/image/upload/v1727919542/designer-pt.cv_ytlf90.pdf"

// export const enCL = "https://res.cloudinary.com/dntfrxqpw/image/upload/v1727920143/cl-en_hdarxo.pdf"
// export const ptCL = "https://res.cloudinary.com/dntfrxqpw/image/upload/v1727920143/cl-pt_ndqbox.pdf"

export function userLimit(user: User, token: string): number {
  switch (user.planType.toLowerCase()) {
    case "free":
      if (user.usedDaysFree < 4) {
        return 10;
      }

      updateUser(token, { planType: "none" });
      return 0;
    case "premium":
      return 80;
    default:
      return 0;
  }
}


