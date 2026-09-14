"use client";

import { useState } from "react";

export function MessageField() {
  const [length, setLength] = useState(0);

  return (
    <div className="mb-2.5">
      <label className="mb-0.5 block text-[11.5px] text-muted" htmlFor="message">
        Message
      </label>
      <textarea
        id="message"
        name="message"
        maxLength={500}
        required
        onChange={(e) => setLength(e.target.value.length)}
        className="h-16 w-full resize-none rounded border border-line px-2 py-1.5 text-xs"
      />
      <div className="text-right text-[10.5px] text-muted/70">{length} / 500</div>
    </div>
  );
}
