import { Conversation } from "../../../parser/src/swc_db.ts";

export default function ConversationSelector(props: ConversationSelectorProps) {
  return (
    <div className="list">
      <div className="list-inner">
        {props.conversations.map((convo) => (
          <div
            className={`list-item${props.selected === convo.id ? " active" : ""}`}
            onClick={(event) => {
              event.preventDefault();
              props.setSelected(convo.id);
            }}
          >
            {convo.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ConversationSelectorProps {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  conversations: Array<Conversation>;
}
