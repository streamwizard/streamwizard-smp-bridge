import type { TwitchApi } from "@/classes/twitchApi";
import type { RandomMobSpawnMetadata, TwitchSubscriptionMetadata } from "@/types/websocket";
import MinecraftAction from "./handle-minecraft-action-base";

export class MinecraftEvents extends MinecraftAction {
  constructor(broadcaster_id: string, twitchApi: TwitchApi) {
    super(broadcaster_id, twitchApi);
  }

  public async launcePlayer() {
    await this.execute("event.launce");
  }

  public async randomMobSpawn(metadata: RandomMobSpawnMetadata) {
    await this.execute("event.random_mob_spawn", {
      viewer_list: metadata.viewer_list,
      mob_list: metadata.mob_list,
      amount: metadata.amount,
    });
  }

  public async TwitchSubscriptionAlert(metadata: TwitchSubscriptionMetadata) {
    await this.execute("event.twitch_subscription", metadata);
  }
}
