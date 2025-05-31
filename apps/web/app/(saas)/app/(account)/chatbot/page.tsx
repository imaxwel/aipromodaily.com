import { AiChat } from "@saas/ai/components/AiChat";
import { aiChatListQueryKey, aiChatQueryKey } from "@saas/ai/lib/api";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getServerApiClient, getServerQueryClient } from "@shared/lib/server";

export default async function AiDemoPage() {
    const queryClient = getServerQueryClient();
    const apiClient = await getServerApiClient();
    
    console.log("=== Debug Info ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Vercel URL:", process.env.VERCEL_URL);
    console.log("API Base URL:", apiClient.ai.chats.$url());
    
    try {
        console.log("Making API request...");
        const response = await apiClient.ai.chats.$get({});
        
        console.log("Response received:");
        console.log("- Status:", response.status);
        console.log("- OK:", response.ok);
        console.log("- Headers:", Object.fromEntries(response.headers));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Response error body:", errorText);
            throw new Error(`Failed to fetch chats: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Response data:", data);
        const chats = data.chats;
        
        // ... 其余代码
    } catch (error) {
        console.error("Full error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        throw error;
    }
}
