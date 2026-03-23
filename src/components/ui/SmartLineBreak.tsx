import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";

type SmartLineBreakProps = {
  autoFit?: boolean;
  maxCharsPerLine?: number;
  maxLines?: number;
  minCharsPerLine?: number;
  text: string;
};

const sentenceBreakRegex = /[.!?)]$/;
const clauseBreakRegex = /[;:]$/;
const commaBreakRegex = /[,]$/;

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function getSmartLineBreaks(
  text: string,
  {
    maxCharsPerLine = 20,
    maxLines = 2,
    minCharsPerLine = 9,
  }: {
    maxCharsPerLine?: number;
    maxLines?: number;
    minCharsPerLine?: number;
  } = {},
) {
  const normalized = normalize(text);

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");

  if (words.length <= 1 || maxLines <= 1) {
    return [normalized];
  }

  const estimatedLines = Math.ceil(normalized.length / maxCharsPerLine);
  const targetLineCount = Math.max(1, Math.min(maxLines, estimatedLines));

  if (targetLineCount <= 1) {
    return [normalized];
  }

  const lines: string[] = [];
  let startWordIndex = 0;

  for (let lineIndex = 0; lineIndex < targetLineCount - 1; lineIndex += 1) {
    const remainingLines = targetLineCount - lineIndex;
    const remainingWords = words.length - startWordIndex;
    const requiredWordsForNextLines = remainingLines - 1;

    if (remainingWords <= remainingLines) {
      lines.push(words.slice(startWordIndex, startWordIndex + 1).join(" "));
      startWordIndex += 1;
      continue;
    }

    const remainingTextLength = words.slice(startWordIndex).join(" ").length;
    const idealLength = Math.round(remainingTextLength / remainingLines);
    const candidateStart = startWordIndex + 1;
    const candidateEnd = words.length - requiredWordsForNextLines;

    let bestBreakIndex = candidateStart;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let breakIndex = candidateStart; breakIndex <= candidateEnd; breakIndex += 1) {
      const candidateLine = words.slice(startWordIndex, breakIndex).join(" ");
      const lineLength = candidateLine.length;
      const previousWord = words[breakIndex - 1];

      const distancePenalty = Math.abs(lineLength - idealLength) * 3;
      const shortPenalty = lineLength < minCharsPerLine ? (minCharsPerLine - lineLength) * 4 : 0;
      const longPenalty = lineLength > maxCharsPerLine ? (lineLength - maxCharsPerLine) * 2 : 0;
      const isSentenceBreak = sentenceBreakRegex.test(previousWord);
      const isClauseBreak = clauseBreakRegex.test(previousWord);
      const isCommaBreak = commaBreakRegex.test(previousWord);

      let punctuationBonus = 0;
      let commaPenalty = 0;

      if (isSentenceBreak && lineLength >= minCharsPerLine) {
        punctuationBonus += 14;
      }

      if (isClauseBreak && lineLength >= minCharsPerLine + 1) {
        punctuationBonus += 8;
      }

      if (isCommaBreak) {
        const isNaturalCommaSplit =
          lineLength >= minCharsPerLine + 2 && lineLength <= maxCharsPerLine + 3;

        if (isNaturalCommaSplit) {
          punctuationBonus += 6;
        }

        if (lineLength < minCharsPerLine + 1) {
          commaPenalty += (minCharsPerLine + 1 - lineLength) * 5;
        }
      }

      const score = distancePenalty + shortPenalty + longPenalty + commaPenalty - punctuationBonus;

      if (score < bestScore) {
        bestScore = score;
        bestBreakIndex = breakIndex;
      }
    }

    lines.push(words.slice(startWordIndex, bestBreakIndex).join(" "));
    startWordIndex = bestBreakIndex;
  }

  lines.push(words.slice(startWordIndex).join(" "));

  return lines.filter(Boolean);
}

export default function SmartLineBreak({
  autoFit = true,
  maxCharsPerLine = 20,
  maxLines = 2,
  minCharsPerLine = 9,
  text,
}: SmartLineBreakProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [measuredMaxChars, setMeasuredMaxChars] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!autoFit) {
      return;
    }

    const root = rootRef.current;
    const container = root?.parentElement;

    if (!root || !container || typeof window === "undefined") {
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const fallbackSample = "가나다라마바사아자차카타파하";

    const updateMeasuredChars = () => {
      const width = container.clientWidth;

      if (width <= 0) {
        return;
      }

      const style = window.getComputedStyle(container);
      const fontStyle = style.fontStyle || "normal";
      const fontWeight = style.fontWeight || "400";
      const fontSize = style.fontSize || "16px";
      const fontFamily = style.fontFamily || "sans-serif";

      context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;

      const normalizedText = normalize(text);
      const measureTarget = normalizedText.length >= 4 ? normalizedText : fallbackSample;
      const measuredWidth = context.measureText(measureTarget).width;
      const averageCharWidth = measuredWidth > 0 ? measuredWidth / measureTarget.length : 10;
      const nextValue = Math.max(minCharsPerLine, Math.floor(width / averageCharWidth));

      setMeasuredMaxChars((current) => (current === nextValue ? current : nextValue));
    };

    updateMeasuredChars();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateMeasuredChars) : null;

    const fontSet = document.fonts;
    const handleFontLoadingDone = () => {
      updateMeasuredChars();
    };

    resizeObserver?.observe(container);
    window.addEventListener("resize", updateMeasuredChars);
    fontSet?.ready.then(updateMeasuredChars).catch(() => undefined);
    fontSet?.addEventListener?.("loadingdone", handleFontLoadingDone);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateMeasuredChars);
      fontSet?.removeEventListener?.("loadingdone", handleFontLoadingDone);
    };
  }, [autoFit, minCharsPerLine, text]);

  const effectiveMaxCharsPerLine = autoFit ? measuredMaxChars ?? maxCharsPerLine : maxCharsPerLine;

  const lines = useMemo(
    () =>
      getSmartLineBreaks(text, {
        maxCharsPerLine: effectiveMaxCharsPerLine,
        maxLines,
        minCharsPerLine,
      }),
    [effectiveMaxCharsPerLine, maxLines, minCharsPerLine, text],
  );

  return (
    <span ref={rootRef}>
      {lines.map((line, index) => (
        <Fragment key={`${line}-${index}`}>
          <span className="break-keep">{line}</span>
          {index < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </span>
  );
}
