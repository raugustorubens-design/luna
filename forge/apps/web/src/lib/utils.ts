import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Copiado de apps/frontend/artifacts/frontend/src/lib/utils.ts (monorepo `luna`)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
