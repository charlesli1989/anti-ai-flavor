import { buildStyleRulesText } from "./_style-rules.js";

/** zh-CN and its registered aliases; see styleLanguage below. */
const ZH_STYLE_LOCALES = new Set(["zh-cn", "zh", "zh-hans"]);

/**
 * Map a session locale to a style-rule table. zh-CN and its registered
 * aliases ("zh", "zh-Hans", mirrored from the framework locale registry's
 * `isDefaultLocale`) get the zh table; any `en*` locale gets the en table;
 * everything else gets nothing. Inlined on purpose: community plugins are
 * imported from the user plugins dir (`~/.covel/plugins/<id>`), where bare
 * `@covel/*` specifiers do NOT resolve — shipped server code must be
 * self-contained.
 *
 * @param {string | undefined} locale
 * @returns {"zh" | "en" | null}
 */
function styleLanguage(locale) {
  if (typeof locale !== "string") return null;
  const normalized = locale.trim().toLowerCase().replace(/_/g, "-");
  if (ZH_STYLE_LOCALES.has(normalized)) return "zh";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return null;
}

/**
 * PostContextAssembly — inject the anti-AI-flavor style rules into EVERY
 * runtime's assembled context (after buildContext, before the agent loop).
 * Coverage is deliberate: world-init and other auxiliary runtimes also write
 * prose that flows back into the story, so constraining only the story
 * runtime leaves those upstream sources free to reintroduce the AI accent.
 * The hook never branches on a plugin id (framework/plugin isolation rule).
 *
 * Placement: the rules go out as a trailing system message appended to
 * `messages`, NOT merged into the system prompt. Turn-volatile segments
 * (memory blocks, runtime inputs) and the current player input all sit after
 * the system prompt; a tail message lands behind them, making the rules the
 * last instruction the model reads before generating — and it leaves the
 * system prompt untouched for prefix caching.
 *
 * zh and en sessions only: the zh table targets Chinese prose conventions and
 * the en table targets English AI-slop patterns, so injection is gated on
 * `styleLanguage(payload.locale)` instead of polluting prompts of sessions
 * writing in other languages.
 *
 * Pure rewrite: this hook only appends one message to the assembled context
 * it is handed. It never reads or writes the store, never emits proposals,
 * and never calls the LLM. Prevention-only by design — generated output is
 * never inspected.
 *
 * `ctx.getOwnSettings()` is injected by the runtime hook pipeline and returns
 * this plugin's resolved per-session settings; it is absent outside an active
 * hook scope, where the optional call degrades to the manifest defaults
 * (every rule ON).
 *
 * @param {{ sessionId: string, getOwnSettings?: () => Record<string, unknown> }} ctx
 * @param {{ locale?: string, messages?: { role: string, content: unknown }[] }} payload
 * @returns {Promise<{ action: "continue", replace?: { messages: { role: string, content: string }[] } }>}
 */
export default async function injectStyleRules(ctx, payload) {
  const lang = styleLanguage(payload?.locale);
  if (!lang) return { action: "continue" };
  const rulesText = buildStyleRulesText(ctx?.getOwnSettings?.(), lang);
  if (!rulesText) return { action: "continue" };
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  return {
    action: "continue",
    replace: {
      messages: [...messages, { role: "system", content: rulesText }],
    },
  };
}
