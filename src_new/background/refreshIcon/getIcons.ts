const SIZES = ["16", "24", "32", "64"];
const FLAVORS = {
  default: "",
  active: "_active",
  warning: "_warning",
} as const;

function getIcons(
  flavor: "default" | "active" | "warning",
  hasAnnouncement: boolean,
): { [key: string]: string } {
  return Object.fromEntries(
    SIZES.map((size) => [
      size,
      `public/icons/browser_action${FLAVORS[flavor]}${
        hasAnnouncement ? "_announcement" : ""
      }_${size}.png`,
    ]),
  );
}

export default getIcons;
