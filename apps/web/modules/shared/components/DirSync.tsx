"use client";
import { useEffect } from "react";
import { config } from "@repo/config";

function getDir(locale: string) {
  const dirFromConfig = (config.i18n.locales as any)?.[locale]?.direction as
    | "ltr"
    | "rtl"
    | undefined;
  return dirFromConfig ?? (["ar", "he", "fa", "ur"].includes(locale) ? "rtl" : "ltr");
}

export function DirSync({ locale }: { locale: string }) {
  useEffect(() => {
    const dir = getDir(locale);
    const html = document.documentElement;
    if (html.getAttribute("dir") !== dir) html.setAttribute("dir", dir);
    if (html.getAttribute("lang") !== locale) html.setAttribute("lang", locale);
  }, [locale]);
  return null;
}
