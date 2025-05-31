"use client";
import Script from "next/script";

const googleTagId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID as string;

export function AnalyticsScript() {
    return (
        <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            onLoad={() => {
                if (typeof window === "undefined") {
                    return;
                }
                
                // 初始化 dataLayer
                (window as any).dataLayer = (window as any).dataLayer || [];
                
                // 定义 gtag 函数
                function gtag(...args: any[]) {
                    (window as any).dataLayer.push(arguments);
                }
                
                // 将 gtag 函数挂载到 window 对象
                (window as any).gtag = gtag;
                
                // 初始化 GA
                gtag("js", new Date());
                gtag("config", googleTagId, {
                    page_title: document.title,
                    page_location: window.location.href
                });
            }}
        />
    );
}

export function useAnalytics() {
    const trackEvent = (event: string, data?: Record<string, unknown>) => {
        if (typeof window === "undefined" || !(window as any).gtag) {
            return;
        }
        (window as any).gtag("event", event, data);
    };
    
    return {
        trackEvent,
    };
}
