import readline from "node:readline";

export function displayOutput(
  currentItem: string,
  complete: number,
  total: number
) {
  readline.moveCursor(process.stdout, 0, -1);
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  process.stdout.write(`Current item: ${currentItem}`);
  readline.moveCursor(process.stdout, 0, 1);
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  process.stdout.write(`Progress: ${complete}/${total}`);
}
