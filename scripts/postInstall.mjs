import GetGoogleFonts from "get-google-fonts";

const getGoogleFonts = new GetGoogleFonts({ outputDir: "./public/fonts" });
await getGoogleFonts.download([{ Roboto: ["300", "400", "500", "700"] }]);
