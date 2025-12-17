// src/index.ts
import { minecraftWebSocketServer } from "./services/minecraftWebsocketServer";
import { handlers } from "./handlers/eventHandler";
import { TwitchEventSubReceiver } from "./classes/eventsub";
import customLogger from "./lib/logger";

async function main() {
  try {
    const EventSubReceiver = new TwitchEventSubReceiver("wss://eventsub.wss.twitch.tv/ws", handlers);

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      await EventSubReceiver.disconnect();
      await minecraftWebSocketServer.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await EventSubReceiver.disconnect();
      await minecraftWebSocketServer.stop();
      process.exit(0);
    });

    minecraftWebSocketServer.start();
    await EventSubReceiver.connect();
    } catch (error) {
    customLogger.error("❌ Failed to start receiver:", error);
    process.exit(1);
  }
}

main();
