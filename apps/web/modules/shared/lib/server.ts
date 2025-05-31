import "server-only";
import { createQueryClient } from "@shared/lib/query-client";

import type { AppRouter } from "@repo/api";
import { getBaseUrl } from "@repo/utils";
import { hc } from "hono/client";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerQueryClient = cache(createQueryClient);

export const getServerApiClient = async () => {
    // 使用正确的URL
    const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : getBaseUrl();
    
    console.log("=== Server API Client Debug ===");
    console.log("Using Base URL:", baseUrl);
    console.log("VERCEL_URL:", process.env.VERCEL_URL);
    
    const headerObject = Object.fromEntries((await headers()).entries());
    console.log("Headers keys:", Object.keys(headerObject));
    console.log("Cookie header:", headerObject.cookie ? "Present" : "Missing");
    
    return hc<AppRouter>(baseUrl, {
        init: {
            credentials: "include",
            headers: headerObject,
        },
    }).api;
};
