import fs from "fs";

import { parseActors, parseConversations } from "./parsers.js";
import { validatePortraits } from "./validators.js";

const swc_db_raw = JSON.parse(fs.readFileSync("../data/SWCDB.json", "utf-8"));

const actors = parseActors(swc_db_raw);
const actorsById = Object.fromEntries(
  actors.map((actor) => [`${actor.id}`, actor]),
);

validatePortraits(actors);

const conversations = parseConversations(swc_db_raw, actorsById);

fs.writeFileSync(
  "../data/conversations.json",
  JSON.stringify({ data: conversations }),
);
fs.writeFileSync("../data/actors.json", JSON.stringify({ data: actors }));
