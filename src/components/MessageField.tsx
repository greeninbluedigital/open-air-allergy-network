"use client";

import { useState } from "react";
import { LINKS_ERROR_MESSAGE, MESSAGE_MAX_LENGTH, containsLink } from "@/lib/forms";

const STYLES = {
  compact: {
    wrapper: "mb-2.5",
    label: "mb-0.5 block text-[11.5px] text-muted",
    textarea: "h-16 w-full resize-none rounded border border-line px-2 py-1.5 text-xs",
    footer: "text-[10.5px]",
  },
  default: {
    wrapper: "mb-4",
    label: "mb-1 block text-xs text-muted",
    textarea: "h-24 w-full resize-none rounded border border-line px-2.5 py-2 text-sm",
    footer: "mt-0.5 text-[11px]",
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
  const [hasLink, setHasLink] = useState(false);
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
        aria-invalid={hasLink}
        aria-describedby={hasLink ? `${name}-link-error` : undefined}
        onChange={(e) => {
          const link = containsLink(e.target.value);
          setLength(e.target.value.length);
          setHasLink(link);
          // Blocks submit with the browser's own message; the server checks too.
          e.target.setCustomValidity(link ? LINKS_ERROR_MESSAGE : "");
        }}
        className={s.textarea}
      />
      <div className={`flex justify-between gap-3 ${s.footer}`}>
        <span id={`${name}-link-error`} className="text-badge-founder-text">
          {hasLink ? LINKS_ERROR_MESSAGE : ""}
        </span>
        <span className="shrink-0 text-muted/70">
          {length} / {MESSAGE_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
