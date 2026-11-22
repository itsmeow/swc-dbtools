import { type CSSProperties } from "react";

interface SequenceDisplayProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

interface Statement {
  offset: number;
  calledFunction: string;
  arguments?: Array<string>;
}

const function_friendlyNames: Record<string, string> = {
  FMODPlayOneShot: "Play Sound",
  AnimatorPlay: "Play Animation",
  FadeIn: "Fade-From-Black",
  MoveTo: "Move Object",
  FOV: "Set FOV",
  Camera: "Move Camera",
  CameraEase: "Move Camera (Smooth)",
  KeepCameraPosition: "Stop Camera",
  FadeOut: "Fade-To-Black",
  UnlockLogbook: "Unlock Logbook",
  SetActive: "Set Flag",
  Caption: "Display Caption",
};

function statementToLineItem(
  statement: Statement,
  statementIdx: number,
): React.ReactNode {
  if (statement.calledFunction === "SetContinueMode") {
    return (
      <tr className="sequence_line" key={statementIdx}>
        <td>Allow Next Dialogue</td>
        <td className="sequence_argument">
          {statement.arguments?.length
            ? statement.arguments[0] === "true"
              ? "✅"
              : "❌"
            : "❌"}
        </td>
        {statement.offset !== 0 ? (
          <div className="sequence_offset">at {statement.offset}sec</div>
        ) : null}
      </tr>
    );
  }
  return (
    <tr className="sequence_line" key={statementIdx}>
      <td>
        {statement.calledFunction in function_friendlyNames
          ? function_friendlyNames[statement.calledFunction]
          : statement.calledFunction}
      </td>
      {statement.arguments?.length &&
      statement.arguments.length > 0 &&
      statement.arguments[0] !== ""
        ? statement.arguments.map((arg, i) => (
            <td key={`${statementIdx}-arg-${i}`} className="sequence_argument">
              {arg.length === 0 ? "[empty]" : arg}
            </td>
          ))
        : null}
      {statement.offset !== 0 ? (
        <div className="sequence_offset">at {statement.offset}sec</div>
      ) : null}
    </tr>
  );
}

export function SequenceDisplay({
  text,
  className,
  style,
}: SequenceDisplayProps) {
  if (text === "") {
    return null;
  }
  const statements = text.split("\n").flatMap((t) => t.split(";")); // split at statement delimiters
  const statementItems = statements
    .filter((s) => s.length > 0)
    .map<Statement | null>((statement) => {
      let statementParsed = statement.match(
        /^(\S+)\((.*)\)(?:@([0-9]*(?:\.[0-9]+)?))?$/,
      );
      if (
        !statementParsed ||
        statementParsed?.[0] === null ||
        statementParsed.length < 2
      ) {
        console.log(`Can't parse statement '${statement}': ${statementParsed}`);
        return null;
      }
      let calledFunction = statementParsed[1];
      let args: Array<string> = [];
      if (statementParsed.length >= 3) {
        args = statementParsed[2].split(/ *, */);
      }
      let offset = 0;
      if (statementParsed.length >= 4) {
        let parsedFloat = parseFloat(statementParsed[3]);
        offset = Number.isNaN(parsedFloat) ? 0 : parsedFloat;
      }
      return {
        calledFunction: calledFunction,
        offset: offset,
        arguments: args.length > 0 ? args : undefined,
      };
    })
    .filter((s) => s != null)
    .map((s, i) => statementToLineItem(s, i));
  return (
    <table className={className} style={style}>
      <tbody>{statementItems}</tbody>
    </table>
  );
}

export default SequenceDisplay;
