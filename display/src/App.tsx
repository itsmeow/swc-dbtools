import { useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";

import "@xyflow/react/xy-theme.css";

import { Conversation } from "../../parser/src/swc_db.ts";
import rawJson from "../../data/conversations.json";

interface ConversationDataset {
  data: Conversation[];
}

const conversations = rawJson as ConversationDataset;

import { Actor } from "../../parser/src/swc_db.ts";
import rawActorJson from "../../data/actors.json";

interface ActorDataset {
  data: Actor[];
}

const actors = rawActorJson as ActorDataset;

import ConversationSelector from "./components/ConversationSelector";
import ActorSelector from "./components/ActorSelector.tsx";
import ConversationFlow from "./components/ConversationFlow.tsx";
import ActorInfo from "./components/ActorInfo.tsx";

export default function App() {
  const [selected, setSelected] = useState<number>(0);
  const [selectedActor, setSelectedActor] = useState<number>(0);
  const [panelMode, setPanelMode] = useState<string>("conversations");
  const myActor = actors.data.find((a) => a.id === selectedActor);
  return (
    <>
      <Group
        orientation="horizontal"
        style={{ overflow: "hidden", height: "100vh" }}
      >
        <Panel
          defaultSize="20%"
          minSize={20}
          maxSize={600}
          style={{ overflow: "hidden", height: "100vh" }}
        >
          <aside
            style={{
              height: "100%",
              maxHeight: "100vh",
              background: "black",
              color: "white",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "6px",
                  padding: "5px",
                }}
              >
                <button
                  disabled={panelMode === "conversations"}
                  onClick={(event) => {
                    event.preventDefault();
                    setPanelMode("conversations");
                  }}
                  style={{ flexGrow: "1", padding: "8px", fontSize: "1.25rem" }}
                >
                  Conversations
                </button>
                <button
                  disabled={panelMode === "actors"}
                  onClick={(event) => {
                    event.preventDefault();
                    setPanelMode("actors");
                  }}
                  style={{ flexGrow: "1", padding: "8px", fontSize: "1.25rem" }}
                >
                  Actors
                </button>
              </div>
              <div
                style={{ flexGrow: "1", overflowY: "scroll", height: "100%" }}
              >
                {panelMode === "actors" ? (
                  <ActorSelector
                    selected={selectedActor}
                    setSelected={setSelectedActor}
                    actors={actors.data}
                  />
                ) : (
                  <ConversationSelector
                    selected={selected}
                    setSelected={setSelected}
                    conversations={conversations.data}
                  />
                )}
              </div>
            </div>
          </aside>
        </Panel>
        <Separator style={{ width: "2px", backgroundColor: "#424242" }} />
        <Panel>
          <main style={{ height: "100%", padding: "0" }}>
            {panelMode === "conversations" ? (
              <ConversationFlow
                conversations={conversations.data}
                selected={selected}
              />
            ) : myActor ? (
              <ActorInfo actor={myActor} conversations={conversations.data} />
            ) : null}
          </main>
        </Panel>
      </Group>
    </>
  );
}
