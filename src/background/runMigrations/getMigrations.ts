import migration1 from "./migrations/2022-06-06_addDeactivatedUrls";
import migration2 from "./migrations/2022-06-19_addAnnouncements";

export default (): { key: string; run: () => Promise<void> }[] => [
  migration1,
  migration2,
];
