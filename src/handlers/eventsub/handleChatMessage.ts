import { TwitchApi } from "@/classes/twitchApi";
import { supabase } from "@/lib/supabase";
import type { ChatMessageEvent } from "@/schema/twitch-schema";
import { resolveVariables } from "@/functions/resolveVariables";

export async function handleChatMessage(message: ChatMessageEvent, twitchApi: TwitchApi) {
  console.log(`[${message.broadcaster_user_name}] ${message.chatter_user_name}: ${message.message.text}`);




  


}
