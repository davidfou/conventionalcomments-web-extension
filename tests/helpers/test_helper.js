const Helper = require("@codeceptjs/helper");
const assert = require("assert");

/* eslint-disable no-underscore-dangle */
class Test extends Helper {
  async seeElementIsFocused(selector) {
    const { Playwright } = this.helpers;
    const elements = await Playwright._locate(selector);
    assert.strictEqual(
      elements.length,
      1,
      `Expected 1 matching element, got
      ${elements.length}`
    );

    const isActive = await Playwright.page.evaluate(
      (element) => document.activeElement === element,
      elements[0]
    );
    assert(isActive, "Element is not active");
  }

  async setSelectionRange(start, end) {
    const { Playwright } = this.helpers;
    const isCorrect = await Playwright.executeScript(
      (position) => {
        if (document.activeElement.setSelectionRange === undefined) {
          return false;
        }
        document.activeElement.setSelectionRange(position.start, position.end);
        return true;
      },
      { start, end }
    );
    assert(isCorrect, "Impossible to select range on active element");
  }

  async seeSelectedText(start, end) {
    const { Playwright } = this.helpers;
    const position = await Playwright.executeScript(() => {
      if (document.activeElement.selectionStart === undefined) {
        return null;
      }
      return {
        start: document.activeElement.selectionStart,
        end: document.activeElement.selectionEnd,
      };
    });
    assert(position !== null, "Impossible to get range on active element");

    assert.deepStrictEqual(position, { start, end });
  }

  async blurElement(selector) {
    const { Playwright } = this.helpers;
    const elements = await Playwright._locate(selector);
    assert.strictEqual(
      elements.length,
      1,
      `Expected 1 matching element, got
      ${elements.length}`
    );

    await Playwright.page.evaluate((element) => element.blur(), elements[0]);
  }

  async focusElement(selector) {
    const { Playwright } = this.helpers;
    const elements = await Playwright._locate(selector);
    assert.strictEqual(
      elements.length,
      1,
      `Expected 1 matching element, got
      ${elements.length}`
    );

    await Playwright.page.evaluate((element) => element.focus(), elements[0]);
  }

  async clearLocalStorage() {
    const { Playwright } = this.helpers;
    await Playwright.page.evaluate(() => {
      localStorage.clear();
    });
  }
}

module.exports = Test;
