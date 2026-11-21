import type { NodeTypes } from "@xyflow/react";

import type { AppNode } from "./types";
import { DialogueNode } from "./DialogueNode";

export const initialNodes: AppNode[] = [];

export const nodeTypes = {
  dialogue: DialogueNode,
} satisfies NodeTypes;
