const got = require("got"),
  fs = require("fs"),
  path = require("path"),
  readline = require("readline"),
  jsdom = require("jsdom"),
  {JSDOM} = jsdom,
  idsScraped = require("./data/ids_scraped.json"),
  wikiScraped = require("./data/wiki_scraped.json"),
  enemyData = require("./data/enemies.json"),
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const requestOptions = {
  headers: {
    "User-Agent": "Battle Cats DB"
  }
};

async function main() {
  const allEnemiesHTML = await got("https://battlecats-db.com/enemy/atr_all.html", requestOptions),
    dom = new JSDOM(allEnemiesHTML.body),
    doc = dom.window.document,
    ids = [],
    enemyRows = doc.querySelectorAll("#List tbody:first-of-type tr");
  for (let i = 0; i < enemyRows.length; i++) {
    const row = enemyRows[i];
    ids.push(row.children[0].textContent);
  }
  if (ids.length === idsScraped.length) {
    return console.log("No new ids to scrape");
  }
  await scrapeWiki(ids);
  await saveData();
  rl.close();
}

async function saveData() {
  const idData = JSON.stringify(idsScraped, null, 2),
    wikiData = JSON.stringify(wikiScraped, null, 2),
    enemy = JSON.stringify(enemyData, null, 2);
  await write("./data/ids_scraped.json", idData);
  await write("./data/wiki_scraped.json", wikiData);
  await write("./data/enemies.json", enemy);
  console.log("Done");
}

function write(pth, data) {
  const p = path.join(__dirname, pth);
  return new Promise((resolve, reject) => {
    fs.writeFile(p, data, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function sleep(n) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, n * 1000);
  });
}

async function scrapeWiki(ids) {
  const newIds = [];
  for (let i = 0; i < ids.length; i++) {
    if (!idsScraped.includes(ids[i])) {
      newIds.push(ids[i]);
      idsScraped.push(ids[i]);
    }
  }
  const wikiAllEnemiesHTML = await got("https://battle-cats.fandom.com/wiki/Enemy_Dictionary", requestOptions),
    dom = new JSDOM(wikiAllEnemiesHTML.body),
    doc = dom.window.document,
    links = doc.querySelectorAll("#dictionary .dctd_tabs_container .nested_dctd .tabbertab a"),
    newLinks = [];
  for (let i = 0; i < links.length; i++) {
    const href = links[i].href;
    if (!wikiScraped.includes(href) && !newLinks.includes(href)) {
      newLinks.push(href);
    }
  }
  // scrape new ids on wiki
  console.log("Scraping new links: ", newLinks);
  for (let i = 0; i < newLinks.length; i++) {
    await sleep(1);
    const data = await scrapeWikiLink(newLinks[i]);
    if (data === null) {
      wikiScraped.push(newLinks[i]);
      continue;
    }
    enemyData.push(data);
    wikiScraped.push(newLinks[i]);
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    rl.write(`${i} / ${newLinks.length}`);
  }
}

async function scrapeWikiLink(link) {
  if (/static\.wikia/.test(link)) {
    return null;
  }
  const html = await got("https://battle-cats.fandom.com/" + link, requestOptions),
    dom = new JSDOM(html.body),
    doc = dom.window.document,
    moneyDrop = doc.querySelector("[data-source=\"money drop\"]"),
    enemyDescription = doc.querySelector(".translation td:not([class])"),
    statTable = doc.querySelector("table:not([class])"),
    enemyName = statTable.querySelector("tr>th"),
    enemyHP = statTable.querySelector("tr:nth-of-type(3)>td:nth-of-type(1)"),
    enemyDamage = statTable.querySelector("tr:nth-of-type(3)>td:nth-of-type(2)"),
    enemyRange = statTable.querySelector("tr:nth-of-type(3)>td:nth-of-type(3)"),
    enemyFreqeuncy = statTable.querySelector("tr:nth-of-type(3)>td:nth-of-type(4)"),
    enemySpeed = statTable.querySelector("tr:nth-of-type(3)>td:nth-of-type(5)"),
    enemyKnockback = statTable.querySelector("tr:nth-of-type(3)>td:nth-of-type(6)"),
    enemyAnimation = statTable.querySelector("tr:nth-of-type(3)>td:nth-of-type(7)"),
    enemySpecial = statTable.querySelector("tr:nth-of-type(5)>td:nth-of-type(1)"),
    enemyAttribute = statTable.querySelector("tr:nth-of-type(5)>td:nth-of-type(2)"),
    referenceLink = doc.querySelector(".external.free");
  try {
    return {
      wiki_link: link,
      money_value: moneyDrop ? moneyDrop.textContent : "Unknown",
      name: enemyName.textContent,
      description: enemyDescription ? enemyDescription.textContent : "No description",
      health: +enemyHP.textContent.match(/\d+/)[0],
      damage: +enemyDamage.textContent.match(/\d+/)[0],
      damage_per_second: +enemyDamage.textContent.match(/\d+\.?\d*/g)[1],
      range: +enemyRange.textContent.match(/\d+/)[0],
      range_type: enemyRange.textContent.match(/\(.*?\)/)[0].replace(/[()]/g, ""),
      attack_frequency: enemyFreqeuncy.textContent.match(/\d+f/)[1],
      movement_speed: +enemySpeed.textContent.match(/\d+/)[0],
      knockbacks: +enemyKnockback.textContent.match(/\d+/)[0],
      attack_animation: enemyAnimation.textContent.match(/\d+f/)[0],
      special_ability: enemySpecial.textContent,
      attribute: enemyAttribute.textContent,
      referenceLink: referenceLink ? referenceLink.href : null
    };
  } catch (e) {
    console.log(`Failed to scrape page: (${link})`, e);
    return null;
  }
}

main();
