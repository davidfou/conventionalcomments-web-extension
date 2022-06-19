import poly from "webextension-polyfill";

import runMigrations from "./runMigrations";
import registerContentScript from "./registerContentScript";
import { getDeactivatedUrls } from "./deactivatedUrls";
import refreshIcon from "./refreshIcon";

const initialize = async (
  registeredUrls: Map<string, { unregister: () => void }>
): Promise<void> => {
  await runMigrations();
  const [permissions, deactivatedUrls] = await Promise.all([
    poly.permissions.getAll(),
    getDeactivatedUrls(),
    refreshIcon(),
  ]);

  await Promise.all(
    (permissions.origins ?? []).map(async (url) => {
      if (deactivatedUrls.includes(url)) {
        return;
      }
      const { unregister } = await registerContentScript(url);
      registeredUrls.set(url, { unregister });
    })
  );
};

export default initialize;
