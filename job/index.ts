import { BCDatabaseEnemy } from "./cat-database.js";
import { getEnemyPage, getSearchResults, search } from "./wiki-database.js";

var a = await getEnemyPage("B.B.Bunny (Red)");

console.log(JSON.stringify(a, null, 2));
