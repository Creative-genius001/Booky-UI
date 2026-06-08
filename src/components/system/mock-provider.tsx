"use client";

import { useEffect, useState, type ReactNode } from "react";

const MOCKING_ENABLED = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

/**
 * Boots the MSW browser worker for end-to-end tests. Gated behind
 * NEXT_PUBLIC_API_MOCKING so it never ships in normal builds — the dynamic
 * import keeps msw out of the production bundle. Children render immediately
 * when mocking is off; when on, render waits until the worker is ready so no
 * request escapes the mock layer.
 */
export function MockProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!MOCKING_ENABLED);

  useEffect(() => {
    if (!MOCKING_ENABLED) return;
    let active = true;
    import("@/test/browser").then(({ worker }) =>
      worker
        .start({ onUnhandledRequest: "bypass", quiet: true })
        .then(() => active && setReady(true)),
    );
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
