export function isFocusedOnElement() {
  const el = document.activeElement as HTMLElement;

  if (!el) return false;

  if (
    el.contentEditable === "true" ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.role === "menuitem"
  ) {
    // It's okay to trigger global keybinds from readonly inputs
    if (el.hasAttribute("readonly")) {
      return false;
    }
    return true;
  }

  return false;
}
