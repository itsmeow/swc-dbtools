import type { SWCDBSchema } from "./generated/swcdb.js";
import type {
  Actor,
  Conversation,
  DialogueEntry,
  RawDialogueEntry,
  SWCDBObject,
} from "./swc_db.js";

function safeGet(obj: any, key: string): any {
  return typeof obj === "object" && obj !== null && key in obj
    ? obj[key]
    : undefined;
}

function safeGetNumber(obj: any, key: string): number | undefined {
  if (typeof obj === "object" && obj !== null) {
    if (key in obj && typeof obj[key] === "number") {
      return obj[key];
    } else if (!(key in obj)) {
      return undefined;
    }
  }
  throw `Could not safeGetNumber for ${JSON.stringify(obj)} key ${key}`;
}

function findObjectValue(objects: Array<SWCDBObject>, key: string): string {
  for (let object of objects) {
    if (object.title === key) {
      return object.value;
    }
  }
  throw `Missing key ${key} in ${JSON.stringify(objects)}`;
}

function filterFields(
  fields: { [k: string]: unknown }[] | undefined,
): Array<SWCDBObject> {
  let out: Array<SWCDBObject> = [];
  if (fields === undefined) {
    return out;
  }
  for (let field of fields) {
    if (field === undefined) {
      continue;
    }
    if (typeof field.title !== "string") {
      continue;
    }
    if (typeof field.value !== "string") {
      continue;
    }
    if (typeof field.type !== "number") {
      continue;
    }
    if (typeof field.typeString !== "string") {
      continue;
    }
    out.push({
      title: field.title,
      value: field.value,
      type: field.type,
      typeString: field.typeString,
    });
  }
  return out;
}

export function parseActors(db: SWCDBSchema): Array<Actor> {
  let entries: Array<Actor> = [];
  if (!db.actors?.Array) {
    return [];
  }
  for (let entry of db.actors.Array) {
    const fields = filterFields(entry.fields?.Array);
    const isPlayer = findObjectValue(fields, "IsPlayer");
    if (entry.id === undefined) {
      throw `Invalid entry ID for actor ${JSON.stringify(entry)}`;
    }
    if (entry.portrait?.m_PathID === undefined) {
      throw `Invalid portrait ID for actor ${JSON.stringify(entry)}`;
    }
    entries.push({
      id: entry.id,
      portrait: entry.portrait?.m_PathID,
      alternate_portraits:
        entry.alternatePortraits?.Array?.flatMap((p) => {
          let val = safeGet(p, "m_PathID");
          if (typeof val === "number") {
            return [val];
          }
          return [];
        }) ?? [],
      name: findObjectValue(fields, "Name"),
      is_player: isPlayer === "True" ? true : false,
      node_color: findObjectValue(fields, "NodeColor"),
      display_name: findObjectValue(fields, "Display Name"),
      voice: findObjectValue(fields, "Voice"),
      pitch: parseFloat(findObjectValue(fields, "Pitch")),
    });
  }
  return entries;
}

function getActorAndConversant(
  entry: object,
  fields: SWCDBObject[],
  actorsById: { [k: string]: Actor },
): [Actor, Actor] {
  let actorId = parseInt(findObjectValue(fields, "Actor"));
  let actor = actorsById[`${actorId}`];
  if (!actor) {
    throw `Invalid actor ID for object ${JSON.stringify(entry)}`;
  }
  let conversantId = parseInt(findObjectValue(fields, "Conversant"));
  let conversant = actorsById[`${conversantId}`];
  if (!conversant) {
    console.log(`Invalid conversant ID for object ${JSON.stringify(entry)}`);
    console.log("Setting conversant ID to 2 (NPC)");
    conversant = actorsById["2"];
    if (!conversant) {
      throw "wtf";
    }
  }
  return [actor, conversant];
}

export function parseDialogue(
  raw: Array<RawDialogueEntry>,
  actorsById: { [k: string]: Actor },
): Array<DialogueEntry> {
  let entries: Array<DialogueEntry> = [];
  for (let entry of raw) {
    if (entry.id === undefined) {
      throw `Invalid entry ID for dialogue entry ${JSON.stringify(entry)}`;
    }
    if (entry.conversationID === undefined) {
      throw `Invalid conversation ID for dialogue entry ${entry.id}`;
    }
    if (entry.outgoingLinks === undefined) {
      throw `Invalid outgoing links for dialogue entry ${entry.id}`;
    }
    const fields = filterFields(entry.fields?.Array);
    let [actor, conversant] = getActorAndConversant(entry, fields, actorsById);
    entries.push({
      id: entry.id,
      title: findObjectValue(fields, "Title"),
      actor: actor,
      conversant: conversant,
      dialogue_text: findObjectValue(fields, "Dialogue Text"),
      sequence: findObjectValue(fields, "Sequence"),
      conversationID: entry.conversationID,
      outgoingLinks: {
        originConversationID: safeGetNumber(
          entry.outgoingLinks,
          "originConversationID",
        ),
        originDialogueID: safeGetNumber(
          entry.outgoingLinks,
          "originDialogueID",
        ),
        destinationConversationID: safeGetNumber(
          entry.outgoingLinks,
          "destinationConversationID",
        ),
        destinationDialogueID: safeGetNumber(
          entry.outgoingLinks,
          "destinationDialogueID",
        ),
      },
      execute: `${safeGet(entry, "onExecute")}`,
      condition: `${safeGet(entry, "conditionsString")}`,
    });
  }
  return entries;
}

export function parseConversations(
  db: SWCDBSchema,
  actorsById: { [k: string]: Actor },
): Array<Conversation> {
  let entries: Array<Conversation> = [];
  if (!db.conversations?.Array) {
    return [];
  }
  for (let entry of db.conversations.Array) {
    const fields = filterFields(entry.fields?.Array);
    if (entry.id === undefined) {
      throw `Invalid entry ID for conversation ${JSON.stringify(entry)}`;
    }
    if (entry.dialogueEntries?.Array === undefined) {
      throw `Undefined dialogue for conversation ${entry.id}`;
    }
    let [actor, conversant] = getActorAndConversant(entry, fields, actorsById);
    const dialogue = parseDialogue(entry.dialogueEntries?.Array, actorsById);
    entries.push({
      id: entry.id,
      title: findObjectValue(fields, "Title"),
      actor: actor,
      conversant: conversant,
      dialogue: dialogue,
    });
  }
  return entries;
}
