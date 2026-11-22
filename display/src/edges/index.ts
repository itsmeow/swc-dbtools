import type { EdgeTypes } from "@xyflow/react";

import { ConditionEdge } from "./ConditionEdge";

export const edgeTypes = {
  condition: ConditionEdge,
} satisfies EdgeTypes;
