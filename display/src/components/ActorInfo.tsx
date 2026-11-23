import { Actor, Conversation } from "../../../parser/src/swc_db";

export default function ActorInfo({
  actor,
  conversations,
}: {
  actor: Actor;
  conversations: Conversation[];
}) {
  return (
    <div className="actor_info">
      {actor.portrait ? (
        <img
          src={`/portraits/resources.assets-${actor.portrait}.png`}
          width="256px"
          height="256px"
          style={{ float: "left" }}
        />
      ) : (
        <img
          src={`/no_portrait.png`}
          width="256px"
          height="256px"
          style={{ float: "left" }}
        />
      )}
      <h2 style={{ marginBottom: 0, color: "yellow" }}>{actor.display_name}</h2>
      <code>ID: {actor.id}</code>
      <br />
      <code>Path: {actor.name}</code>
      <br />
      <code>Is Player: {actor.is_player ? "✅" : "❌"}</code>
      <br />
      <code>
        Voice: {actor.voice} - Pitch: {actor.pitch}
      </code>
      {actor.alternate_portraits.length &&
      actor.alternate_portraits.length > 0 ? (
        <div>
          <h2>Alternate Portraits</h2>
          {actor.alternate_portraits.map((portrait) => (
            <img
              src={`/portraits/resources.assets-${portrait}.png`}
              width="256px"
              height="256px"
              style={{ float: "left" }}
            />
          ))}
        </div>
      ) : null}
      <div style={{ clear: "both" }}>
        <h2 style={{ paddingBottom: 0, marginBottom: 0 }}>Conversations</h2>
        <pre style={{ paddingTop: 0, marginTop: 0 }}>
          {conversations
            .filter(
              (convo) =>
                convo.actor.id === actor.id ||
                convo.conversant.id === actor.id ||
                convo.dialogue.find(
                  (d) =>
                    d.actor.id === actor.id || d.conversant.id === actor.id,
                ),
            )
            .map(
              (convo) =>
                `${convo.title} - ${convo.actor.id === actor.id ? "A" : "X"}${convo.conversant.id === actor.id ? "C" : "X"}${
                  convo.dialogue.find((d) => d.actor.id === actor.id)
                    ? "A"
                    : "X"
                }${
                  convo.dialogue.find((d) => d.conversant.id === actor.id)
                    ? "C"
                    : "X"
                }`,
            )
            .join("\n")}
        </pre>
      </div>
    </div>
  );
}
