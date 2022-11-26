import { getEnemyData, getNewEnemies } from "./cat-database.js";
import {
  addEnemy,
  addHumanReview,
  writeEnemyData,
  writeNeedsHumanReview,
  writeScrapedIDs,
  writeScrapedWiki,
} from "./data.js";
import { displayOutput } from "./util/displayOutput.js";
import { sleep } from "./util/sleep.js";
import { search } from "./wiki-database.js";

const newEnemies = await getNewEnemies();
for (let i = 0; i < newEnemies.length; i++) {
  const enemy = newEnemies[i];
  displayOutput(`${enemy[1]} (${enemy[0]})`, i + 1, newEnemies.length);
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
  await sleep(500);
}

await writeEnemyData();
await writeNeedsHumanReview();
await writeScrapedIDs();
await writeScrapedWiki();
