import { Effect } from "effect"
import { effectCmd } from "../effect-cmd"
import { UI } from "../ui"
import { Config } from "@/config/config"

export const SkillStateCommand = effectCmd({
  command: "skill-state [state]",
  describe:
    "Enable, disable, or show the SKILL.state bounded execution state mode for long-horizon tool loops (arXiv:2608.26263)",
  builder: (yargs) =>
    yargs
      .positional("state", {
        describe: "'on' to enable, 'off' to disable. Omit to print the current status.",
        type: "string",
        choices: ["on", "off"] as const,
      })
      .option("global", {
        describe: "Write to the global config instead of the current project's config",
        type: "boolean",
        default: false,
      }),
  handler: Effect.fn("Cli.skillState")(function* (args) {
    const config = yield* Config.Service

    if (!args.state) {
      const cfg = yield* config.get()
      const enabled = cfg.experimental?.skill_state === true
      UI.println(
        enabled
          ? UI.Style.TEXT_SUCCESS_BOLD + "skill_state: on" + UI.Style.TEXT_NORMAL
          : UI.Style.TEXT_DIM + "skill_state: off" + UI.Style.TEXT_NORMAL,
      )
      UI.println(
        UI.Style.TEXT_DIM +
          "Run `opencode skill-state on` or `opencode skill-state off` to change it." +
          UI.Style.TEXT_NORMAL,
      )
      return
    }

    const enabled = args.state === "on"
    if (args.global) {
      yield* config.updateGlobal({ experimental: { skill_state: enabled } })
    } else {
      yield* config.update({ experimental: { skill_state: enabled } })
    }
    UI.println(
      UI.Style.TEXT_SUCCESS_BOLD +
        `skill_state ${enabled ? "enabled" : "disabled"}` +
        UI.Style.TEXT_NORMAL +
        ` (${args.global ? "global" : "project"} config)`,
    )
  }),
})
