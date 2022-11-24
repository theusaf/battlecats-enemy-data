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

export interface Appearance {
  section: string;
  stageWikiTitle: string;
  stageTitle: string;
}

export interface WikiEnemyData {
  name: string;
  image: string;
  latestAppearance: Appearance;
  firstAppearances: Appearance[];
}

export async function parseEnemyPage(page: string, expectedId: string) {
  const linkRegex = new RegExp(
    `==Reference==[\\s\\n]*\\*\\s*https://battlecats-db\\.com/enemy/${expectedId}\\.html`
  );
  if (!linkRegex.test(page)) return null;
  const [, name] = page.match(/\|name\s*=\s*([^|]+)/),
    [, image] = page.match(/\|image\s*=\s*([^|]+)/),
    [, firstAppearanceValue] = page.match(
      /\|first appearance\s*=\s*('''\w+''':\s*\[\[.*?\]\]\s*(<br>[\s\n]*)?)*/
    ),
    [, latestApperanceValue] = page.match(
      /\|latest appearance\s*=\s*('''\w+''':\s*\[\[.*?\]\]\s*(<br>[\s\n]*)?)*/
    ),
    firstAppearances = firstAppearanceValue
      .match(/('''\w+''':\s*\[\[.*?]])/g)
      .map((match) => {
        const [, section, stageWikiTitle, stageTitle] = match.match(
          /'''(\w+)''':\s*\[\[(.*?)\|(.*?)]]/
        );
        return {
          section,
          stageWikiTitle,
          stageTitle,
        };
      }),
    latestAppearances = latestApperanceValue
      .match(/('''\w+''':\s*\[\[.*?]])/g)
      .map((match) => {
        const [, section, stageWikiTitle, stageTitle] = match.match(
          /'''(\w+)''':\s*\[\[(.*?)\|(.*?)]]/
        );
        return {
          section,
          stageWikiTitle,
          stageTitle,
        };
      });
  return {
    name,
    image,
    firstAppearances,
    latestAppearance: latestAppearances[0],
  };
}
