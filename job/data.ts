import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { CombinedEnemy } from "./wiki-database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url)),
  requireJSON = createRequire(import.meta.url);

export const scrapedIDs = new Set<string>(
  requireJSON("../data/ids_scraped.json")
);
export const scrapedWiki = new Set<string>(
  requireJSON("../data/wiki_scraped.json")
);
export const enemyData = requireJSON("../data/enemies.json");
export const needsHumanReview = requireJSON("../data/needs_human_review.json");

export function formatJSON(data: any) {
  return JSON.stringify(data, null, 2);
}

export async function writeScrapedIDs() {
  await fs.writeFile(
    path.join(__dirname, "../data/ids_scraped.json"),
    formatJSON(Array.from(scrapedIDs)),
    "utf8"
  );
}

export async function writeScrapedWiki() {
  await fs.writeFile(
    path.join(__dirname, "../data/wiki_scraped.json"),
    formatJSON(Array.from(scrapedWiki)),
    "utf8"
  );
}

export async function writeEnemyData() {
  await fs.writeFile(
    path.join(__dirname, "../data/enemies.json"),
    formatJSON(enemyData),
    "utf8"
  );
}

export async function writeNeedsHumanReview() {
  await fs.writeFile(
    path.join(__dirname, "../data/needs_human_review.json"),
    formatJSON(Array.from(new Set<string>(needsHumanReview))),
    "utf8"
  );
}

export function addEnemy(enemy: CombinedEnemy) {
  enemyData.push({
    id: enemy.id,
    dps: enemy.dps,
    appearances: enemy.firstAppearances,
    image: enemy.image,
    wikiLink: `https://battle-cats.fandom.com/wiki/${enemy.wikiTitle}`,
    baseCashDrop: enemy.cashDrop,
    description: enemy.description,
    health: enemy.hp,
    damage: enemy.attack,
    range: enemy.range,
    isSingleTarget: enemy.isSingleTarget,
    attackFrequency: enemy.attackFrequency,
    attackAnimation: enemy.attackAnimation,
    movementSpeed: enemy.speed,
    knockbacks: enemy.knockbacks,
    specialAbility: enemy.ability,
    referenceLink: `https://battlecats-db.com/enemy/${enemy.id}.html`,
    attribute: enemy.element,
  });
  scrapedIDs.add(enemy.id);
  scrapedWiki.add(enemy.wikiTitle);
}

export function addHumanReview(id: string) {
  needsHumanReview.push(id);
}
