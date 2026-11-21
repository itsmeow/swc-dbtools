import { Handle, Position, type NodeProps } from "@xyflow/react";

import { type DialogueNode } from "./types";
import DialogueCanvas from "../components/DialogueCanvas";

export function DialogueNode({ data }: NodeProps<DialogueNode>) {
  const entry = data.entry;
  let hasNext = !!entry.outgoingLinks.find(
    (link) =>
      link.destinationConversationID !== undefined &&
      link.destinationDialogueID !== undefined,
  );
  return (
    <div className="dialogue_node_outer">
      {data.hasPrevious ? (
        <Handle type="target" position={Position.Top} />
      ) : null}
      {entry.title === "START" ? (
        <div>START</div>
      ) : (
        <div className="dialogue_node_inner" style={{ textAlign: "left" }}>
          {entry.dialogue_text ? (
            <DialogueCanvas
              speakerName={entry.actor.display_name}
              portrait={`/portraits/resources.assets-${entry.actor.portrait}.png`}
              text={entry.dialogue_text}
              displayScale={0.2}
            />
          ) : null}
          <div>
            <pre>
              <code>{entry.sequence}</code>
            </pre>
          </div>
          <div>
            <pre>
              <code>{entry.execute}</code>
            </pre>
          </div>
        </div>
      )}
      {hasNext ? <Handle type="source" position={Position.Bottom} /> : null}
    </div>
  );
}
