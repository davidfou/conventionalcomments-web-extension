import migration1 from "./migrations/2022-06-06_addDeactivatedUrls";
import migration2 from "./migrations/2022-06-19_addAnnouncements";
import migration3 from "./migrations/2026-09-21_addConfiguredUrls";

export default function getMigrataions(): {
  key: string;
  run: () => Promise<void>;
}[] {
  return [migration1, migration2, migration3];
}
