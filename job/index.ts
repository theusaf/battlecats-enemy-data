import { getEnemyData, getNewEnemies } from "./cat-database.js";
import {
  addEnemy,
  addHumanReview,
  writeEnemyData,
  writeNeedsHumanReview,
  writeScrapedIDs,
  writeScrapedWiki,
} from "./data.js";
import { search } from "./wiki-database.js";

const newEnemies = await getNewEnemies();
for (const enemy of newEnemies) {
  try {
    const databaseEnemy = await getEnemyData(enemy[0]),
      resultEnemy = await search(databaseEnemy);
    if (resultEnemy) {
      addEnemy(resultEnemy);
    } else {
      addHumanReview(enemy[0]);
    }
  } catch (e) {
    addHumanReview(enemy[0]);
  }
}

await writeEnemyData();
await writeNeedsHumanReview();
await writeScrapedIDs();
await writeScrapedWiki();
