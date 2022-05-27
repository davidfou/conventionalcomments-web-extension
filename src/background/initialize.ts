import poly from "webextension-polyfill";

import runMigrations from "./runMigrations";
import registerContentScript from "./registerContentScript";
import deactivatedUrls from "./deactivatedUrls";

const initialize = async (
  registeredUrls: Map<string, { unregister: () => void }>
): Promise<void> => {
  await runMigrations();
  const [permissions, urls] = await Promise.all([
    poly.permissions.getAll(),
    deactivatedUrls.get(),
  ]);

  await Promise.all(
    (permissions.origins ?? []).map(async (url) => {
      if (urls.includes(url)) {
        return;
      }
      const { unregister } = await registerContentScript(url);
      registeredUrls.set(url, { unregister });
    })
  );
};

export default initialize;
