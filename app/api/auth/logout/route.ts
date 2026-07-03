import { clearAuthCookies } from "@/lib/auth/cookies";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  const response = apiSuccess({ message: "Déconnecté" });
  return clearAuthCookies(response);
}
