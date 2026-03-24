"use client";

import { useEffect } from "react";
import { KeyBindingMap, tinykeys, Options } from "./tinykeys";

export function useShortcuts(keyBindingMap: KeyBindingMap, options?: Options) {
  useEffect(() => {
    return tinykeys(window, keyBindingMap, options);
  }, [keyBindingMap, options]);
}
