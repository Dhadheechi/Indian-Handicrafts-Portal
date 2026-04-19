import { ensureCraftDataSeeded } from "@/lib/seed";

export async function register() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    const result = await ensureCraftDataSeeded();
    if (result.skipped) {
      console.log("[seed] Skipped automatic seeding because craft data already exists.");
      return;
    }

    console.log(`[seed] Automatic seeding completed with ${result.insertedCount} crafts.`);
  } catch (error) {
    console.error("[seed] Automatic seeding failed during startup:", error);
  }
}
