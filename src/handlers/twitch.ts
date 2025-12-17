import { handleChatMessage } from "@/handlers/eventsub/handleChatMessage";
import * as TwitchSchema from "../schema/twitch-schema";
import type { HandlerRegistry } from "./eventHandler";
import { handleChannelChannelPointsCustomRewardRedemptionAdd } from "./eventsub/ChannelChannelPointsCustomRewardRedemptionAdd";

export const registerTwitchHandlers = (handlers: HandlerRegistry) => {
  // chat message
  handlers.registerTwitchHandler(
    "channel.chat.message",
    async (event, twitchApi) => {
      await handleChatMessage(event, twitchApi);
    },
    TwitchSchema.ChatMessageSchema
  );

  // channel points redemption
  handlers.registerTwitchHandler(
    "channel.channel_points_custom_reward_redemption.update",
    async (event) => {
      // console.log(event);
    },
    TwitchSchema.ChannelPointsCustomRewardRedemptionAddSchema
  );
  handlers.registerTwitchHandler(
    "channel.channel_points_custom_reward_redemption.add",
    async (event, twitchApi, minecraftActions) => {
      await handleChannelChannelPointsCustomRewardRedemptionAdd(event, twitchApi, minecraftActions);
    },
    TwitchSchema.ChannelPointsCustomRewardRedemptionAddSchema
  );
};
