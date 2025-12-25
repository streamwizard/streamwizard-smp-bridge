// src/index.ts
import { minecraftWebSocketServer } from "./services/minecraftWebsocketServer";
import { handlers } from "./handlers/eventHandler";
import { TwitchEventSubReceiver } from "./classes/eventsub";
import customLogger from "./lib/logger";

const localhost = "ws://127.0.0.1:8080/ws";
const production = "wss://eventsub.wss.twitch.tv/ws";

async function main() {
  try {
    const EventSubReceiver = new TwitchEventSubReceiver(production, handlers);

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
