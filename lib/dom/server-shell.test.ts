import { afterEach, describe, expect, it } from "vitest";

import { hideServerShell } from "@/lib/dom/server-shell";

describe("hideServerShell", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hides and restores a server shell without removing it from the DOM", () => {
    const shell = document.createElement("div");
    shell.id = "directory-server-shell";
    shell.style.display = "block";
    document.body.appendChild(shell);

    const restore = hideServerShell("directory-server-shell");

    expect(shell.isConnected).toBe(true);
    expect(shell.style.display).toBe("none");
    expect(shell.getAttribute("aria-hidden")).toBe("true");
    expect(shell.hasAttribute("inert")).toBe(true);

    restore();

    expect(shell.isConnected).toBe(true);
    expect(shell.style.display).toBe("block");
    expect(shell.hasAttribute("aria-hidden")).toBe(false);
    expect(shell.hasAttribute("inert")).toBe(false);
  });

  it("ignores missing shells safely", () => {
    expect(() => hideServerShell("missing-shell")()).not.toThrow();
  });

  it("restores pre-existing accessibility and marker attributes exactly", () => {
    const shell = document.createElement("section");
    shell.id = "map-server-shell";
    shell.style.display = "contents";
    shell.setAttribute("aria-hidden", "false");
    shell.setAttribute("inert", "inert");
    shell.setAttribute("hidden", "");
    shell.setAttribute("data-client-hidden-server-shell", "legacy");
    document.body.appendChild(shell);

    const restore = hideServerShell("map-server-shell");

    expect(shell.style.display).toBe("none");
    expect(shell.getAttribute("aria-hidden")).toBe("true");
    expect(shell.getAttribute("inert")).toBe("");
    expect(shell.hasAttribute("hidden")).toBe(true);
    expect(shell.getAttribute("data-client-hidden-server-shell")).toBe("true");

    restore();

    expect(shell.style.display).toBe("contents");
    expect(shell.getAttribute("aria-hidden")).toBe("false");
    expect(shell.getAttribute("inert")).toBe("inert");
    expect(shell.hasAttribute("hidden")).toBe(true);
    expect(shell.getAttribute("data-client-hidden-server-shell")).toBe("legacy");
  });

  it("is idempotent under overlapping hide calls and repeated cleanup", () => {
    const shell = document.createElement("div");
    shell.id = "events-server-shell";
    shell.style.display = "grid";
    document.body.appendChild(shell);

    const restoreFirst = hideServerShell("events-server-shell");
    const restoreSecond = hideServerShell("events-server-shell");

    restoreFirst();

    expect(shell.style.display).toBe("none");
    expect(shell.getAttribute("aria-hidden")).toBe("true");
    expect(shell.hasAttribute("inert")).toBe(true);

    restoreSecond();
    restoreSecond();
    restoreFirst();

    expect(shell.style.display).toBe("grid");
    expect(shell.hasAttribute("aria-hidden")).toBe(false);
    expect(shell.hasAttribute("inert")).toBe(false);
  });

  it("restores state even if the shell is detached before cleanup", () => {
    const shell = document.createElement("div");
    shell.id = "blog-server-shell";
    shell.style.display = "flex";
    document.body.appendChild(shell);

    const restore = hideServerShell("blog-server-shell");

    shell.remove();
    restore();

    expect(shell.style.display).toBe("flex");
    expect(shell.hasAttribute("aria-hidden")).toBe(false);
    expect(shell.hasAttribute("inert")).toBe(false);
  });
});
