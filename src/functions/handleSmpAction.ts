import { supabase } from "@/lib/supabase";
import type { EventSubNotification, subscription_type } from "@/types/twitch";
import type { TwitchApi } from "@/classes/twitchApi";
import type { MinecraftActions } from "@/classes/minecraft/handle-minecraft-actions";

// Mapping from database action format to method names
const ACTION_METHOD_MAP: Record<string, string> = {
  // Events
  launce: "launcePlayer",
  random_mob_spawn: "randomMobSpawn",
  twitch_subscription: "TwitchSubscriptionAlert",

  // Jumpscares
  fake_damage: "fakeDamage",
  door_scare: "doorScare",
  EndermanJumpscare: "endermanScare",
  SpinningPlayer: "SpinningPlayerScare",
  welcome_home: "welcome_home",

  // Disasters
  supernova: "superNova",
  windstorm: "Windstorm",
};

// Category to class property mapping
const CATEGORY_MAP: Record<string, keyof MinecraftActions> = {
  event: "Events",
  jumpscare: "Jumpscares",
  disaster: "Disasters",
};

/**
 * Methods that require special parameter handling
 */
const SPECIAL_PARAMETER_METHODS: Record<string, (metadata: Record<string, any> | null, eventData?: any) => any[]> = {
  welcome_home: (metadata) => {
    // welcome_home expects a string (viewer_name), not an object
    const viewerName = metadata?.viewer_name || metadata?.user_name || "Viewer";
    return [viewerName];
  },
};

/**
 * Executes a Minecraft action based on the action string from the database
 */
async function executeMinecraftAction(
  actionString: string,
  metadata: Record<string, any> | null,
  minecraftActions: MinecraftActions,
  eventData?: any
): Promise<void> {
  // Parse action string (format: "category:action" or "category.action")
  const separator = actionString.includes(":") ? ":" : ".";
  const [category, action] = actionString.split(separator);

  if (!category || !action) {
    console.error(`Invalid action format: ${actionString}. Expected format: "category:action" or "category.action"`);
    return;
  }

  // Get the appropriate class property (Events, Jumpscares, or Disasters)
  const categoryKey = CATEGORY_MAP[category];
  if (!categoryKey) {
    console.error(`Unknown category: ${category}. Valid categories: event, jumpscare, disaster`);
    return;
  }

  const actionClass = minecraftActions[categoryKey];
  if (!actionClass) {
    console.error(`Action class not found for category: ${category}`);
    return;
  }

  // Get the method name (with fallback to camelCase conversion)
  const methodName = ACTION_METHOD_MAP[action] || toCamelCase(action);
  const method = (actionClass as any)[methodName];

  if (typeof method !== "function") {
    console.error(`Method "${methodName}" not found in ${categoryKey} class`);
    return;
  }

  // Execute the method with appropriate parameters
  try {
    // Check if this method requires special parameter handling
    if (SPECIAL_PARAMETER_METHODS[action]) {
      const params = SPECIAL_PARAMETER_METHODS[action](metadata, eventData);
      await method.call(actionClass, ...params);
    } else if (metadata && Object.keys(metadata).length > 0) {
      // Most methods accept metadata as an object
      await method.call(actionClass, metadata);
    } else {
      // Methods that don't require parameters
      await method.call(actionClass);
    }
  } catch (error) {
    console.error(`Error executing action ${actionString}:`, error);
  }
}

/**
 * Converts snake_case or kebab-case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

export async function handleSmpAction(eventType: subscription_type, data: EventSubNotification, minecraftActions: MinecraftActions) {
  if (!minecraftActions) {
    console.error("Minecraft actions not found");
    return;
  }

  const { data: smpAction, error } = await supabase.from("smp_triggers").select("*, smp_actions(*)").eq("event_type", eventType);

  if (error) {
    console.error("Error fetching SMP action:", error);
    return;
  }

  if (!smpAction || smpAction.length === 0) {
    return;
  }

  // Execute each action
  for (const smpTrigger of smpAction) {
    if (!smpTrigger.smp_actions) {
      continue;
    }

    const actionString = smpTrigger.smp_actions.action;
    const metadata = smpTrigger.smp_actions.metadata as Record<string, any> | null;

    await executeMinecraftAction(actionString, metadata, minecraftActions, data.payload.event);
  }
}
