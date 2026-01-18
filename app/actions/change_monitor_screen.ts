"use server";

import { bulk_data_update_screen_with_sequence } from "./bulk_data_update";
import { remote_api } from "./remote_api";

/**
 * Change monitor screen: Update sequence mapping and then trigger via remote API with retry logic.
 * 
 * @param screens - Array of screen IDs
 * @param sequenceId - The sequence ID to assign
 * @param name - The name for the remote trigger
 */
export async function change_monitor_screen(screens: string[], sequenceId: string, name: string) {
  try {
    // 1. Update the screen data mapping
    await bulk_data_update_screen_with_sequence(screens, sequenceId);
  } catch (error) {
    console.error("Bulk update failed:", error);
    return { message: " ไม่สามารถอัพเดท screen เหล่านี้ได้" };
  }

  // Helper function for sleep/delay
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 2. Trigger remote API for each screen with retry logic
  // According to the prompt, we trigger remote_api after a successful bulk update.
  // We'll iterate through the screens and attempt to trigger.
  // If we should trigger for ALL screens and fail if ANY fail, or just if the process fails.
  // The prompt implies a general trigger logic.
  
  let success = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      // Use the first screen ID for the trigger as per example patterns, 
      // or if you want to trigger for all, we could loop.
      // Given the previous example used "0200068F2535", we'll use screens[0] for the trigger context.
      const triggerId = screens[0]; 
      
      const response = await remote_api(triggerId, name);
      
      // If we reach here without error (axios default 2xx), consider it success.
      // Based on the prompt "จนกว่าจะได้สเตตัส 200", usually axios throws for non-2xx.
      success = true;
      break;
    } catch (error) {
      attempts++;
      console.log(`Trigger attempt ${attempts} failed. Retrying in 1s...`);
      if (attempts < maxAttempts) {
        await sleep(1000);
      }
    }
  }

  if (!success) {
    return { message: "ไม่สามารถ ทริกเกอจอได้" };
  }

  return { success: true, message: "เปลี่ยนจอและทริกเกอร์สำเร็จ" };
}
