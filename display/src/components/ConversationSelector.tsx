import { Conversation } from "../../../parser/src/swc_db.ts";
import { useEffect, useMemo, useState } from "react";
import { useTree } from "@headless-tree/react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  searchFeature,
  SetStateFn,
  expandAllFeature,
} from "@headless-tree/core";

interface ConversationItem {
  id: string;
  name: string;
  full_path: string;
  conversation?: Conversation;
  children?: string[];
  isFolder?: boolean;
}

const ROOT_ID = "root";

export function TreeConversationSelector({
  conversations,
  setSelected,
  searchValue,
  setSearchValue,
}: TreeConversationSelectorProps) {
  const items = useMemo<Record<string, ConversationItem>>(() => {
    const map: Record<string, ConversationItem> = {
      [ROOT_ID]: {
        id: ROOT_ID,
        name: "Root",
        full_path: ROOT_ID,
        isFolder: true,
        children: [],
      },
    };

    const childrenByParent = new Map<string, Set<string>>();
    const addChild = (parentId: string, childId: string) => {
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, new Set());
      }
      childrenByParent.get(parentId)!.add(childId);
    };

    for (const conversation of conversations) {
      const parts = conversation.title.split("/").filter(Boolean);
      if (parts.length === 0) continue;

      const leafName = parts[parts.length - 1];
      const leafId = conversation.title;

      map[leafId] = {
        id: leafId,
        name: leafName,
        full_path: conversation.title,
        conversation,
        isFolder: false,
      };

      let parentId = ROOT_ID;

      // Create intermediate folders and link each to its immediate parent
      for (let i = 0; i < parts.length - 1; i++) {
        const folderSegment = parts[i];
        const folderId = `${parts.slice(0, i + 1).join("/")}/`;

        if (!map[folderId]) {
          map[folderId] = {
            id: folderId,
            name: folderSegment,
            full_path: folderId,
            isFolder: true,
            children: [],
          };
        }

        addChild(parentId, folderId);
        parentId = folderId;
      }

      // Attach the leaf conversation to its immediate parent (folder or root)
      addChild(parentId, leafId);
    }

    for (const [parentId, childIds] of childrenByParent.entries()) {
      if (map[parentId]) {
        map[parentId].children = Array.from(childIds);
      }
    }

    return map;
  }, [conversations]);

  const tree = useTree<ConversationItem>({
    rootItemId: ROOT_ID,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().isFolder),
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    indent: 20,
    setSearch: setSearchValue,
    state: { search: searchValue },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      searchFeature,
      expandAllFeature,
    ],
  });

  const cancelToken = { current: false };

  const expand = () => {
    cancelToken.current = false;
    tree.expandAll(cancelToken);
  };

  return (
    <>
      <div className="list treewrapper">
        <div style={{ textAlign: "right" }}>
          <button onClick={expand}>Expand All</button>
          <button onClick={() => tree.collapseAll()}>Collapse All</button>
        </div>
        <div {...tree.getContainerProps()} className="list-inner tree">
          {tree.getItems().map((item) => (
            <div
              {...item.getProps()}
              className="treeitem"
              key={item.getId()}
              style={{
                paddingLeft: `${item.getItemMeta().level * 32 + (item.isFolder() ? 0 : 8)}px`,
                display:
                  searchValue && !item.isMatchingSearch() ? "none" : "inherit",
              }}
            >
              {item.isFolder() ? (
                <>
                  <button className="treeitem_btn list-item noimage">
                    {item.isExpanded() ? "-" : "+"}
                  </button>
                  <div
                    className="treeitem_name list-item"
                    style={{ display: "inline-block", width: "inherit" }}
                  >{`${item.getItemData().name}/`}</div>
                </>
              ) : (
                <>
                  <div
                    className={`treeitem_name list-item${item.isSelected() ? " active" : ""}`}
                    style={{ display: "inline-block" }}
                    onClick={(event) => {
                      event.preventDefault();
                      setSelected(item.getItemData().conversation?.id || 0);
                    }}
                  >
                    {item.getItemName()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function FlatConversationSelector({
  conversations,
  selected,
  setSelected,
}: ConversationSelectorProps) {
  return (
    <div className="list">
      <div className="list-inner">
        {conversations.map((convo) => (
          <div
            className={`list-item${selected === convo.id ? " active" : ""}`}
            onClick={(event) => {
              event.preventDefault();
              setSelected(convo.id);
            }}
          >
            {convo.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConversationSelector({
  conversations,
  selected,
  setSelected,
}: ConversationSelectorProps) {
  const [treeMode, setTreeMode] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string | null>("");
  const filteredConversations = searchValue
    ? conversations.filter((convo) =>
        convo.title.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : conversations;
  return (
    <>
      <div style={{ padding: "5px", display: "flex", gap: "2px" }}>
        <input
          type="text"
          placeholder="Search..."
          style={{ flexGrow: "1" }}
          value={searchValue || ""}
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
        />
        <button
          disabled={treeMode}
          onClick={(event) => {
            event.preventDefault();
            setTreeMode(true);
          }}
        >
          Tree
        </button>
        <button
          disabled={!treeMode}
          onClick={(event) => {
            event.preventDefault();
            setTreeMode(false);
          }}
        >
          Flat
        </button>
      </div>
      {filteredConversations.length ? (
        treeMode ? (
          <TreeConversationSelector
            conversations={conversations}
            selected={selected}
            setSelected={setSelected}
            searchValue={searchValue || ""}
            setSearchValue={setSearchValue}
          />
        ) : (
          <FlatConversationSelector
            conversations={filteredConversations}
            selected={selected}
            setSelected={setSelected}
          />
        )
      ) : null}
    </>
  );
}

export interface ConversationSelectorProps {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  conversations: Array<Conversation>;
}

export interface TreeConversationSelectorProps {
  searchValue: string;
  setSearchValue: SetStateFn<string | null>;
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  conversations: Array<Conversation>;
}
