import { useCallback, useEffect } from "react";
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
import Dagre from "@dagrejs/dagre";

import "@xyflow/react/xy-theme.css";

import { Conversation } from "../../../parser/src/swc_db.ts";

import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";

import { conversationToNodesAndEdges } from "../conversion/node_parser.ts";
import { AppNode } from "../nodes/types.ts";
import { AppEdge } from "../edges/types.ts";

export default function ConversationFlow({
  conversations,
  selected,
}: ConversationFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );

  useEffect(() => {
    let [newNodes, newEdges] = conversationToNodesAndEdges(
      conversations,
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
      return {
        ...node,
        position: { x: x * scaleFactor * 1.5, y: y * scaleFactor },
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [selected]);

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}

export interface ConversationFlowProps {
  conversations: Conversation[];
  selected: number;
}
