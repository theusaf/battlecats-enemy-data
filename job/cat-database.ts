import got from "got";
import { JSDOM } from "jsdom";
import { scrapedIDs } from "./data.js";
import { REQUEST_OPTIONS } from "./util/constants.js";

export type EnemyListData = [string, string];

export async function fetchEnemyListing(): Promise<EnemyListData[]> {
  const url = "https://battlecats-db.com/enemy/atr_all.html",
    { body } = await got(url, REQUEST_OPTIONS),
    { document } = new JSDOM(body, { url }).window,
    enemies = [
      ...document.querySelectorAll(
        "#List > tbody:first-of-type > tr:not(:first-child)"
      ),
    ].map((row) => {
      const { children } = row;
      return [
        children[0].textContent,
        children[3].querySelector("a").textContent,
      ] as EnemyListData;
    });
  return enemies;
}

export async function getNewEnemies(): Promise<EnemyListData[]> {
  return (await fetchEnemyListing()).filter(([id]) => !scrapedIDs.has(id));
}

export interface BCDatabaseEnemy {
  dps: number;
  hp: number;
  attack: number;
  range: number;
  isSingleTarget: boolean;
  speed: number;
  knockbacks: number;
  cashDrop: number;
  id: string;
  attackFreqency: number; // in "frames"
  attackAnimation: number; // in "frames"
}

export async function getEnemyData(id: string): Promise<BCDatabaseEnemy> {
  const url = `https://battlecats-db.com/enemy/${id}.html`,
    { body } = await got(url, REQUEST_OPTIONS),
    { document } = new JSDOM(body, { url }).window,
    [
      health,
      knockbacks,
      attackFreqency,
      ,
      attack,
      speed,
      attackAnimation,
      ,
      dps,
      range,
      targetType,
      cashDrop,
    ] = [
      ...document.querySelectorAll(
        "#List > tbody:first-of-type tr:not(:first-child):not(.space) > .R"
      ),
    ].map((d) => d.firstElementChild?.textContent ?? d.textContent);
  return {
    dps: parseFloat(dps),
    hp: parseInt(health),
    attack: parseInt(attack),
    range: parseInt(range),
    isSingleTarget: targetType === "単体",
    speed: parseInt(speed),
    knockbacks: parseInt(knockbacks),
    cashDrop: parseInt(cashDrop),
    id,
    attackFreqency: parseInt(attackFreqency),
    attackAnimation: parseInt(attackAnimation),
  };
}
