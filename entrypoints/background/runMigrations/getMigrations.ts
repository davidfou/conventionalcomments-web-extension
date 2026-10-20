import migration1 from "./migrations/2022-06-06_addDeactivatedUrls";
import migration2 from "./migrations/2022-06-19_addAnnouncements";
import migration3 from "./migrations/2026-10-14_addDefaultLabel";

export default function getMigrations(): {
  key: string;
  run: () => Promise<void>;
}[] {
  return [migration1, migration2, migration3];
}
