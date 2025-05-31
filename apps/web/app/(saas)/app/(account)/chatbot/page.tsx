import { AiChat } from "@saas/ai/components/AiChat";
import { aiChatListQueryKey, aiChatQueryKey } from "@saas/ai/lib/api";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getServerApiClient, getServerQueryClient } from "@shared/lib/server";

interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  organizationId: string | null;
  title: string | null;
  messages: any; // 或者定义更具体的类型
}

interface ChatsResponse {
  chats: Chat[];
}

export default async function AiDemoPage() {
  const queryClient = getServerQueryClient();
  const apiClient = await getServerApiClient();
  
  let chats: Chat[] = [];
  
  try {
    const response = await apiClient.ai.chats.$get({});
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      chats = [];
    } else {
      const data: ChatsResponse = await response.json();
      chats = data.chats || [];
    }
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    chats = [];
  }

  await queryClient.prefetchQuery({
    queryKey: aiChatListQueryKey(),
    queryFn: async (): Promise<Chat[]> => chats,
  });

  if (chats.length > 0) {
    try {
      await queryClient.prefetchQuery({
        queryKey: aiChatQueryKey(chats[0].id),
        queryFn: async () => {
          const response = await apiClient.ai.chats[":id"].$get({
            param: {
              id: chats[0].id,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch chat");
          }
          return response.json();
        },
      });
    } catch (error) {
      console.error('Failed to fetch individual chat:', error);
    }
  }

  return (
    <>
      <PageHeader
        title="AI Chatbot"
        subtitle="This is an example chatbot built with the ClaudeAI API"
      />
      <AiChat />
    </>
  );
}
