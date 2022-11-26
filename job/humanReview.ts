import readline from "node:readline/promises";
import { getEnemyData } from "./cat-database.js";
import {
  addEnemy,
  needsHumanReview,
  writeEnemyData,
  writeNeedsHumanReview,
} from "./data.js";
import { getEnemyPage, parseEnemyPage } from "./wiki-database.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const initialLength = needsHumanReview.length;

for (let i = needsHumanReview.length - 1; i >= 0; i--) {
  const id = needsHumanReview.pop(),
    basicEnemyData = await getEnemyData(id),
    wikiURL = await rl.question(
      `[${initialLength - i}/${initialLength}] Enter the wiki URL for ${
        basicEnemyData.name
      } ($${basicEnemyData.id}):\n`
    );
  if (!wikiURL.trim()) {
    needsHumanReview.splice(0, 0, id); // Put it back at the beginning
    continue;
  }
  const title = wikiURL.match(/\/wiki\/(.*)$/)[1],
    page = await getEnemyPage(title),
    parsed = parseEnemyPage(page, id);
  if (!parsed) {
    console.log("Match not found. Try again.");
    needsHumanReview.push(id);
  } else {
    addEnemy({
      ...basicEnemyData,
      ...parsed,
      wikiTitle: title,
    });
  }
}
await writeEnemyData();
await writeNeedsHumanReview();
rl.close();
