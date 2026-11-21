import fs from "fs";
import type { Actor } from "./swc_db.js";

export function validatePortraits(actors: Array<Actor>) {
  const portraitsReferenced: Set<number> = new Set([]);

  for (let actor of actors) {
    portraitsReferenced.add(actor.portrait);
    for (let portrait of actor.alternate_portraits) {
      portraitsReferenced.add(portrait);
    }
  }

  portraitsReferenced.delete(0);

  const validResources = Array.from(portraitsReferenced)
    .sort((a, b) => a - b)
    .map((x) => `resources.assets-${x}.png`);

  const dir = fs.readdirSync("../data/portraits");
  const keepDir = dir.filter((entry) =>
    validResources.find(
      (resourceId) => entry.endsWith(resourceId) || entry === resourceId,
    ),
  );

  let matchedNums: Set<number> = new Set([]);

  for (let file of dir) {
    let num = file.match(/resources\.assets-([0-9]+)\.png$/g);
    if (num === null) {
      continue;
    }
    matchedNums.add(
      parseInt(num[0].replace("resources.assets-", "").replace(".png", "")),
    );
  }

  let portraitsDiff = portraitsReferenced.difference(matchedNums);
  if (portraitsDiff.size !== 0) {
    console.log(
      "Not all portraits could be found in the data/portraits/ folder! Missing portrait IDs:",
    );
    console.log(portraitsDiff);
  }

  console.log("Cleaning up nonreferenced portraits from portraits folder.");

  for (let file of dir) {
    if (file.includes("/") || !file.endsWith(".png")) {
      continue;
    }
    if (!keepDir.includes(file)) {
      console.log(`Deleting file ${file}`);
      fs.unlinkSync(`../data/portraits/${file}`);
    } else if (!file.match(/^resources\.assets-([0-9]+)\.png$/g)) {
      fs.renameSync(
        `../data/portraits/${file}`,
        `../data/portraits/resources.assets${file.split("-resources.assets")[1]}`,
      );
    }
  }
  console.log("Portraits validated!");
}
