import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 * Why: Tailwind classes can conflict (e.g. p-2 vs p-4). This picks the last one.
 * Think of it like painting: the last color you paint is the one you see.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
