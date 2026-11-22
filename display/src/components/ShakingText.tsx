import { type CSSProperties, useMemo } from "react";

interface ShakingTextProps {
  text: string;
  amount?: number;
  maxDelayMs?: number;
  durationMultiplier?: number;
  wiggle?: boolean;
  className?: string;
}

type ShakeWrapperStyle = CSSProperties & {
  "--shake-distance"?: string;
  "--shake-duration"?: string;
};

type ShakeCharStyle = CSSProperties & {
  "--shake-delay"?: string;
  "--dx1"?: number;
  "--dy1"?: number;
  "--dx2"?: number;
  "--dy2"?: number;
  "--dx3"?: number;
  "--dy3"?: number;
  "--dx4"?: number;
  "--dy4"?: number;
  "--dx5"?: number;
  "--dy5"?: number;
  "--dx6"?: number;
  "--dy6"?: number;
  "--dx7"?: number;
  "--dy7"?: number;
};

interface CharConfig {
  id: string;
  char: string;
  style: ShakeCharStyle;
}

function randAxis(minMagnitude = 0.35): number {
  const sign = Math.random() < 0.5 ? -1 : 1;
  const mag = minMagnitude + Math.random() * (1 - minMagnitude);
  return Number((sign * mag).toFixed(3));
}

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createWiggleDirections(): Pick<
  ShakeCharStyle,
  | "--dx1"
  | "--dy1"
  | "--dx2"
  | "--dy2"
  | "--dx3"
  | "--dy3"
  | "--dx4"
  | "--dy4"
  | "--dx5"
  | "--dy5"
  | "--dx6"
  | "--dy6"
  | "--dx7"
  | "--dy7"
> {
  const angle = randBetween(0, Math.PI * 2);
  const cos = Number(Math.cos(angle).toFixed(3));
  const sin = Number(Math.sin(angle).toFixed(3));

  // Alternate +1 and -1 along the same angle vector for back-and-forth motion
  const signs = [1, -1, 1, -1, 1, -1, 1] as const;

  return {
    "--dx1": cos * signs[0],
    "--dy1": sin * signs[0],
    "--dx2": cos * signs[1],
    "--dy2": sin * signs[1],
    "--dx3": cos * signs[2],
    "--dy3": sin * signs[2],
    "--dx4": cos * signs[3],
    "--dy4": sin * signs[3],
    "--dx5": cos * signs[4],
    "--dy5": sin * signs[4],
    "--dx6": cos * signs[5],
    "--dy6": sin * signs[5],
    "--dx7": cos * signs[6],
    "--dy7": sin * signs[6],
  };
}

function createShakeDirections(): Pick<
  ShakeCharStyle,
  | "--dx1"
  | "--dy1"
  | "--dx2"
  | "--dy2"
  | "--dx3"
  | "--dy3"
  | "--dx4"
  | "--dy4"
  | "--dx5"
  | "--dy5"
  | "--dx6"
  | "--dy6"
  | "--dx7"
  | "--dy7"
> {
  return {
    "--dx1": randAxis(),
    "--dy1": randAxis(),
    "--dx2": randAxis(),
    "--dy2": randAxis(),
    "--dx3": randAxis(),
    "--dy3": randAxis(),
    "--dx4": randAxis(),
    "--dy4": randAxis(),
    "--dx5": randAxis(),
    "--dy5": randAxis(),
    "--dx6": randAxis(),
    "--dy6": randAxis(),
    "--dx7": randAxis(),
    "--dy7": randAxis(),
  };
}

export function ShakingText({
  text,
  amount = 5,
  maxDelayMs = 600,
  durationMultiplier = 1,
  wiggle = false,
  className = "",
}: ShakingTextProps) {
  const chars = useMemo<CharConfig[]>(() => {
    return Array.from(text).map((char, index) => ({
      id: `${index}-${char}`,
      char: char === " " ? "\u00A0" : char,
      style: {
        "--shake-delay": `-${Math.round(randBetween(0, maxDelayMs))}ms`,
        ...(wiggle ? createWiggleDirections() : createShakeDirections()),
      },
    }));
  }, [text, maxDelayMs, wiggle]);

  const wrapperStyle: ShakeWrapperStyle = {
    "--shake-distance": `${amount}px`,
    "--shake-duration": `${(2000 * durationMultiplier) / Math.max(0.1, amount)}ms`,
  };

  return (
    <span
      className={className}
      data-wiggle={wiggle ? "true" : undefined}
      style={wrapperStyle}
    >
      {chars.map(({ id, char, style }) => (
        <span
          key={id}
          className={`shaking-char${wiggle ? " shaking-char--wiggle" : ""}`}
          style={style}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
