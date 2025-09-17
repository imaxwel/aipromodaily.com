"use client";
import { useLocale } from "next-intl";
import { config } from "@repo/config";

export function useIsRTL() {
  const locale = useLocale();
  const dir = (config.i18n.locales as any)?.[locale]?.direction as
    | "ltr"
    | "rtl"
    | undefined;
  if (dir) return dir === "rtl";
  return ["ar", "he", "fa", "ur"].includes(locale);
}
