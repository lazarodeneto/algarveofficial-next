type ServerShellState = {
  activeCount: number;
  display: string;
  ariaHidden: string | null;
  inert: string | null;
  dataMarker: string | null;
};

const hiddenServerShells = new WeakMap<HTMLElement, ServerShellState>();

function restoreAttribute(
  element: HTMLElement,
  attribute: string,
  previousValue: string | null,
) {
  if (previousValue === null) {
    element.removeAttribute(attribute);
    return;
  }

  element.setAttribute(attribute, previousValue);
}

export function hideServerShell(id: string): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  const serverShell = document.getElementById(id);
  if (!(serverShell instanceof HTMLElement)) {
    return () => {};
  }

  const existingState = hiddenServerShells.get(serverShell);
  if (existingState) {
    existingState.activeCount += 1;
    return () => {
      const currentState = hiddenServerShells.get(serverShell);
      if (!currentState) return;
      currentState.activeCount = Math.max(0, currentState.activeCount - 1);
      if (currentState.activeCount > 0) return;

      serverShell.style.display = currentState.display;
      restoreAttribute(serverShell, "aria-hidden", currentState.ariaHidden);
      restoreAttribute(serverShell, "inert", currentState.inert);
      restoreAttribute(serverShell, "data-client-hidden-server-shell", currentState.dataMarker);
      hiddenServerShells.delete(serverShell);
    };
  }

  const previousState: ServerShellState = {
    activeCount: 1,
    display: serverShell.style.display,
    ariaHidden: serverShell.getAttribute("aria-hidden"),
    inert: serverShell.getAttribute("inert"),
    dataMarker: serverShell.getAttribute("data-client-hidden-server-shell"),
  };

  hiddenServerShells.set(serverShell, previousState);
  serverShell.style.display = "none";
  serverShell.setAttribute("aria-hidden", "true");
  serverShell.setAttribute("inert", "");
  serverShell.setAttribute("data-client-hidden-server-shell", "true");

  return () => {
    const currentState = hiddenServerShells.get(serverShell);
    if (!currentState) return;

    currentState.activeCount = Math.max(0, currentState.activeCount - 1);
    if (currentState.activeCount > 0) return;

    serverShell.style.display = currentState.display;
    restoreAttribute(serverShell, "aria-hidden", currentState.ariaHidden);
    restoreAttribute(serverShell, "inert", currentState.inert);
    restoreAttribute(serverShell, "data-client-hidden-server-shell", currentState.dataMarker);
    hiddenServerShells.delete(serverShell);
  };
}
