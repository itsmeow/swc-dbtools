import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";

import { type ConditionEdge } from "./types";

export function ConditionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  label,
}: EdgeProps<ConditionEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  if (!label || typeof label !== "string" || !(label?.length > 0)) {
    return <BaseEdge id={id} path={edgePath} />;
  }
  let singleCheck = label.match(/^Variable\[\"(.+)\"\] *== *(true|false)$/);
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className={`condition_edge nodrag nopan${singleCheck ? " singlecheck_" + singleCheck[2] : ""}`}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {label
            .replace(/== true/g, "✅")
            .replace(/== false/g, "❌")
            .replace(/~= true/g, "❌/❔")
            .replace(/~= false/g, "✅/❔")
            .replace(/Variable\[\"(.+?)\"\]/g, "$1")
            .replace(/ and /g, "\nand\n")
            .replace(/ or /g, "\nor\n")}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
