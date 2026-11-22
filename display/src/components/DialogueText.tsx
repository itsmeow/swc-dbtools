import { type CSSProperties, type ReactNode, useMemo } from "react";
import { ShakingText } from "./ShakingText";

interface DialogueTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

const NUMBER_PATTERN = `(?:[0-9]+\\.?[0-9]*|\\.[0-9]+)`;

// Matches either:
// - <shake|wiggle|i [a=num]>...</tag> (groups 1..3)
// - <size=val>...</size> (groups 4..5)
const TAG_PATTERN = new RegExp(
  `<(shake|wiggle|i)(?:\\s+a=(${NUMBER_PATTERN}))?>([\\s\\S]*?)<\\/?\\1>|<size=([^>]+)>([\\s\\S]*?)<\\/?size>`,
  "g",
);

function normalizeFontSize(rawSize: string): string {
  const trimmed = rawSize.trim();
  if (/^[+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)$/.test(trimmed)) {
    const num = Number.parseFloat(trimmed);
    return Number.isFinite(num) ? `${num * 100}%` : "75%";
  }
  return trimmed || "75%";
}

function parseAmount(rawAmount: string | undefined): number {
  if (!rawAmount) return 1;
  const parsed = Number.parseFloat(rawAmount);
  return Number.isFinite(parsed) ? parsed : 1;
}

function renderEffectContent(
  tag: "shake" | "wiggle" | "i",
  innerRaw: string,
  amountMultiplier: number,
  keyPrefix: string,
): ReactNode {
  // Recursively parse inner tags for <i>, <shake>, and <wiggle>
  const children = parseNodes(innerRaw, keyPrefix);
  const content: ReactNode = children.length > 0 ? children : innerRaw;

  if (tag === "i") {
    return <em key={`${keyPrefix}-em`}>{content}</em>;
  }

  // Extract plain text for ShakingText when possible, or pass children if nested
  const plainText =
    typeof content === "string" ? content : extractPlainText(innerRaw);

  const baseScale = tag === "wiggle" ? 16 : 10;
  return (
    <ShakingText
      key={`${keyPrefix}-motion`}
      text={plainText}
      amount={baseScale * amountMultiplier}
      durationMultiplier={tag === "wiggle" ? 8 : 1.1}
      wiggle={tag === "wiggle"}
    />
  );
}

// Strips tags if a tag is nested inside <shake> or <wiggle>, keeping readable characters
function extractPlainText(input: string): string {
  return input
    .replace(
      /<(?:shake|wiggle|i)(?:\s+a=[^>]+)?\s*>|<\/(?:shake|wiggle|i)>/g,
      "",
    )
    .replace(/<size=[^>]+>|<\/size>/g, "");
}

function parseNodes(input: string, keyPrefix = "root"): ReactNode[] {
  if (!input) return [];

  const result: ReactNode[] = [];
  let lastIndex = 0;
  let tokenIndex = 0;

  // Fresh regex instance per call avoids shared lastIndex bugs across recursion
  const pattern = new RegExp(TAG_PATTERN.source, "g");

  for (const match of input.matchAll(pattern)) {
    const fullMatch = match[0];
    const matchStart = match.index ?? 0;

    if (matchStart > lastIndex) {
      result.push(
        <span key={`${keyPrefix}-plain-${tokenIndex++}`}>
          {input.slice(lastIndex, matchStart)}
        </span>,
      );
    }

    const nextKey = `${keyPrefix}-${tokenIndex++}`;

    if (match[4] !== undefined) {
      const fontSize = normalizeFontSize(match[4]);
      const innerRaw = match[5] ?? "";
      const innerNodes = parseNodes(innerRaw, nextKey);

      result.push(
        <span key={nextKey} style={{ fontSize }}>
          {innerNodes.length > 0 ? innerNodes : innerRaw}
        </span>,
      );
    } else {
      const tag = match[1] as "shake" | "wiggle" | "i";
      const amountMultiplier = parseAmount(match[2]);
      const innerRaw = match[3] ?? "";

      result.push(
        renderEffectContent(tag, innerRaw, amountMultiplier, nextKey),
      );
    }

    lastIndex = matchStart + fullMatch.length;
  }

  if (lastIndex < input.length) {
    result.push(
      <span key={`${keyPrefix}-plain-${tokenIndex++}`}>
        {input.slice(lastIndex)}
      </span>,
    );
  }

  return result;
}

export function DialogueText({ text, className, style }: DialogueTextProps) {
  const nodes = useMemo(() => parseNodes(text), [text]);

  return (
    <span className={className} style={style}>
      {nodes.length > 0 ? nodes : text}
    </span>
  );
}

export default DialogueText;
