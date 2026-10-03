"use client";

import { useEffect } from "react";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "d":
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("shortcut:dispatch"));
            break;
          case "f":
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("shortcut:fleet"));
            break;
          case "a":
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("shortcut:analytics"));
            break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
