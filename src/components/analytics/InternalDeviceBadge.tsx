"use client";

import { useSyncExternalStore } from "react";
import { isInternalDevice } from "@/lib/internalTraffic";

const noSubscribe = () => () => {};

/** A small corner label, only on devices flagged with ?oaan_internal=on, so
 * the owner can see at a glance that this browser isn't being counted.
 * Server render is always "not internal", so there's no hydration mismatch. */
export function InternalDeviceBadge() {
  const internal = useSyncExternalStore(noSubscribe, isInternalDevice, () => false);
  if (!internal) return null;
  return (
    <div className="pointer-events-none fixed bottom-2 left-2 z-[2000] rounded bg-foreground/80 px-2 py-1 text-[10px] text-background">
      Not counted (internal device)
    </div>
  );
}
