import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url)),
  require = createRequire(import.meta.url),
  scrapedIDs = require("./data/ids_scraped.json"),
  scrapedWiki = require("./data/wiki_scraped.json"),
  enemyData = require("./data/enemies.json");
