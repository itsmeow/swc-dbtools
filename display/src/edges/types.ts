import type { Edge, BuiltInEdge } from "@xyflow/react";

export type ConditionEdge = Edge<{ label: string }, "condition">;
export type AppEdge = BuiltInEdge | ConditionEdge;
