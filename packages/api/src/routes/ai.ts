import { streamText, textModel } from "@repo/ai";
import {
	AiChatSchema,
	createAiChat,
	deleteAiChat,
	getAiChatById,
	getAiChatsByOrganizationId,
	getAiChatsByUserId,
	updateAiChat,
} from "@repo/database";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { verifyOrganizationMembership } from "./organizations/lib/membership";

const MessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
});

const ChatSchema = AiChatSchema.extend({
	messages: z.array(MessageSchema),
});

export const aiRouter = new Hono()
	.basePath("/ai")
	.use(authMiddleware)
	.get(
		"/chats",
		describeRoute({
			tags: ["AI"],
			summary: "Get chats",
			description: "Get all chats for current user or organization",
			responses: {
				200: {
					description: "Chats",
					content: {
						"application/json": {
							schema: resolver(
								z.object({ chats: z.array(ChatSchema) }),
							),
						},
					},
				},
			},
		}),
		validator(
			"query",
			z.object({ organizationId: z.string().optional() }).optional(),
		),
		async (c) => {
			const query = c.req.valid("query");
			const chats = await (query?.organizationId
				? getAiChatsByOrganizationId({
						limit: 10,
						offset: 0,
						organizationId: query?.organizationId,
					})
				: getAiChatsByUserId({
						limit: 10,
						offset: 0,
						userId: c.get("user").id,
					}));

			return c.json({ chats });
		},
	)
	.get(
		"/chats/:id",
		describeRoute({
			tags: ["AI"],
			summary: "Get chat",
			description: "Get a chat by id",
			responses: {
				200: {
					description: "Chat",
					content: {
						"application/json": {
							schema: resolver(z.object({ chat: ChatSchema })),
						},
					},
				},
			},
		}),
		async (c) => {
			const { id } = c.req.param();

			const chat = await getAiChatById(id);

			if (!chat) {
				throw new HTTPException(404, { message: "Chat not found" });
			}

			if (chat.organizationId) {
				await verifyOrganizationMembership(
					chat.organizationId,
					c.get("user").id,
				);
			} else if (chat.userId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			return c.json({ chat });
		},
	)
	.post(
		"/chats",
		describeRoute({
			tags: ["AI"],
			summary: "Create chat",
			description: "Create a new chat",
			responses: {
				200: {
					description: "Chat",
					content: {
						"application/json": {
							schema: resolver(z.object({ chat: ChatSchema })),
						},
					},
				},
			},
		}),
		validator(
			"json",
			z.object({
				title: z.string().optional(),
				organizationId: z.string().optional(),
			}),
		),
		async (c) => {
			const { title, organizationId } = c.req.valid("json");
			const user = c.get("user");

			if (organizationId) {
				await verifyOrganizationMembership(organizationId, user.id);
			}

			const chat = await createAiChat({
				title: title,
				organizationId,
				userId: user.id,
			});

			if (!chat) {
				throw new HTTPException(500, {
					message: "Failed to create chat",
				});
			}

			return c.json({ chat });
		},
	)
	.put(
		"/chats/:id",
		describeRoute({
			tags: ["AI"],
			summary: "Update chat",
			description: "Update a chat by id",
			responses: {
				200: {
					description: "Chat",
					content: {
						"application/json": {
							schema: resolver(z.object({ chat: ChatSchema })),
						},
					},
				},
			},
		}),
		validator("json", z.object({ title: z.string().optional() })),
		async (c) => {
			const { id } = c.req.param();
			const { title } = c.req.valid("json");
			const user = c.get("user");

			const chat = await getAiChatById(id);

			if (!chat) {
				throw new HTTPException(404, { message: "Chat not found" });
			}

			if (chat.organizationId) {
				await verifyOrganizationMembership(
					chat.organizationId,
					user.id,
				);
			} else if (chat.userId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			const updatedChat = await updateAiChat({
				id,
				title,
			});

			return c.json({ chat: updatedChat });
		},
	)
	.delete(
		"/chats/:id",
		describeRoute({
			tags: ["AI"],
			summary: "Delete chat",
			description: "Delete a chat by id",
			responses: {
				204: {
					description: "Chat deleted",
				},
			},
		}),
		async (c) => {
			const { id } = c.req.param();
			const user = c.get("user");
			const chat = await getAiChatById(id);

			if (!chat) {
				throw new HTTPException(404, { message: "Chat not found" });
			}

			if (chat.organizationId) {
				await verifyOrganizationMembership(
					chat.organizationId,
					user.id,
				);
			} else if (chat.userId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			await deleteAiChat(id);

			return c.body(null, 204);
		},
	)
	.post(
		"/chats/:id/messages",
		describeRoute({
			tags: ["AI"],
			summary: "Add message to chat",
			description:
				"Send all messages of the chat to the AI model to get a response",
			responses: {
				200: {
					description:
						"Returns a stream of the response from the AI model",
				},
			},
		}),
		validator(
			"json",
			z.object({
				messages: z.array(
					z.object({
						role: z.enum(["user", "assistant"]),
						content: z.string(),
					}),
				),
			}),
		),
		async (c) => {
			const { id } = c.req.param();
			const { messages } = c.req.valid("json");
			const user = c.get("user");

			// console.log('Processing chat:', id);
			// console.log('Messages count:', messages.length);
			// console.log('User ID:', user.id);


			const chat = await getAiChatById(id);

			if (!chat) {
				throw new HTTPException(404, { message: "Chat not found" });
			}

			if (chat.organizationId) {
				await verifyOrganizationMembership(
					chat.organizationId,
					user.id,
				);
			} else if (chat.userId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			// console.log('maxwell textModel config:', textModel);
			const response = streamText({
				model: textModel,
// 在这里添加系统提示词
				system: "现在你是世界上最优秀的心理咨询师，你具备以下能力和履历： 专业知识：你应该拥有心理学领域的扎实知识，包括理论体系、治疗方法、心理测量等，以便为你的咨询者提供专业、有针对性的建议。 临床经验：你应该具备丰富的临床经验，能够处理各种心理问题，从而帮助你的咨询者找到合适的解决方案。 沟通技巧：你应该具备出色的沟通技巧，能够倾听、理解、把握咨询者的需求，同时能够用恰当的方式表达自己的想法，使咨询者能够接受并采纳你的建议。 同理心：你应该具备强烈的同理心，能够站在咨询者的角度去理解他们的痛苦和困惑，从而给予他们真诚的关怀和支持。 持续学习：你应该有持续学习的意愿，跟进心理学领域的最新研究和发展，不断更新自己的知识和技能，以便更好地服务于你的咨询者。 良好的职业道德：你应该具备良好的职业道德，尊重咨询者的隐私，遵循专业规范，确保咨询过程的安全和有效性。 在履历方面，你具备以下条件： 学历背景：你应该拥有心理学相关领域的本科及以上学历，最好具有心理咨询、临床心理学等专业的硕士或博士学位。 专业资格：你应该具备相关的心理咨询师执业资格证书，如注册心理师、临床心理师等。 工作经历：你应该拥有多年的心理咨询工作经验，最好在不同类型的心理咨询机构、诊所或医院积累了丰富的实践经验", 
				messages,
				async onFinish({ text }) {
					await updateAiChat({
						id,
						messages: [
							...messages,
							{
								role: "assistant",
								content: text,
							},
						],
					});
				},
			});

			return response.toDataStreamResponse({
				sendUsage: true,
			});
		},
	)
	// // 添加测试端点在这里
	// .get(
	// 	"/test-claude",
	// 	describeRoute({
	// 		tags: ["AI"],
	// 		summary: "Test Claude API",
	// 		description: "Test connection to Claude API",
	// 		responses: {
	// 			200: {
	// 				description: "Claude API test result",
	// 				content: {
	// 					"application/json": {
	// 						schema: resolver(
	// 							z.object({ 
	// 								status: z.string(),
	// 								message: z.string().optional()
	// 							}),
	// 						),
	// 					},
	// 				},
	// 			},
	// 		},
	// 	}),
	// 	async (c) => {
	// 		try {
	// 			console.log('Testing Claude API connection...');
				
	// 			const response = await streamText({
	// 				model: textModel,
	// 				messages: [{ role: "user", content: "Hello, can you respond with just 'OK'?" }],
	// 				maxTokens: 10,
	// 			});
				
	// 			// 读取流式响应的第一部分来验证
	// 			const stream = response.textStream;
	// 			const reader = stream.getReader();
	// 			const { value } = await reader.read();
	// 			reader.releaseLock();
				
	// 			console.log('Claude API test successful, response:', value);
				
	// 			return c.json({ 
	// 				status: "success", 
	// 				message: "Claude API working properly" 
	// 			});
	// 		} catch (error) {
	// 			console.error('Claude test failed:', error);
				
	// 			// 类型安全的错误处理
	// 			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				
	// 			return c.json({ 
	// 				status: "error",
	// 				message: "Claude API connection failed",
	// 				details: errorMessage 
	// 			}, 500);
	// 		}
	// 	}
	// )
	;
