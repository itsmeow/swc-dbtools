import type { Node, BuiltInNode } from "@xyflow/react";
import { DialogueEntry } from "../../../parser/src/swc_db";

export type DialogueNode = Node<
  { entry: DialogueEntry; hasPrevious: boolean },
  "dialogue"
>;
export type AppNode = BuiltInNode | DialogueNode;
