export interface GeolocationData {
	country: string;
	countryCode: string;
	region?: string;
	city?: string;
	timezone?: string;
	ip: string;
}

interface IpApiResponse {
	status: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	timezone: string;
	query: string;
}

interface IpGeolocationResponse {
	country_name: string;
	country_code2: string;
	state_prov: string;
	city: string;
	time_zone: {
		name: string;
	};
	ip: string;
}

interface CloudflareGeolocationResponse {
	country: string;
	colo: string;
	timezone: string;
}

export class IpGeolocationService {
	private static instance: IpGeolocationService;

	public static getInstance(): IpGeolocationService {
		if (!IpGeolocationService.instance) {
			IpGeolocationService.instance = new IpGeolocationService();
		}
		return IpGeolocationService.instance;
	}

	/**
	 * 获取用户的地理位置信息，按优先级尝试不同的API
	 */
	async getUserLocation(clientIp?: string): Promise<GeolocationData | null> {
		// 如果提供了客户端IP，使用它；否则使用请求的IP
		const ip = clientIp || await this.getClientIp();
		
		if (!ip || this.isPrivateIP(ip)) {
			console.warn('Private IP detected or no IP found, using fallback location');
			return this.getFallbackLocation();
		}

		// 按优先级尝试不同的API
		const providers = [
			() => this.getLocationFromIpApi(ip),
			() => this.getLocationFromIpGeolocation(ip),
			() => this.getLocationFromCloudflare(),
		];

		for (const provider of providers) {
			try {
				const result = await provider();
				if (result) {
					console.log('Successfully obtained geolocation:', result);
					return result;
				}
			} catch (error) {
				console.warn('Geolocation provider failed:', error);
				continue;
			}
		}

		console.warn('All geolocation providers failed, using fallback');
		return this.getFallbackLocation();
	}

	/**
	 * 使用 ip-api.com (免费，无需API key)
	 */
	private async getLocationFromIpApi(ip: string): Promise<GeolocationData | null> {
		try {
			const response = await fetch(
				`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,timezone,query`,
				{
					headers: {
						'User-Agent': 'aipromodaily.com-Geolocation/1.0',
					},
					next: { revalidate: 3600 }, // 缓存1小时
				}
			);

			if (!response.ok) {
				throw new Error(`ip-api HTTP error: ${response.status}`);
			}

			const data: IpApiResponse = await response.json();
			
			if (data.status !== 'success') {
				throw new Error(`ip-api error: ${data.status}`);
			}

			return {
				country: data.country,
				countryCode: data.countryCode,
				region: data.regionName,
				city: data.city,
				timezone: data.timezone,
				ip: data.query,
			};
		} catch (error) {
			console.error('ip-api failed:', error);
			return null;
		}
	}

	/**
	 * 使用 ipgeolocation.io (需要API key，但有免费额度)
	 */
	private async getLocationFromIpGeolocation(ip: string): Promise<GeolocationData | null> {
		const apiKey = process.env.IPGEOLOCATION_API_KEY;
		if (!apiKey) {
			console.warn('IPGEOLOCATION_API_KEY not configured');
			return null;
		}

		try {
			const response = await fetch(
				`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`,
				{
					next: { revalidate: 3600 }, // 缓存1小时
				}
			);

			if (!response.ok) {
				throw new Error(`ipgeolocation HTTP error: ${response.status}`);
			}

			const data: IpGeolocationResponse = await response.json();

			return {
				country: data.country_name,
				countryCode: data.country_code2,
				region: data.state_prov,
				city: data.city,
				timezone: data.time_zone?.name,
				ip: data.ip,
			};
		} catch (error) {
			console.error('ipgeolocation failed:', error);
			return null;
		}
	}

	/**
	 * 使用 Cloudflare headers (如果部署在Cloudflare上)
	 */
	private async getLocationFromCloudflare(): Promise<GeolocationData | null> {
		try {
			// 这个方法需要在实际的请求中从headers获取信息
			// 在middleware中可以访问CF-IPCountry header
			return null;
		} catch (error) {
			console.error('Cloudflare geolocation failed:', error);
			return null;
		}
	}

	/**
	 * 获取客户端IP地址
	 */
	private async getClientIp(): Promise<string | null> {
		try {
			// 这个方法在实际应用中应该从请求头获取IP
			// 在Server Action中可能需要传入IP
			return null;
		} catch (error) {
			console.error('Failed to get client IP:', error);
			return null;
		}
	}

	/**
	 * 检查是否为私有IP
	 */
	private isPrivateIP(ip: string): boolean {
		const privateRanges = [
			/^127\./, // localhost
			/^192\.168\./, // private class C
			/^10\./, // private class A
			/^172\.(1[6-9]|2\d|3[01])\./, // private class B
			/^::1$/, // IPv6 localhost
			/^fc00:/, // IPv6 private
		];

		return privateRanges.some(range => range.test(ip));
	}

	/**
	 * 获取fallback位置信息（默认为美国）
	 */
	private getFallbackLocation(): GeolocationData {
		return {
			country: 'United States',
			countryCode: 'US',
			region: 'California',
			city: 'San Francisco',
			timezone: 'America/Los_Angeles',
			ip: 'unknown',
		};
	}

	/**
	 * 根据用户代理字符串推测地理位置（作为最后的备选方案）
	 */
	getUserLocationFromUserAgent(userAgent: string): GeolocationData | null {
		// 这是一个非常基础的实现，实际中可能需要更复杂的逻辑
		const languagePreferences = [
			{ pattern: /zh-CN|zh-Hans/i, country: 'China', countryCode: 'CN' },
			{ pattern: /zh-TW|zh-Hant/i, country: 'Taiwan', countryCode: 'TW' },
			{ pattern: /ja/i, country: 'Japan', countryCode: 'JP' },
			{ pattern: /ko/i, country: 'South Korea', countryCode: 'KR' },
			{ pattern: /de/i, country: 'Germany', countryCode: 'DE' },
			{ pattern: /fr/i, country: 'France', countryCode: 'FR' },
			{ pattern: /es/i, country: 'Spain', countryCode: 'ES' },
			{ pattern: /pt/i, country: 'Brazil', countryCode: 'BR' },
			{ pattern: /ru/i, country: 'Russia', countryCode: 'RU' },
		];

		for (const pref of languagePreferences) {
			if (pref.pattern.test(userAgent)) {
				return {
					country: pref.country,
					countryCode: pref.countryCode,
					ip: 'estimated',
				};
			}
		}

		return null;
	}
}

export const ipGeolocationService = IpGeolocationService.getInstance();