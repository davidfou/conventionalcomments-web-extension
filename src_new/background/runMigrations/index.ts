import getMigrations from "./getMigrations";

async function getLastMigration(): Promise<null | string> {
  const { lastMigration } = await chrome.storage.local.get("lastMigration");
  return typeof lastMigration === "string" ? lastMigration : null;
}

export default async (): Promise<void> => {
  const lastMigration = await getLastMigration();
  const migrations = getMigrations();

  const firstIndex =
    migrations.findIndex(({ key }) => key === lastMigration) + 1;

  if (firstIndex === migrations.length) {
    return;
  }

  // Run the migrations sequentially
  for (const migration of migrations.slice(firstIndex)) {
    await migration.run();
  }

  await chrome.storage.local.set({
    lastMigration: migrations[migrations.length - 1].key,
  });
};
