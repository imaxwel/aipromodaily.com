import { ipGeolocationService } from '@geolocation/services/ip-geolocation';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		// 获取客户端IP
		const headersList = await headers();
		const forwardedFor = headersList.get('x-forwarded-for');
		const realIP = headersList.get('x-real-ip');
		const cfConnectingIP = headersList.get('cf-connecting-ip'); // Cloudflare
		
		// 按优先级获取IP地址
		let clientIP = cfConnectingIP || 
					  realIP || 
					  forwardedFor?.split(',')[0]?.trim() || 
					  '127.0.0.1';

		// 清理IP地址
		clientIP = clientIP.replace(/^::ffff:/, '');

		console.log('Client IP detected:', clientIP);

		// 如果是本地IP，尝试使用fallback
		if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.') || clientIP.startsWith('10.')) {
			console.log('Local IP detected, using external service');
			clientIP = ''; // 让服务自己获取公网IP
		}

		// 获取地理位置信息
		const location = await ipGeolocationService.getUserLocation(clientIP);

		if (!location) {
			return NextResponse.json(
				{ error: 'Unable to determine location' },
				{ status: 404 }
			);
		}

		// 添加一些额外的headers用于调试
		const responseHeaders = new Headers();
		responseHeaders.set('X-Client-IP', clientIP);
		responseHeaders.set('X-Country-Code', location.countryCode);
		
		// 缓存控制
		responseHeaders.set('Cache-Control', 'public, max-age=3600'); // 缓存1小时
		responseHeaders.set('Vary', 'x-forwarded-for, x-real-ip');

		return NextResponse.json(location, { headers: responseHeaders });

	} catch (error) {
		console.error('Geolocation API error:', error);
		
		return NextResponse.json(
			{ 
				error: 'Failed to determine location',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}

// 可选：处理POST请求（如果需要从客户端传递额外信息）
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userAgent, timezone, language } = body;

		// 获取客户端IP
		const headersList = await headers();
		const forwardedFor = headersList.get('x-forwarded-for');
		const realIP = headersList.get('x-real-ip');
		const cfConnectingIP = headersList.get('cf-connecting-ip');
		
		let clientIP = cfConnectingIP || 
					  realIP || 
					  forwardedFor?.split(',')[0]?.trim() || 
					  '127.0.0.1';

		clientIP = clientIP.replace(/^::ffff:/, '');

		// 首先尝试IP地理位置检测
		let location = await ipGeolocationService.getUserLocation(clientIP);

		// 如果IP检测失败，尝试从用户代理推测
		if (!location && userAgent) {
			location = ipGeolocationService.getUserLocationFromUserAgent(userAgent);
		}

		// 如果仍然没有结果，使用基本的回退信息
		if (!location) {
			// 基于浏览器语言推测
			const langCountryMap: Record<string, { country: string, countryCode: string }> = {
				'zh-CN': { country: 'China', countryCode: 'CN' },
				'zh-TW': { country: 'Taiwan', countryCode: 'TW' },
				'zh-HK': { country: 'Hong Kong', countryCode: 'HK' },
				'ja': { country: 'Japan', countryCode: 'JP' },
				'ko': { country: 'South Korea', countryCode: 'KR' },
				'de': { country: 'Germany', countryCode: 'DE' },
				'fr': { country: 'France', countryCode: 'FR' },
				'es': { country: 'Spain', countryCode: 'ES' },
				'ru': { country: 'Russia', countryCode: 'RU' },
			};

			const langInfo = langCountryMap[language];
			if (langInfo) {
				location = {
					country: langInfo.country,
					countryCode: langInfo.countryCode,
					timezone: timezone,
					ip: clientIP,
				};
			}
		}

		if (!location) {
			return NextResponse.json(
				{ error: 'Unable to determine location' },
				{ status: 404 }
			);
		}

		return NextResponse.json(location, {
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'X-Client-IP': clientIP,
				'X-Country-Code': location.countryCode,
			}
		});

	} catch (error) {
		console.error('Geolocation API error:', error);
		
		return NextResponse.json(
			{ 
				error: 'Failed to determine location',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}