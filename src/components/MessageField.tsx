"use client";

import { useState } from "react";
import { MESSAGE_MAX_LENGTH } from "@/lib/forms";

const STYLES = {
  compact: {
    wrapper: "mb-2.5",
    label: "mb-0.5 block text-[11.5px] text-muted",
    textarea: "h-16 w-full resize-none rounded border border-line px-2 py-1.5 text-xs",
    counter: "text-right text-[10.5px] text-muted/70",
  },
  default: {
    wrapper: "mb-4",
    label: "mb-1 block text-xs text-muted",
    textarea: "h-24 w-full resize-none rounded border border-line px-2.5 py-2 text-sm",
    counter: "mt-0.5 text-right text-[11px] text-muted/70",
  },
};

export function MessageField({
  name = "message",
  label = "Message",
  required = true,
  variant = "compact",
}: {
  name?: string;
  label?: string;
  required?: boolean;
  variant?: keyof typeof STYLES;
}) {
  const [length, setLength] = useState(0);
  const s = STYLES[variant];

  return (
    <div className={s.wrapper}>
      <label className={s.label} htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        maxLength={MESSAGE_MAX_LENGTH}
        required={required}
        onChange={(e) => setLength(e.target.value.length)}
        className={s.textarea}
      />
      <div className={s.counter}>
        {length} / {MESSAGE_MAX_LENGTH}
      </div>
    </div>
  );
}
