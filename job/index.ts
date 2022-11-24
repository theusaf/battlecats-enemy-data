import got from "got";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import mwbot from "mwbot";

// const __dirname = path.dirname(fileURLToPath(import.meta.url)),
//   require = createRequire(import.meta.url),
//   scrapedIDs = require("./data/ids_scraped.json"),
//   scrapedWiki = require("./data/wiki_scraped.json"),
//   enemyData = require("./data/enemies.json");

const bot = new mwbot({
  apiUrl: "https://battle-cats.fandom.com/api.php",
});

/* the plan:

- scrape the database for all the enemy IDs
- search the wiki for the link and name of each enemy
- scrape the wiki for english details
-- verify the reference links are the same

var a = await bot.requestJSON<any>({
  action: "query",
  list: "search",
  srlimit: 10,
  srsearch: "\"enemy_link_here\" enemy_name_here",
  srwhat: "text",
  srprop: "timestamp",
})
console.log(a.query.search)

*/
