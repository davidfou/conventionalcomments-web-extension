import type { MountResult } from "@playwright/experimental-ct-react";
import type { Page } from "@playwright/test";

class PluginPage {
  private page: Page;
  private component?: MountResult;

  constructor(page: Page) {
    this.page = page;
  }

  get root() {
    return this.component ?? this.page;
  }

  setComponent(component: MountResult) {
    this.component = component;
  }

  async selectLabel(label: string) {
    await this.root.getByTestId("label-selector").selectOption(label);
  }

  async toggleDecoration(decoration: string) {
    const locator = this.root.getByTestId(`decoration-${decoration}`);
    const isChecked = await locator.isChecked();
    if (isChecked) {
      await locator.uncheck();
    } else {
      await locator.check();
    }
  }
}

export default PluginPage;
