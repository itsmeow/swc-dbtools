import { Handle, Position, type NodeProps } from "@xyflow/react";

import { type DialogueNode } from "./types";
import DialogueCanvas from "../components/DialogueCanvas";
import SequenceDisplay from "../components/SequenceDisplay";

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
        <div>
          START
          <br />
          <span className="smaller">({entry.conversationID})</span>
        </div>
      ) : (
        <div className="dialogue_node_inner" style={{ textAlign: "left" }}>
          {entry.dialogue_text ? (
            <DialogueCanvas
              speakerName={entry.actor.display_name}
              portrait={`/portraits/resources.assets-${entry.actor.portrait}.png`}
              text={entry.dialogue_text}
              displayScale={0.2}
              style={{ marginBottom: "10px" }}
            />
          ) : null}
          {entry.sequence.length > 0 ? (
            <div>
              <SequenceDisplay text={entry.sequence} />
            </div>
          ) : null}
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
