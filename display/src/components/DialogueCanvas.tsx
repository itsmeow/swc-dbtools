import React, { useEffect, useRef, useState } from "react";
import DialogueText from "./DialogueText";

export interface DialogueCanvasProps {
  speakerName: string;
  portrait: string | null | undefined;
  text: string;
  fontScale?: number;
  dialogueBoxSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  displayScale?: number;
}

const PORTRAIT_WIDTH = 1024;
const PORTRAIT_HEIGHT = 1024;
const DIALOGUE_BOX_WIDTH = 2048;
const DIALOGUE_BOX_SCALE = 1.3;
const DIALOGUE_BOX_OFFSET_X = 650;
const DIALOGUE_BOX_OFFSET_Y = 320;
const PORTRAIT_SCALE = 1.0;

export const CANVAS_WIDTH =
  DIALOGUE_BOX_WIDTH * DIALOGUE_BOX_SCALE +
  PORTRAIT_WIDTH * PORTRAIT_SCALE -
  (PORTRAIT_WIDTH - DIALOGUE_BOX_OFFSET_X);
export const CANVAS_HEIGHT = PORTRAIT_HEIGHT;

const TEXT_FONT_SIZE = 90;
const TEXT_LINE_HEIGHT_RATIO = 1.4;
const TEXT_COLOR = "#E9B266";
const TEXT_OFFSET_X = 350;
const TEXT_OFFSET_Y = 150;
const TEXT_MAX_WIDTH = 2100;

const SPEAKER_NAME_FONT_SIZE = 116;
const SPEAKER_NAME_LINE_HEIGHT_RATIO = 1.2;
const SPEAKER_NAME_COLOR = "#F8FF00";
const SPEAKER_NAME_OFFSET_X = 295;
const SPEAKER_NAME_OFFSET_Y = -85;
const SPEAKER_NAME_SHADOW_BLUR = 15;
const SPEAKER_NAME_SHADOW_COLOR = "#8E2369CC";
const SPEAKER_NAME_SHADOW_COLOR_2 = "#8E236966";

const DIALOGUE_X = DIALOGUE_BOX_OFFSET_X;
const DIALOGUE_Y = DIALOGUE_BOX_OFFSET_Y;
const TEXT_LEFT_PX = DIALOGUE_X + TEXT_OFFSET_X;
const TEXT_TOP_PX = DIALOGUE_X > 0 ? DIALOGUE_Y + TEXT_OFFSET_Y : TEXT_OFFSET_Y;
const SPEAKER_LEFT_PX = DIALOGUE_X + SPEAKER_NAME_OFFSET_X;
const SPEAKER_TOP_PX = DIALOGUE_Y + SPEAKER_NAME_OFFSET_Y;

export const DialogueCanvas: React.FC<DialogueCanvasProps> = ({
  speakerName,
  portrait,
  text,
  fontScale = 1.0,
  dialogueBoxSrc = "Dialogue_Box.png",
  className,
  style,
  displayScale = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const portraitImgRef = useRef<HTMLImageElement | null>(null);
  const dialogueBoxImgRef = useRef<HTMLImageElement | null>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [hasValidPortrait, setHasValidPortrait] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = dialogueBoxSrc;
    dialogueBoxImgRef.current = img;

    const handleLoad = () => setRenderTick((n) => n + 1);
    img.addEventListener("load", handleLoad);
    return () => img.removeEventListener("load", handleLoad);
  }, [dialogueBoxSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!portrait) {
      portraitImgRef.current = null;
      setHasValidPortrait(false);
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let cancelled = false;
    setHasValidPortrait(false);

    const img = new Image();
    portraitImgRef.current = img;

    const handleLoad = () => {
      if (cancelled) return;
      setHasValidPortrait(img.naturalWidth > 0);
      setRenderTick((n) => n + 1);
    };

    const handleError = () => {
      if (cancelled) return;
      portraitImgRef.current = null;
      setHasValidPortrait(false);
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);
    img.src = portrait;

    return () => {
      cancelled = true;
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [portrait]);

  useEffect(() => {
    if (!hasValidPortrait) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const portraitImg = portraitImgRef.current;
    if (
      !portraitImg ||
      !portraitImg.complete ||
      portraitImg.naturalWidth === 0
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const portraitScale = Math.min(
      (PORTRAIT_WIDTH * PORTRAIT_SCALE) / portraitImg.width,
      (PORTRAIT_HEIGHT * PORTRAIT_SCALE) / portraitImg.height,
    );
    ctx.drawImage(
      portraitImg,
      0,
      0,
      portraitImg.width * portraitScale,
      portraitImg.height * portraitScale,
    );

    const boxImg = dialogueBoxImgRef.current;
    if (boxImg && boxImg.complete && boxImg.naturalWidth > 0) {
      const dialogueScale =
        DIALOGUE_BOX_SCALE *
        Math.min(
          DIALOGUE_BOX_WIDTH / boxImg.width,
          CANVAS_HEIGHT / boxImg.height,
        );
      ctx.drawImage(
        boxImg,
        DIALOGUE_X,
        DIALOGUE_Y,
        boxImg.width * dialogueScale,
        boxImg.height * dialogueScale,
      );
    }
  }, [hasValidPortrait, portrait, renderTick]);

  const speakerTextShadow = [
    `0 0 ${SPEAKER_NAME_SHADOW_BLUR}px ${SPEAKER_NAME_SHADOW_COLOR}`,
    `0 0 ${SPEAKER_NAME_SHADOW_BLUR}px ${SPEAKER_NAME_SHADOW_COLOR}`,
    `0 0 ${SPEAKER_NAME_SHADOW_BLUR * 1.25}px ${SPEAKER_NAME_SHADOW_COLOR_2}`,
    `0 0 ${SPEAKER_NAME_SHADOW_BLUR * 1.5}px ${SPEAKER_NAME_SHADOW_COLOR_2}`,
  ].join(", ");

  if (!hasValidPortrait) {
    const scale = displayScale ?? 1;
    const fallbackSpeakerFontSize = SPEAKER_NAME_FONT_SIZE * fontScale * scale;
    const fallbackTextFontSize = TEXT_FONT_SIZE * fontScale * scale;
    const fallbackShadowBlur = SPEAKER_NAME_SHADOW_BLUR * scale;

    const fallbackTextShadow = [
      `0 0 ${fallbackShadowBlur}px ${SPEAKER_NAME_SHADOW_COLOR}`,
      `0 0 ${fallbackShadowBlur}px ${SPEAKER_NAME_SHADOW_COLOR}`,
      `0 0 ${fallbackShadowBlur * 1.25}px ${SPEAKER_NAME_SHADOW_COLOR_2}`,
      `0 0 ${fallbackShadowBlur * 1.5}px ${SPEAKER_NAME_SHADOW_COLOR_2}`,
    ].join(", ");

    return (
      <div
        className={className}
        style={{
          position: "static",
          maxWidth: "500px",
          ...style,
        }}
      >
        {speakerName && (
          <div
            style={{
              fontFamily: '"NewRocker", sans-serif',
              fontSize: `${fallbackSpeakerFontSize}px`,
              lineHeight: SPEAKER_NAME_LINE_HEIGHT_RATIO,
              color: SPEAKER_NAME_COLOR,
              textShadow: fallbackTextShadow,
              background: "transparent",
              userSelect: "text",
              textAlign: "left",
            }}
          >
            {speakerName}
          </div>
        )}

        {text && (
          <div
            style={{
              fontFamily: '"Geo", sans-serif',
              fontSize: `${fallbackTextFontSize}px`,
              lineHeight: TEXT_LINE_HEIGHT_RATIO,
              color: TEXT_COLOR,
              background: "transparent",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
              userSelect: "text",
              textAlign: "left",
            }}
          >
            <DialogueText text={text} />
          </div>
        )}
      </div>
    );
  }

  const scale = displayScale ?? 1;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: `${CANVAS_WIDTH * scale}px`,
        height: `${CANVAS_HEIGHT * scale}px`,
        ...style,
      }}
    >
      <div
        className="dialogue_box"
        style={{
          position: "relative",
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-hidden="true"
          style={{ display: "block", width: "100%", height: "100%" }}
        />

        {speakerName && (
          <div
            style={{
              position: "absolute",
              left: `${(SPEAKER_LEFT_PX / CANVAS_WIDTH) * 100}%`,
              top: `${(SPEAKER_TOP_PX / CANVAS_HEIGHT) * 100}%`,
              fontFamily: '"NewRocker", sans-serif',
              fontSize: `${SPEAKER_NAME_FONT_SIZE}px`,
              lineHeight: SPEAKER_NAME_LINE_HEIGHT_RATIO,
              color: SPEAKER_NAME_COLOR,
              textShadow: speakerTextShadow,
              background: "transparent",
              whiteSpace: "nowrap",
              userSelect: "text",
            }}
          >
            {speakerName}
          </div>
        )}

        {text && (
          <div
            style={{
              position: "absolute",
              left: `${(TEXT_LEFT_PX / CANVAS_WIDTH) * 100}%`,
              top: `${(TEXT_TOP_PX / CANVAS_HEIGHT) * 100}%`,
              width: `${(TEXT_MAX_WIDTH / CANVAS_WIDTH) * 100}%`,
              fontFamily: '"Geo", sans-serif',
              fontSize: `${TEXT_FONT_SIZE * fontScale}px`,
              lineHeight: TEXT_LINE_HEIGHT_RATIO,
              color: TEXT_COLOR,
              background: "transparent",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
              userSelect: "text",
              textAlign: "left",
            }}
          >
            <DialogueText text={text} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogueCanvas;
