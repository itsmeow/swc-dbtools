export interface SWCDBObject {
  title: string;
  value: string;
  type: number;
  typeString: string;
}

export interface Actor {
  id: number;
  portrait: number;
  alternate_portraits: Array<number>;
  name: string;
  is_player: boolean;
  node_color: string;
  display_name: string;
  voice: string;
  pitch: number;
}

export interface DialogueEntry {
  id: number;
  title: string;
  actor: Actor;
  conversant: Actor;
  dialogue_text: string;
  sequence: string;
  conversationID: number;
  outgoingLinks: {
    originConversationID: number | undefined;
    originDialogueID: number | undefined;
    destinationConversationID: number | undefined;
    destinationDialogueID: number | undefined;
  }[];
  execute: string;
  condition: string;
}

export interface Conversation {
  id: number;
  title: string;
  actor: Actor;
  conversant: Actor;
  dialogue: Array<DialogueEntry>;
}

// Auto-generated excerpts
export interface RawDialogueEntry {
  id?: number;
  fields?: {
    Array?: {
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  conversationID?: number;
  isRoot?: number;
  isGroup?: number;
  nodeColor?: string;
  delaySimStatus?: number;
  falseConditionAction?: string;
  conditionPriority?: number;
  outgoingLinks?: {
    Array?: unknown[];
    [k: string]: unknown;
  };
  conditionsString?: string;
  userScript?: string;
  onExecute?: {
    m_PersistentCalls?: {
      m_Calls?: {
        Array?: unknown[];
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  canvasRect?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
