import got from "got";
import { JSDOM } from "jsdom";
import { REQUEST_OPTIONS } from "./util/constants.js";

type EnemyListData = [string, string];

export async function fetchEnemyList(): Promise<EnemyListData[]> {
  const { body } = await got("https://battlecats-db.com/enemy/atr_all.html", REQUEST_OPTIONS),
    { document } = new JSDOM(body, {
      url: "https://battlecats-db.com/enemy/atr_all.html",
    }).window,
    enemies = [...document.querySelectorAll("#List > tbody:first-of-type > tr:not(:first-child)")].map(row => {
      const { children } = row;
      return [
        children[0].textContent,
        children[3].querySelector("a").textContent
      ] as EnemyListData;
    });
  return enemies;
}
