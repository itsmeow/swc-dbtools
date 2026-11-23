import { Actor } from "../../../parser/src/swc_db.ts";
import { useMemo } from "react";
import { useTree } from "@headless-tree/react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";

interface ActorItem {
  id: string;
  name: string;
  full_path: string;
  display_name?: string;
  actor?: Actor;
  children?: string[];
  isFolder?: boolean;
}

const ROOT_ID = "root";

export default function ActorSelector({
  actors,
  setSelected,
}: ActorSelectorProps) {
  const items = useMemo<Record<string, ActorItem>>(() => {
    const map: Record<string, ActorItem> = {
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

    for (const actor of actors) {
      const parts = actor.name.split("/").filter(Boolean);
      if (parts.length === 0) continue;

      const leafName = parts[parts.length - 1];
      const leafId = actor.name;

      map[leafId] = {
        id: leafId,
        name: leafName,
        full_path: actor.name,
        display_name: actor.display_name,
        actor,
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

      // Attach the leaf actor to its immediate parent (folder or root)
      addChild(parentId, leafId);
    }

    for (const [parentId, childIds] of childrenByParent.entries()) {
      if (map[parentId]) {
        map[parentId].children = Array.from(childIds);
      }
    }

    return map;
  }, [actors]);

  const tree = useTree<ActorItem>({
    rootItemId: ROOT_ID,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().isFolder),
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    indent: 20,
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <div className="list treewrapper">
      <div {...tree.getContainerProps()} className="list-inner tree">
        {tree.getItems().map((item) => (
          <div
            {...item.getProps()}
            className="treeitem"
            key={item.getId()}
            style={{
              paddingLeft: `${item.getItemMeta().level * 48}px`,
            }}
          >
            {item.isFolder() ? (
              <>
                <button className="treeitem_btn list-item">
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
                    setSelected(item.getItemData().actor?.id || 0);
                  }}
                >
                  {item.getItemData().actor?.portrait ? (
                    <img
                      src={`/portraits/resources.assets-${item.getItemData().actor?.portrait}.png`}
                      width="48px"
                      height="48px"
                      className="tree_img"
                    />
                  ) : (
                    <img
                      src={`/no_portrait.png`}
                      width="48px"
                      height="48px"
                      className="tree_img"
                    />
                  )}
                  {item.getItemData().display_name !== item.getItemName()
                    ? `${item.getItemData().display_name} (${item.getItemName()})`
                    : item.getItemName()}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ActorSelectorProps {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  actors: Array<Actor>;
}
