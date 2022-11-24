import mwbot, { getFirstValue } from "mwbot";
import { BCDatabaseEnemy } from "./cat-database.js";
import { REQUEST_OPTIONS } from "./util/constants.js";

const bot = new mwbot(
  {
    apiUrl: "https://battle-cats.fandom.com/api.php",
  },
  REQUEST_OPTIONS
);

export async function search(enemy: BCDatabaseEnemy) {
  const searchResults = await getSearchResults(enemy.id, enemy.name);
}

interface WikiSearchResultItem {
  ns: number;
  title: string;
  pageid: number;
  timestamp: string;
  [key: string]: any;
}

interface WikiSearchResult {
  batchcomplete: string;
  continue: {
    sroffset: number;
    continue: string;
  };
  query: {
    search: WikiSearchResultItem[];
  };
}

export function getSearchResults(id: string, name: string) {
  return bot.requestJSON<WikiSearchResult>({
    action: "query",
    list: "search",
    srlimit: 5,
    srsearch: `"https://battlecats-db.com/enemy/${id}.html" ${name}`,
    srwhat: "text",
    srprop: "timestamp",
  });
}

export async function getEnemyPage(title: string): Promise<string> {
  const response = await bot.read(title);
  return (getFirstValue(response.query.pages) as any).revisions[0]["*"];
}
