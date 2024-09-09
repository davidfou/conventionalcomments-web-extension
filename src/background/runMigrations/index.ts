import getMigrations from "./getMigrations";

const getLastMigration = async (): Promise<null | string> => {
  const { lastMigration } = await chrome.storage.local.get("lastMigration");
  return typeof lastMigration === "string" ? lastMigration : null;
};

export default async (): Promise<void> => {
  const lastMigration = await getLastMigration();
  const migrations = getMigrations();

  const firstIndex =
    migrations.findIndex(({ key }) => key === lastMigration) + 1;

  if (firstIndex === migrations.length) {
    return;
  }

  for (let index = firstIndex; index < migrations.length; index += 1) {
    // Run the migrations sequentially
    // eslint-disable-next-line no-await-in-loop
    await migrations[index].run();
  }

  await chrome.storage.local.set({
    lastMigration: migrations[migrations.length - 1].key,
  });
};
