import "server-only";

import { config } from "@repo/config";
import type { Locale } from "@repo/i18n";
import { cookies } from "next/headers";

export async function getUserLocale() {
	const cookie = (await cookies()).get(config.i18n.localeCookieName);
	return cookie?.value ?? config.i18n.defaultLocale;
}

export async function setLocaleCookie(locale: Locale) {
	// 设置cookie，过期时间为1年，确保语言选择被长期记住
	const cookieOptions = {
		maxAge: 365 * 24 * 60 * 60, // 1年 (秒)
		httpOnly: false, // 允许客户端JavaScript访问
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax' as const,
		path: '/', // 全站有效
	};
	
	(await cookies()).set(config.i18n.localeCookieName, locale, cookieOptions);
}
