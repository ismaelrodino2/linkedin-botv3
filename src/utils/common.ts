import { JobInfo } from "../backend/types";
import { updateUser } from "../services/auth-service";
import { User } from "../types/user";

function isTodayGreaterThanLastUsage(lastUsage: Date | null): boolean {
  if (lastUsage) {
    const lastUsageDate = new Date(lastUsage);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    lastUsageDate.setHours(0, 0, 0, 0);

    return today > lastUsageDate;
  }
  return false;
}

export function userLimit(user: User, token: string): number {
  switch (user.planType.toLowerCase()) {
    case "free":
      if (user.usedDaysFree < 4) {
        return 10;
      }

      if (user.planType !== "none") updateUser(token, { planType: "none" });
      return 0;
    case "premium":
      return 80;
    default:
      return 0;
  }
}

export function userLimitOnly(user: User): number {
  switch (user.planType.toLowerCase()) {
    case "free":
      if (user.usedDaysFree < 4) {
        return 10;
      }

      return 0;
    case "premium":
      return 80;
    default:
      return 0;
  }
}

export async function resetIfNextDay(
  user: User,
  token: string,
  setAppliedJobs: React.Dispatch<React.SetStateAction<JobInfo[]>>,
  setWebsocketCount: React.Dispatch<React.SetStateAction<number>>
) {
  if (
    user.planType === "premium" &&
    isTodayGreaterThanLastUsage(user.lastUsage)
  ) {
    await updateUser(token, {
      dailyUsage: 0,
    });
    // localStorage.setItem("appliedJobs", JSON.stringify({ appliedJobs: 0 }));
    setAppliedJobs([]);
    setWebsocketCount(0);
  }

  console.log("qqq", import.meta.env.VITE_FREE_TOTAL_DAYS, isTodayGreaterThanLastUsage(user.lastUsage), user.usedDaysFree)

  if (
    user.planType === "free" &&
    isTodayGreaterThanLastUsage(user.lastUsage) &&
    user.usedDaysFree < import.meta.env.VITE_FREE_TOTAL_DAYS
  ) {
    await updateUser(token, {
      dailyUsage: 0,
    });
    // localStorage.setItem("appliedJobs", JSON.stringify({ appliedJobs: 0 }));
    setAppliedJobs([]);
    setWebsocketCount(0);
  }
}
