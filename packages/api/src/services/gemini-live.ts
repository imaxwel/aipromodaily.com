// packages/api/src/services/gemini-live.ts
interface GeminiMessage {
	setup?: {
	  model: string;
	  generation_config: {
		response_modalities: string[];
		speech_config: {
		  voice_config: {
			prebuilt_voice_config: {
			  voice_name: string;
			};
		  };
		};
	  };
	  system_instruction: {
		parts: Array<{ text: string }>;
	  };
	  tools: any[];
	};
	client_content?: {
	  turns: Array<{
		role: string;
		parts: Array<{
		  inline_data?: {
			mime_type: string;
			data: string;
		  };
		  text?: string;
		}>;
	  }>;
	  turn_complete: boolean;
	};
  }
  
  export class GeminiLiveService {
	private static instance: GeminiLiveService;
	private connections = new Map<string, { clientWs: WebSocket; geminiWs: WebSocket | null }>();
  
	static getInstance(): GeminiLiveService {
	  if (!GeminiLiveService.instance) {
		GeminiLiveService.instance = new GeminiLiveService();
	  }
	  return GeminiLiveService.instance;
	}
  
	async handleWebSocketConnection(chatId: string, clientWs: WebSocket) {
	  console.log(`Starting voice chat session for chat: ${chatId}`);
  
	  try {
		// 创建到 Gemini Live API 的连接
		const geminiWs = new WebSocket(
		  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
		  {
			headers: {
			  'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
			}
		  }
		);
  
		// 存储连接
		this.connections.set(chatId, { clientWs, geminiWs });
  
		// 设置 Gemini WebSocket 事件处理
		geminiWs.onopen = () => {
		  console.log('Connected to Gemini Live API');
		  this.setupGeminiSession(geminiWs);
		  
		  // 通知客户端连接成功
		  clientWs.send(JSON.stringify({ 
			type: 'status', 
			status: 'connected',
			message: 'Voice chat ready' 
		  }));
		};
  
		geminiWs.onmessage = (event) => {
		  try {
			const data = JSON.parse(event.data.toString());
			// 转发 Gemini 响应到客户端
			clientWs.send(JSON.stringify({
			  type: 'gemini_response',
			  data: data
			}));
		  } catch (error) {
			console.error('Error parsing Gemini message:', error);
		  }
		};
  
		geminiWs.onerror = (error) => {
		  console.error('Gemini WebSocket error:', error);
		  clientWs.send(JSON.stringify({ 
			type: 'error', 
			message: 'Gemini connection error' 
		  }));
		};
  
		geminiWs.onclose = () => {
		  console.log('Gemini WebSocket closed');
		  clientWs.send(JSON.stringify({ 
			type: 'status', 
			status: 'disconnected',
			message: 'Gemini connection closed' 
		  }));
		};
  
		// 设置客户端 WebSocket 事件处理
		clientWs.onmessage = (event) => {
		  try {
			const message = JSON.parse(event.data.toString());
			
			if (message.type === 'audio_data' && geminiWs.readyState === WebSocket.OPEN) {
			  // 转发音频数据到 Gemini
			  const geminiMessage: GeminiMessage = {
				client_content: {
				  turns: [{
					role: "user",
					parts: [{
					  inline_data: {
						mime_type: "audio/pcm",
						data: message.data
					  }
					}]
				  }],
				  turn_complete: true
				}
			  };
			  
			  geminiWs.send(JSON.stringify(geminiMessage));
			}
		  } catch (error) {
			console.error('Error processing client message:', error);
		  }
		};
  
		clientWs.onclose = () => {
		  console.log(`Client WebSocket closed for chat: ${chatId}`);
		  this.cleanup(chatId);
		};
  
		clientWs.onerror = (error) => {
		  console.error('Client WebSocket error:', error);
		  this.cleanup(chatId);
		};
  
	  } catch (error) {
		console.error('Error establishing Gemini connection:', error);
		clientWs.send(JSON.stringify({ 
		  type: 'error', 
		  message: 'Failed to connect to voice service' 
		}));
	  }
	}
  
	private setupGeminiSession(geminiWs: WebSocket) {
	  const setupMessage: GeminiMessage = {
		setup: {
		  model: "models/gemini-2.0-flash-exp",
		  generation_config: {
			response_modalities: ["AUDIO"],
			speech_config: {
			  voice_config: {
				prebuilt_voice_config: {
				  voice_name: "Aoede"
				}
			  }
			}
		  },
		  system_instruction: {
			parts: [{
			  text: `You are Dr. Hope, a Clinical Psychologist with over 10 years of experience. Respond as a warm, empathetic therapist specializing in CBT, ACT, and Schema Therapy. Keep responses concise but supportive for voice conversations.`
			}]
		  },
		  tools: []
		}
	  };
  
	  geminiWs.send(JSON.stringify(setupMessage));
	}
  
	private cleanup(chatId: string) {
	  const connection = this.connections.get(chatId);
	  if (connection) {
		if (connection.geminiWs) {
		  connection.geminiWs.close();
		}
		this.connections.delete(chatId);
	  }
	}
  }
