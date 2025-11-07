import { storage } from "#imports";
import invariant from "tiny-invariant";
import getMigrations from "./getMigrations";

async function getLastMigration(): Promise<null | string> {
  const lastMigration = await storage.getItem("local:lastMigration");
  return typeof lastMigration === "string" ? lastMigration : null;
}

export default async function runMigrations(): Promise<void> {
  const lastMigration = await getLastMigration();
  const migrations = getMigrations();

  const firstIndex =
    migrations.findIndex(({ key }) => key === lastMigration) + 1;

  if (firstIndex === migrations.length) {
    return;
  }

  // Run the migrations sequentially
  for (const migration of migrations.slice(firstIndex)) {
    // oxlint-disable-next-line no-await-in-loop
    await migration.run();
  }

  const lastMigrationItem = migrations.at(-1);
  invariant(
    lastMigrationItem !== undefined,
    "lastMigrationItem should be defined",
  );
  await storage.setItem("local:lastMigration", lastMigrationItem.key);
}
