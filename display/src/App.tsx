import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from "@xyflow/react";
import { Panel, Group, Separator } from "react-resizable-panels";
import Dagre from "@dagrejs/dagre";

import "@xyflow/react/xy-theme.css";

import { Conversation } from "../../parser/src/swc_db.ts";
import rawJson from "../../data/conversations.json";

interface ConversationDataset {
  data: Conversation[];
}

const conversations = rawJson as ConversationDataset;

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges } from "./edges";
import ConversationSelector from "./components/ConversationSelector";
import { conversationToNodesAndEdges } from "./conversion/node_parser.ts";

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );
  const [selected, setSelected] = useState<number>(0);

  useEffect(() => {
    let [newNodes, newEdges] = conversationToNodesAndEdges(
      conversations.data,
      selected,
    );

    newEdges = newEdges.filter(
      (obj1, i, arr) => arr.findIndex((obj2) => obj2.id === obj1.id) === i,
    );
    newNodes = newNodes.filter(
      (obj1, i, arr) => arr.findIndex((obj2) => obj2.id === obj1.id) === i,
    );

    const g = new Dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB" });
    g.setDefaultEdgeLabel(() => ({}));

    const scaleFactor = 10;

    newEdges.forEach((edge) => g.setEdge(edge.source, edge.target));
    newNodes.forEach((node) =>
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      }),
    );

    Dagre.layout(g);

    newNodes = newNodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;
      return { ...node, position: { x: x * scaleFactor, y: y * scaleFactor } };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [selected]);

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
              <div>
                <h2 style={{ textAlign: "center", padding: "1rem" }}>
                  Conversations
                </h2>
              </div>
              <div
                style={{ flexGrow: "1", overflowY: "scroll", height: "100%" }}
              >
                <ConversationSelector
                  selected={selected}
                  setSelected={setSelected}
                  conversations={conversations.data}
                />
              </div>
            </div>
          </aside>
        </Panel>
        <Separator style={{ width: "2px", backgroundColor: "#424242" }} />
        <Panel>
          <main style={{ height: "100%", padding: "0" }}>
            <ReactFlow
              nodes={nodes}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </main>
        </Panel>
      </Group>
    </>
  );
}
