import debug from "debug";

if (import.meta.env.MODE === "development") {
  debug.enable("background,content-script");
}

// oxlint-disable-next-line no-console
debug.log = console.log.bind(console);

export default debug;
