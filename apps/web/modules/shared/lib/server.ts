import "server-only";
import { createQueryClient } from "@shared/lib/query-client";

import type { AppRouter } from "@repo/api";
import { getBaseUrl } from "@repo/utils";
import { hc } from "hono/client";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerQueryClient = cache(createQueryClient);

export const getServerApiClient = async () => {
    const baseUrl = getBaseUrl();
    console.log("=== Server API Client Debug ===");
    console.log("Base URL:", baseUrl);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("VERCEL_URL:", process.env.VERCEL_URL);
    
    const headerObject = Object.fromEntries((await headers()).entries());
    console.log("Headers:", headerObject);
    
    return hc<AppRouter>(baseUrl, {
        init: {
            credentials: "include",
            headers: headerObject,
        },
    }).api;
};
