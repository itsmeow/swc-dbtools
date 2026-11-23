import { Edge } from "@xyflow/react";
import { DialogueEntry, Conversation } from "../../../parser/src/swc_db";
import { AppNode } from "../nodes/types";
import { AppEdge } from "../edges/types";

export function dialogueEntryToNode(
  entry: DialogueEntry,
  hasPrevious: boolean,
): AppNode {
  return {
    id: `${entry.conversationID}:${entry.id}`,
    position: { x: 0, y: 0 },
    data: {
      entry: entry,
      hasPrevious: hasPrevious,
    },
    type: "dialogue",
  };
}

export function getDialogueEntry(
  conversations: Array<Conversation>,
  conversationId: number | undefined,
  dialogueEntryId: number | undefined,
): DialogueEntry | null {
  if (conversationId === undefined || dialogueEntryId === undefined) {
    return null;
  }
  let convo = conversations.find((c) => c.id === conversationId);
  if (!convo) {
    return null;
  }
  let dialogue = convo.dialogue.find((d) => d.id === dialogueEntryId);
  if (!dialogue) {
    return null;
  }
  return dialogue;
}

export function conversationToNodesAndEdges(
  conversations: Array<Conversation>,
  conversationId: number,
  prevEdges: Array<Edge> = [],
  evaluatedConversations: Array<number> = [],
): [AppNode[], AppEdge[]] {
  let convo = conversations.find((convo) => convo.id === conversationId);
  let newEdges = [...prevEdges];
  if (!convo) {
    return [[], []];
  }
  let newNodes: Array<AppNode> = [];
  for (let entry of convo.dialogue) {
    for (let link of entry.outgoingLinks) {
      let destinationDialogue = getDialogueEntry(
        conversations,
        link.destinationConversationID,
        link.destinationDialogueID,
      );
      newEdges.push({
        id: `${entry.conversationID}:${entry.id}-${link.destinationConversationID}:${link.destinationDialogueID}`,
        source: `${entry.conversationID}:${entry.id}`,
        target: `${link.destinationConversationID}:${link.destinationDialogueID}`,
        label:
          destinationDialogue?.condition !== ""
            ? destinationDialogue?.condition
            : undefined,
        type: "condition",
      });
      // Parse out external conversations.
      if (
        link.destinationConversationID !== undefined &&
        link.destinationConversationID !== 0 &&
        link.destinationConversationID !== entry.conversationID &&
        !evaluatedConversations.includes(link.destinationConversationID)
      ) {
        let [recursiveNodes, recursiveEdges] = conversationToNodesAndEdges(
          conversations,
          link.destinationConversationID,
          newEdges,
          [
            entry.conversationID,
            ...evaluatedConversations,
            link.destinationConversationID,
          ],
        );
        for (let node of recursiveNodes) {
          newNodes.push(node);
        }
        for (let edge of recursiveEdges) {
          newEdges.push(edge);
        }
      }
    }
  }
  for (let entry of convo.dialogue) {
    newNodes.push(
      dialogueEntryToNode(
        entry,
        !!newEdges.find(
          (edge) => edge.target === `${entry.conversationID}:${entry.id}`,
        ),
      ),
    );
  }
  return [newNodes, newEdges];
}
