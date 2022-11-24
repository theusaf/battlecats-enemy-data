import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url)),
  requireJSON = createRequire(import.meta.url);

export const scrapedIDs = new Set<string>(requireJSON("./data/ids_scraped.json"));
export const scrapedWiki = new Set<string>(requireJSON("./data/wiki_scraped.json"));
export const enemyData = requireJSON("./data/enemies.json");

export function formatJSON(data: any) {
  return JSON.stringify(data, null, 2);
}

export async function writeScrapedIDs() {
  await fs.writeFile(
    path.join(
      __dirname,
      "../data/ids_scraped.json",
    ),
    formatJSON(Array.from(scrapedIDs)),
    "utf8"
  );
}

export async function writeScrapedWiki() {
  await fs.writeFile(
    path.join(
      __dirname,
      "../data/wiki_scraped.json",
    ),
    formatJSON(Array.from(scrapedWiki)),
    "utf8"
  );
}

export async function writeEnemyData() {
  await fs.writeFile(
    path.join(
      __dirname,
      "../data/enemies.json",
    ),
    formatJSON(enemyData),
    "utf8"
  );
}
