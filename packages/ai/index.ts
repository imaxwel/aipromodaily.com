import { anthropic } from "@ai-sdk/anthropic";
 
import { openai } from "@ai-sdk/openai";

export const textModel = anthropic("claude-3-5-sonnet-20240620");
// export const textModel = openai("gpt-4o-mini");
export const imageModel = openai("dall-e-3");
export const audioModel = openai("whisper-1");

export * from "ai";
export * from "./lib";
