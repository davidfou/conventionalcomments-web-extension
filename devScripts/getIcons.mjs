import fetch from "node-fetch";
import config from "config";
import { URL, fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const BASE_URL = `https://api.figma.com/v1/files/${config.get(
  "figma.fileKey",
)}`;

const versionsRequest = await fetch(`${BASE_URL}/versions`, {
  headers: {
    "X-FIGMA-TOKEN": config.get("figma.token"),
  },
});
if (!versionsRequest.ok) {
  throw new Error(
    `Getting the version returned ${versionsRequest.status} (${versionsRequest.statusText})`,
  );
}

const { versions } = await versionsRequest.json();
const version = versions.find(
  ({ label }) => label === config.get("figma.version"),
);
if (version === undefined) {
  throw new Error(`Version '${config.get("figma.version")}' not found`);
}

const fileRequestUrl = new URL(BASE_URL);
fileRequestUrl.searchParams.append("version", version.id);
fileRequestUrl.searchParams.append("depth", 2);
const fileRequest = await fetch(fileRequestUrl, {
  headers: {
    "X-FIGMA-TOKEN": config.get("figma.token"),
  },
});
if (!fileRequest.ok) {
  throw new Error(
    `Getting the version returned ${fileRequest.status} (${fileRequest.statusText})`,
  );
}
const file = await fileRequest.json();
const icons = file.document.children[0].children.filter(
  ({ name }) => !name.startsWith("_"),
);

const iconsFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/icons",
);
await fs.promises.rm(iconsFolder, { recursive: true });
await fs.promises.mkdir(iconsFolder);

const fileUrl = new URL(
  `https://api.figma.com/v1/images/${config.get("figma.fileKey")}`,
);
fileUrl.searchParams.append("ids", icons.map(({ id }) => id).join(","));
fileUrl.searchParams.append("scale", 1);
fileUrl.searchParams.append("format", "png");
fileUrl.searchParams.append("version", version.id);
fileUrl.searchParams.append("use_absolute_bounds", true);
const imageRequest = await fetch(fileUrl, {
  headers: {
    "X-FIGMA-TOKEN": config.get("figma.token"),
  },
});
if (!imageRequest.ok) {
  throw new Error(
    `Getting the image returned ${imageRequest.status} (${imageRequest.statusText})`,
  );
}
const { err, images } = await imageRequest.json();
if (err !== null) {
  throw new Error(`An error occured while rendering the images (${err})`);
}
await Promise.all(
  icons.map(async (icon) => {
    const imageContentRequest = await fetch(images[icon.id]);
    if (!imageContentRequest.ok) {
      throw new Error(
        `Getting the content  image returned ${imageContentRequest.status} (${imageContentRequest.statusText})`,
      );
    }
    await pipeline(
      imageContentRequest.body,
      fs.createWriteStream(path.join(iconsFolder, `${icon.name}.png`)),
    );
  }),
);
