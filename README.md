# anti-ai-flavor

<!-- languages:start -->
**English** · [简体中文](README.zh-CN.md)
<!-- languages:end -->

A [Covel](https://github.com/ackness/covel) community plugin that strips the LLM "AI accent" from narrative prose. It injects per-locale style rules into the story runtime's system prompt — a zh table (expository phrasing, AI clichés, liveliness) and an en table (formulaic structures, AI-frequent clichés) — selected by session locale. Prevention-only: generated output is never inspected or rewritten.

## Installation

- **GitHub install (Covel ≥ 0.0.40):** Settings → Plugins → Install & manage, paste `https://github.com/charlesli1989/anti-ai-flavor`, review the risk prompt, confirm, then restart the backend.
- **ZIP import:** download `anti-ai-flavor.zip` from [Releases](https://github.com/charlesli1989/anti-ai-flavor/releases) and drag it into the same settings pane.
- **Manual:** copy this directory to `~/.covel/plugins/anti-ai-flavor` and restart the backend.

After restarting, enable the plugin in your session and approve its server-side code when prompted.

**Supported Covel versions:** ≥ 0.0.46.

## Configuration

Every rule has its own toggle under Settings → Plugins → anti-ai-flavor (15 in total). Disabled rules are dropped from the injected block and the survivors are renumbered. Rules that exist in only one language's table are inert for sessions in the other language; their descriptions note the scope.

## Data, network, and cost behavior

- **Data:** reads nothing and writes nothing. No plugin-data, no store access.
- **Network:** makes no network requests.
- **Model cost:** makes no LLM calls of its own; it only appends a short rules block (~1 KB) to the story runtime's existing system prompt once per turn.

## Runtime layout

- `PLUGIN.md` — manifest and the 15 `userSettings` toggle declarations.
- `server/index.js` — entry registering the `PostContextAssembly` hook.
- `hooks/inject-style-rules.js` — hook implementation; routes on `payload.locale` (zh/en) and only rewrites runtimes with `outputKind === "story"`.
- `hooks/_style-rules.js` — the zh/en rule tables and block assembly; plain frozen text, no runtime state.

## Known limitations

- Only zh and en sessions receive rules; other locales are left unchanged.
- Prompt-side prevention cannot guarantee the model always complies.

## Development

Requires Node 26+ and pnpm. Run the tests with:

```sh
pnpm install
pnpm test
```

## Contact

Issues and feedback: [GitHub Issues](https://github.com/charlesli1989/anti-ai-flavor/issues).

## License

[MIT](LICENSE)
