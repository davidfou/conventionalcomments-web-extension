import migration1 from "./migrations/2022-06-06_addDeactivatedUrls";

export default (): { key: string; run: () => Promise<void> }[] => [migration1];
