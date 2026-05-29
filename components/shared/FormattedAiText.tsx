"use client";

import { Fragment, type ReactNode } from "react";

// Lightweight, dependency-free renderer for the small subset of Markdown the AI
// returns: **bold**, bullet lines (-, •, *), and line breaks. Renders to React
// nodes (never dangerouslySetInnerHTML) so model output can't inject markup.

function renderInline(text: string): ReactNode[] {
  // Split on **bold** — odd segments are bold.
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-bold text-on-surface">{part}</strong>
      : <Fragment key={i}>{part}</Fragment>
  );
}

const BULLET_RE = /^\s*[-•*]\s+/;

export default function FormattedAiText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-4 space-y-1 my-1">
        {bullets.map((b, i) => <li key={i}>{renderInline(b)}</li>)}
      </ul>
    );
    bullets = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (BULLET_RE.test(line)) {
      bullets.push(line.replace(BULLET_RE, ""));
    } else if (line.trim() === "") {
      flushBullets();
    } else {
      flushBullets();
      blocks.push(<p key={`p-${blocks.length}`} className="my-1 first:mt-0 last:mb-0">{renderInline(line)}</p>);
    }
  }
  flushBullets();

  return <div className={className}>{blocks}</div>;
}
