import * as fs from "fs";
import { resolve } from "path";
import { PluginOption } from "vite";

const distDir = resolve(__dirname, "..", "..", "dist");
const publicDir = resolve(__dirname, "..", "..", "public");

export default function locales(isDev: boolean): PluginOption {
  console.log('locales', isDev);

  function makeLocales(to: string) {
    const sourcePath = resolve(__dirname, "..", "..", "_locales");
    const targetPath = resolve(to, "_locales");
    console.log('makeLocales', sourcePath, to);
    fs.cpSync(sourcePath, targetPath, { recursive: true });
  }

  return {
    name: "locales",
    buildStart() {
      if (isDev) {
        makeLocales(distDir);
      }
    },
    buildEnd() {
      if (isDev) {
        return;
      }
      makeLocales(publicDir);
    },
  };
}
