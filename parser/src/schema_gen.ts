import fs from "fs";
import toJsonSchema from "to-json-schema";
let swc_db_raw = JSON.parse(fs.readFileSync("../data/SWCDB.jsonSWCDB.json", "utf-8"));

const remove_keys: Array<string> = [
  "m_GameObject",
  "m_Enabled",
  "m_Script",
  "m_Name",
  "version",
  "author",
  "description",
  "globalUserScript",
  "emphasisSettings",
  "baseID",
  "templateJson",
];
for (let key of remove_keys) {
  delete swc_db_raw[key];
}

const schema = toJsonSchema(swc_db_raw);
fs.writeFileSync("SWCDB_schema.json", JSON.stringify(schema, null, 4));

import { compileFromFile } from "json-schema-to-typescript";

compileFromFile("SWCDB_schema.json").then((ts) =>
  fs.writeFileSync("src/generated/swcdb.d.ts", ts),
);
