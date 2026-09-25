"use client";

/** Anchor link to a collapsed FAQ <details> that also expands it. */
export function FaqJumpLink({
  targetId,
  className,
  children,
}: {
  targetId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      className={className}
      onClick={() => {
        const el = document.getElementById(targetId);
        if (el instanceof HTMLDetailsElement) el.open = true;
      }}
    >
      {children}
    </a>
  );
}
