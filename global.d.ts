export {};
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toHaveSelectedText(start: number, end: number): Promise<R>;
    }
  }
}
