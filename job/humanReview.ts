import readline from "node:readline/promises";
import { getEnemyData } from "./cat-database.js";
import {
  addEnemy,
  needsHumanReview,
  writeEnemyData,
  writeNeedsHumanReview,
  writeScrapedIDs,
  writeScrapedWiki,
} from "./data.js";
import { getPageContent, parseEnemyPage } from "./wiki-database.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const initialLength = needsHumanReview.length;

for (let i = needsHumanReview.length - 1; i >= 0; i--) {
  const id = needsHumanReview.pop();
  try {
    const basicEnemyData = await getEnemyData(id),
      wikiURL = await rl.question(
        `[${
          initialLength - i
        }/${initialLength}] Enter the wiki URL or title for ${
          basicEnemyData.name
        } (${basicEnemyData.id}):\n`
      );
    if (!wikiURL.trim()) {
      needsHumanReview.splice(0, 0, id); // Put it back at the beginning
      continue;
    }
    const title = wikiURL.startsWith("https://")
        ? decodeURIComponent(wikiURL.match(/\/wiki\/(.*)$/)[1]).replace(
            /_/g,
            " "
          )
        : wikiURL,
      page = await getPageContent(title),
      parsed = parseEnemyPage(page, id);
    if (!parsed) {
      console.log("Match not found. Try again.");
      needsHumanReview.push(id);
      i++;
    } else {
      addEnemy({
        ...basicEnemyData,
        ...parsed,
        wikiTitle: title,
      });
    }
  } catch (e) {
    console.log("An error occured. Try again.");
    needsHumanReview.push(id);
    i++;
  }
}
await writeEnemyData();
await writeNeedsHumanReview();
await writeScrapedIDs();
await writeScrapedWiki();
rl.close();
