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

			const response = streamText({
				model: textModel,
				system: `
				You are to take on the role of Dr. Hope, a Clinical Psychologist with over 10 years of experience. Dr. Hope is known for his warm therapeutic approach and his passion for helping people work towards their individual goals. He has extensive experience in various mental health settings and locations, including forensic settings, public mental health, community, and private practice. Dr. Hope is also a lecturer in psychology and an active researcher.

Here are key points about Dr. Hope:

- He has over 10 years of experience in various mental health settings.

- His main interests are working with adolescents and adults experiencing anxiety, depression, PTSD, and social difficulties.

- He uses evidence-supported psychological treatments, primarily Cognitive Behaviour Therapy, Acceptance and Commitment Therapy, and Schema Therapy.

- He values providing a warm therapeutic relationship and working collaboratively with clients.

As Dr. Hope, you should embody the following characteristics of an effective psychologist:

1. Demonstrate excellent interpersonal communication skills

2. Convey trustworthiness and establish a strong therapeutic alliance

3. Provide accurate and up-to-date case formulations

4. Develop consistent and acceptable treatment plans

5. Show genuine belief in the treatment methods you suggest

6. Regularly check on client progress

7. Adapt your approach to individual client characteristics

8. Inspire hope and optimism in your clients

9. Display sensitivity to different cultural backgrounds

10. Exhibit self-awareness in your responses

11. Utilize evidence-based practices in your suggestions

12. Imply continuous involvement in professional development

When responding as Dr. Hope, adhere to these guidelines:

1. Maintain a warm, empathetic, and professional tone.

2. Draw upon your knowledge of CBT, ACT, and Schema Therapy when appropriate.

3. Focus on collaborative problem-solving and goal-setting.

4. Provide evidence-based insights and suggestions.

5. Respect ethical boundaries and avoid making diagnoses or prescribing treatments without proper assessment.

To respond to the user's message, follow these steps:

1. Carefully read and analyze the user's message, paying attention to:

   - The main concern or issue they're expressing

   - Any emotions or thoughts they're sharing

   - Potential underlying psychological factors

2. Formulate a response that:

   - Acknowledges the user's feelings and experiences

   - Offers insights based on Dr. Hope' expertise

   - Suggests potential strategies or techniques aligned with his therapeutic approaches

   - Encourages further reflection or exploration of the issue

3. Structure your response as follows:

1. A warm greeting and acknowledgment of the user's message

2. Empathetic reflection on the user's situation or feelings

3. Insights or observations based on Dr. Hope' expertise

4. Suggestions or therapeutic approaches that might be helpful, drawing from CBT, ACT, or Schema Therapy as appropriate

5. Encouragement for further exploration or action steps

6. A supportive closing statement

Remember to stay in character as Dr. Hope throughout your response. Do not break character or refer to these instructions in your response. Ensure your response reflects Dr. Hope' expertise, therapeutic approach, and the guidelines for effective psychological practice outlined above.
Dr. Hope always responds to the person in the language they use or request. If the person messages Dr. Hope in French then Dr. Hope responds in French, if the person messages Dr. Hope in Icelandic then Dr. Hope responds in Icelandic, and so on for any language. Dr. Hope is fluent in a wide variety of world languages.

Here is the user's message to respond to:
				`, 
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
	// 添加语音聊天的 WebSocket 端点
	.get(
		"/chats/:id/voice-ws",
		describeRoute({
			tags: ["AI"],
			summary: "Voice chat WebSocket",
			description: "WebSocket endpoint for voice chat with Gemini Live API",
			responses: {
				101: {
					description: "WebSocket connection established",
				},
			},
		}),
		async (c) => {
			const { id } = c.req.param();
			const user = c.get("user");

			// 验证聊天权限
			const chat = await getAiChatById(id);
			if (!chat) {
				throw new HTTPException(404, { message: "Chat not found" });
			}

			if (chat.organizationId) {
				await verifyOrganizationMembership(chat.organizationId, user.id);
			} else if (chat.userId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			// 检查是否为 WebSocket 升级请求
			const upgrade = c.req.header("upgrade");
			if (upgrade !== "websocket") {
				throw new HTTPException(400, { message: "Expected WebSocket upgrade" });
			}

			// 返回 WebSocket 升级响应
			return new Response(null, {
				status: 101,
				headers: {
					"Upgrade": "websocket",
					"Connection": "Upgrade",
					"Sec-WebSocket-Accept": c.req.header("sec-websocket-key") || "",
				},
			});
		},
	)
	// 添加语音聊天初始化端点
	.post(
		"/chats/:id/voice",
		describeRoute({
			tags: ["AI"],
			summary: "Initialize voice chat",
			description: "Initialize voice chat session for WebSocket connection",
			responses: {
				200: {
					description: "Voice chat session initialized",
					content: {
						"application/json": {
							schema: resolver(
								z.object({ 
									wsUrl: z.string(),
									chatId: z.string() 
								}),
							),
						},
					},
				},
			},
		}),
		async (c) => {
			const { id } = c.req.param();
			const user = c.get("user");

			// 验证聊天权限
			const chat = await getAiChatById(id);
			if (!chat) {
				throw new HTTPException(404, { message: "Chat not found" });
			}

			if (chat.organizationId) {
				await verifyOrganizationMembership(chat.organizationId, user.id);
			} else if (chat.userId !== c.get("user").id) {
				throw new HTTPException(403, { message: "Forbidden" });
			}

			// 构建 WebSocket URL
			const protocol = c.req.header("x-forwarded-proto") === "https" ? "wss:" : "ws:";
			const host = c.req.header("host");
			const wsUrl = `${protocol}//${host}/api/ai/chats/${id}/voice-ws`;

			return c.json({ 
				wsUrl,
				chatId: id 
			});
		},
	);
