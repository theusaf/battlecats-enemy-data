import mwbot, { getFirstValue } from "mwbot";
import { BCDatabaseEnemy } from "./cat-database.js";
import { scrapedWiki } from "./data.js";
import { REQUEST_OPTIONS } from "./util/constants.js";

const bot = new mwbot(
  {
    apiUrl: "https://battle-cats.fandom.com/api.php",
  },
  REQUEST_OPTIONS
);

export type CombinedEnemy = BCDatabaseEnemy & WikiEnemyData;

export async function search(enemy: BCDatabaseEnemy): Promise<CombinedEnemy> {
  const searchResults = await getSearchResults(enemy.id, enemy.name);
  for (const title of searchResults) {
    if (scrapedWiki.has(title)) continue;
    const wikiData = parseEnemyPage(await getEnemyPage(title), enemy.id);
    if (wikiData) {
      return {
        ...enemy,
        ...wikiData,
      };
    }
  }
  return null;
}

export interface WikiSearchResultItem {
  ns: number;
  title: string;
  pageid: number;
  timestamp: string;
  [key: string]: any;
}

export interface WikiSearchResult {
  batchcomplete: string;
  continue: {
    sroffset: number;
    continue: string;
  };
  query: {
    search: WikiSearchResultItem[];
  };
}

export async function getSearchResults(id: string, name: string) {
  return (
    await bot.requestJSON<WikiSearchResult>({
      action: "query",
      list: "search",
      srlimit: 5,
      srsearch: `"https://battlecats-db.com/enemy/${id}.html" ${name}`,
      srwhat: "text",
      srprop: "timestamp",
    })
  ).query.search.map((item) => item.title);
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
  wikiTitle: string;
  ability: string | null;
  description: string | null;
  firstAppearances: Appearance[];
}

export function parseEnemyPage(
  page: string,
  expectedId: string
): WikiEnemyData {
  const linkRegex = new RegExp(
    `==Reference==[\\s\\n]*\\*\\s*https://battlecats-db\\.com/enemy/${expectedId}\\.html`
  );
  if (!linkRegex.test(page)) return null;
  const [, name] = page.match(/\|name\s*=\s*([^|]+)/),
    [, image] = page.match(/\|image\s*=\s*([^|]+)/),
    description = page.match(/\|enemy_endesc1\s*=\s*(.*)/)?.[1] ?? null,
    ability = page.match(/\|Ability\s*=\s*((?:.|\n)*?)\n(\||})/i)?.[1] ?? null,
    [, firstAppearanceValue] =
      page.match(
        /\|first appearance\s*=\s*('''\w+''':\s*\[\[.*?\]\]\s*(<br>[\s\n]*)?)*/
      ) ?? [],
    firstAppearances = firstAppearanceValue
      ?.match(/('''\w+''':\s*\[\[.*?]])/g)
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
    description,
    ability,
    firstAppearances,
    wikiTitle: page,
  };
}
