import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

const STATUS_ID = "catppuccin-tui";

const macchiato = {
  mauve: "#c6a0f6",
  blue: "#8aadf4",
  lavender: "#b7bdf8",
  green: "#a6da95",
  peach: "#f5a97f",
  subtext0: "#a5adcb",
  overlay1: "#8087a2",
};

const themeLabels: Record<string, string> = {
  "catppuccin-tui-latte": "Latte",
  "catppuccin-tui-frappe": "Frappé",
  "catppuccin-tui-macchiato": "Macchiato",
  "catppuccin-tui-mocha": "Mocha",
};

type Feature = "indicator" | "status" | "footer";
type Toggle = "on" | "off";
type StatusPhase = "ready" | "working";

const state: Record<Feature, boolean> = {
  indicator: false,
  status: false,
  footer: false,
};

let indicatorInstalled = false;
let footerInstalled = false;

function fg(hex: string, text: string): string {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
}

function formatCount(value: number): string {
  if (value < 1000) return `${value}`;
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}k`;
  return `${(value / 1_000_000).toFixed(1)}m`;
}

function getUsage(ctx: ExtensionContext): { input: number; output: number; cost: number } {
  let input = 0;
  let output = 0;
  let cost = 0;

  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "message") continue;
    const message = entry.message as { role?: string; usage?: { input?: number; output?: number; cost?: { total?: number } } };
    if (message.role !== "assistant" || !message.usage) continue;

    input += message.usage.input ?? 0;
    output += message.usage.output ?? 0;
    cost += message.usage.cost?.total ?? 0;
  }

  return { input, output, cost };
}

function getThemeLabel(ctx: ExtensionContext): string {
  const name = ctx.ui.theme.name;
  if (!name) return "custom theme";
  return themeLabels[name] ?? name;
}

function applyIndicator(ctx: ExtensionContext): void {
  if (!ctx.hasUI) return;

  if (!state.indicator) {
    if (indicatorInstalled) {
      ctx.ui.setWorkingIndicator();
      indicatorInstalled = false;
    }
    return;
  }

  ctx.ui.setWorkingIndicator({
    frames: [
      fg(macchiato.overlay1, "·"),
      fg(macchiato.overlay0, "•"),
      fg(macchiato.blue, "●"),
      fg(macchiato.mauve, "●"),
      fg(macchiato.lavender, "•"),
      fg(macchiato.overlay0, "·"),
    ],
    intervalMs: 120,
  });
  indicatorInstalled = true;
}

function applyStatus(ctx: ExtensionContext, phase: StatusPhase = "ready"): void {
  if (!ctx.hasUI) return;

  if (!state.status) {
    ctx.ui.setStatus(STATUS_ID, undefined);
    return;
  }

  const icon = phase === "working" ? fg(macchiato.overlay1, "⋯") : fg(macchiato.green, "✓");
  const label = phase === "working" ? "working" : "ready";
  ctx.ui.setStatus(STATUS_ID, `${icon} ${fg(macchiato.subtext0, `${getThemeLabel(ctx)} · ${label}`)}`);
}

function applyFooter(ctx: ExtensionContext): void {
  if (!ctx.hasUI) return;

  if (!state.footer) {
    if (footerInstalled) {
      ctx.ui.setFooter(undefined);
      footerInstalled = false;
    }
    return;
  }

  ctx.ui.setFooter((tui, theme, footerData) => {
    const unsubscribe = footerData.onBranchChange(() => tui.requestRender());

    return {
      dispose: unsubscribe,
      invalidate() {},
      render(width: number): string[] {
        if (width <= 0) return [""];

        const usage = getUsage(ctx);
        const branch = footerData.getGitBranch();
        const themeName = theme.name ? themeLabels[theme.name] ?? theme.name : "custom theme";
        const model = ctx.model?.id ?? "no model";
        const branchText = branch ? `git:${branch}` : "no git";

        const left = `${theme.fg("accent", "◌")} ${theme.fg("subtext1", themeName)}`;
        const right = theme.fg(
          "overlay1",
          `${model} · ${branchText} · ↑${formatCount(usage.input)} ↓${formatCount(usage.output)}`,
        ) + theme.fg("overlay0", ` $${usage.cost.toFixed(3)}`);
        const padWidth = Math.max(1, width - visibleWidth(left) - visibleWidth(right));
        const line = `${left}${" ".repeat(padWidth)}${right}`;

        return [truncateToWidth(line, width, "")];
      },
    };
  });
  footerInstalled = true;
}

function setFeature(ctx: ExtensionContext, feature: Feature, toggle: Toggle): void {
  state[feature] = toggle === "on";

  if (feature === "indicator") applyIndicator(ctx);
  if (feature === "status") applyStatus(ctx);
  if (feature === "footer") applyFooter(ctx);
}

function statusLine(): string {
  return `indicator=${state.indicator ? "on" : "off"}, status=${state.status ? "on" : "off"}, footer=${state.footer ? "on" : "off"}`;
}

function reset(ctx: ExtensionContext): void {
  state.indicator = false;
  state.status = false;
  state.footer = false;
  applyIndicator(ctx);
  applyStatus(ctx);
  applyFooter(ctx);
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("catppuccin-tui", {
    description: "Toggle optional Catppuccin TUI polish: indicator, status, and compact footer.",
    handler: async (args, ctx) => {
      if (!ctx.hasUI) return;

      const parts = args.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const [feature, toggle] = parts;

      if (!feature) {
        ctx.ui.notify(
          `Catppuccin TUI: ${statusLine()}. Usage: /catppuccin-tui [indicator|status|footer|all] [on|off], or /catppuccin-tui reset`,
          "info",
        );
        return;
      }

      if (feature === "reset") {
        reset(ctx);
        ctx.ui.notify("Catppuccin TUI enhancements reset", "info");
        return;
      }

      if (toggle !== "on" && toggle !== "off") {
        ctx.ui.notify("Usage: /catppuccin-tui [indicator|status|footer|all] [on|off]", "error");
        return;
      }

      if (feature === "all") {
        setFeature(ctx, "indicator", toggle);
        setFeature(ctx, "status", toggle);
        setFeature(ctx, "footer", toggle);
        ctx.ui.notify(`Catppuccin TUI enhancements ${toggle}`, "info");
        return;
      }

      if (feature !== "indicator" && feature !== "status" && feature !== "footer") {
        ctx.ui.notify("Unknown Catppuccin TUI feature. Use indicator, status, footer, all, or reset.", "error");
        return;
      }

      setFeature(ctx, feature, toggle);
      ctx.ui.notify(`Catppuccin TUI ${feature} ${toggle}`, "info");
    },
  });

  pi.on("turn_start", async (_event, ctx) => {
    applyStatus(ctx, "working");
  });

  pi.on("turn_end", async (_event, ctx) => {
    applyStatus(ctx, "ready");
  });

  pi.on("model_select", async (_event, ctx) => {
    applyStatus(ctx);
  });

  pi.on("thinking_level_select", async (_event, ctx) => {
    applyStatus(ctx);
  });
}
