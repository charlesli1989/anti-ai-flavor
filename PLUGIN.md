---
id: anti-ai-flavor
kind: plugin
version: 0.2.0
covel: ">=0.0.46"
displayName: Anti-AI-Flavor
description: >-
  Injects three groups of prose-style constraints into story prompts (avoid
  expository phrasing, avoid AI-frequent clichés, add human liveliness) to
  strip the "AI accent". Prevention-only — never inspects generated output.
tags:
  - cost:function
entry: ./server/index.js
contributes:
  hooks:
    - event: PostContextAssembly
  settings:
    - key: banNegation
      type: toggle
      default: true
      label: Ban negative descriptions
      description: >-
        Narration states what is and what happens, never what is not.
        Dialogue, idioms, and interior monologue are exempt; a fruitless
        search may be stated negatively, but a paragraph may not consist of
        negation alone. Chinese sessions only.
    - key: banCorrectiveNegation
      type: toggle
      default: true
      label: Ban "not…but…" corrections
      description: >-
        No "not X but Y" negate-then-correct constructions, including variants
        split across sentences or paragraphs; state what is, directly.
    - key: banEmDash
      type: toggle
      default: true
      label: Ban em-dashes
      description: >-
        No em-dashes except for drawn-out sounds; use commas for explanation
        or transition instead.
    - key: banExplanatoryColon
      type: toggle
      default: true
      label: Ban explanatory colons
      description: >-
        No colons used for explanation; colons introducing quoted speech are
        exempt. Use a comma to link an explanation instead. Chinese sessions
        only.
    - key: banFingerCliche
      type: toggle
      default: true
      label: Ban finger clichés
      description: >-
        No "knuckles turning white" or similar finger descriptions; use other
        body details for tension or strain. Chinese sessions only.
    - key: banDegreeAdverbs
      type: toggle
      default: true
      label: Reduce degree adverbs
      description: >-
        Reduce hedging degree adverbs ("a trace of", "faintly",
        "imperceptibly", "extremely") and never stack them in quick
        succession; state the concrete degree, form, or action instead.
    - key: banAccountingMetaphor
      type: toggle
      default: true
      label: Ban ledger metaphors
      description: >-
        No ledger/bookkeeping vocabulary ("settling the score") as an abstract
        metaphor for feelings, grudges, or causality; actual bookkeeping acts
        and physical ledgers are exempt. Chinese sessions only.
    - key: banFlatVoice
      type: toggle
      default: true
      label: Ban flat voice descriptions
      description: >-
        No emotionless voice descriptions such as a "flat" or "quiet" voice;
        describe texture, emotion, or rhythm instead. Chinese sessions only.
    - key: banVerbatimEcho
      type: toggle
      default: true
      label: Ban verbatim echoes
      description: >-
        Characters rephrase rather than quote previous text verbatim; same
        meaning, different wording. Chinese sessions only.
    - key: colloquialDialogue
      type: toggle
      default: true
      label: Colloquial dialogue
      description: >-
        Characters speak colloquially, never in written-register language;
        filler words and personal verbal tics are encouraged. Chinese
        sessions only.
    - key: banThroatClearing
      type: toggle
      default: true
      label: Ban throat-clearing openers
      description: >-
        No throat-clearing openers or emphasis crutches ("Here's the thing:",
        "It turns out", "Let that sink in.", "Make no mistake"); state the
        point directly. English sessions only.
    - key: banTriadicLists
      type: toggle
      default: true
      label: Ban triadic lists
      description: >-
        No three-item lists or staccato fragments stacked for drama ("Speed.
        Quality. Cost."); vary rhythm — two items beat three. English
        sessions only.
    - key: banVagueDeclaratives
      type: toggle
      default: true
      label: Ban vague declaratives
      description: >-
        No vague declaratives that announce importance without naming the
        thing ("The stakes are high", "The reasons are structural"); name the
        specific stake or reason. English sessions only.
    - key: banFalseAgency
      type: toggle
      default: true
      label: Ban false agency
      description: >-
        No false agency — inanimate things do not perform human actions ("the
        decision emerges", "the data tells us"); name the person who acts.
        English sessions only.
    - key: banBusinessJargon
      type: toggle
      default: true
      label: Ban business jargon
      description: >-
        No business jargon ("navigate", "unpack", "lean into", "landscape",
        "game-changer", "double down", "deep dive"); use plain language.
        English sessions only.
---

# Anti-AI-Flavor

A cross-cutting, **opt-in** plugin that steers the main narrative voice away
from the LLM's "AI accent" — expository phrasing (说明文腔), clichés emitted at
abnormally high rates, and lifeless flat descriptions — through a single
lifecycle hook. It carries no schedulable runtime — its behaviour lives
entirely in the `PostContextAssembly` hook registered by its server entry
(`server/index.js`).

## How it works

| Hook                  | Role                                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PostContextAssembly` | Once a runtime's context is assembled (after `buildContext`, before the agent loop), appends the enabled style rules to the **story** runtime's system prompt only. Story is identified by `payload.outputKind === "story"`, never by a hardcoded plugin id (isolation rule). |

The injected text (`hooks/_style-rules.js`) ships **two rule tables** picked
by `payload.locale`: zh sessions (the default zh locale and its aliases
`zh-CN` / `zh` / `zh-Hans`, mirroring the framework locale registry's
`isDefaultLocale`) get the Chinese table (破折号 / 解释性冒号 / 指节泛白);
any `en*` session gets the English table (throat-clearing / vague
declaratives / false agency). Sessions in other languages are left
byte-for-byte unchanged. Setting keys are per-rule and shared where a concept
exists in both languages (`banCorrectiveNegation` / `banEmDash` /
`banDegreeAdverbs`); a key absent from the active table is skipped silently.

**Self-contained by design.** The shipped code imports nothing outside its own
directory — community plugins load from the user plugins dir where bare
`@covel/*` specifiers do not resolve, so the zh-locale check is inlined rather
than imported from `@covel/shared`.

**Prevention-only by design.** The plugin never inspects, scores, or rewrites
generated output — the constraints live entirely in the prompt, ahead of the
text they shape. Each rule carries its own toggle; a disabled rule is omitted
from the injected block, the remaining rules are renumbered continuously, and
a category whose rules are all disabled disappears with its header.

## The three rule groups

### 1. 避免说明文写法 (expository phrasing)

| Setting (`contributes.settings`) | Rule (default ON)                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `banNegation`                    | Narration states what is / what happens, never what is not. Exemptions: dialogue, idioms, interior monologue, and "seeking without finding" beats (which still may not form a negation-only paragraph). |
| `banCorrectiveNegation`          | No "不是……（而）是……" negate-then-correct constructions, including variants split across sentences or paragraphs — state what is, never set it up with a denial. Applies everywhere, dialogue included. |
| `banEmDash`                      | No em-dashes except drawn-out sounds; commas take over explanation / transition duty.                                                                                                                   |
| `banExplanatoryColon`            | No explanatory colons; colons introducing quoted speech stay legal.                                                                                                                                     |

### 2. 避免 AI 高频陈词 (AI-frequent clichés)

| Setting (`contributes.settings`) | Rule (default ON)                                                                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `banFingerCliche`                | No "指节泛白"-style finger clichés; tension and strain move to other body details.                                                                                      |
| `banDegreeAdverbs`               | Cut hedging degree adverbs ("一丝 / 一抹 / 微微 / 淡淡 / 难以察觉的 / 极其"), never stacked back-to-back; write the concrete degree, form, or action instead.          |
| `banAccountingMetaphor`          | No "记账 / 算账 / 账目 / 这笔账" ledger vocabulary as abstract metaphors for feelings, grudges, or causality — actual bookkeeping acts and physical ledgers are exempt. |

### 3. 增强活人感 (human liveliness)

| Setting (`contributes.settings`) | Rule (default ON)                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `banFlatVoice`                   | No emotionless voice descriptions ("声音很平" / "声音不大"); write the voice's texture, emotion, or rhythm instead.                        |
| `banVerbatimEcho`                | Characters never quote previous narration or dialogue verbatim when recapping; the same meaning gets rephrased in the speaker's own voice. |
| `colloquialDialogue`             | Characters speak colloquially, never in written-register language; filler words (语气词) and personal verbal tics (口癖) are encouraged.    |

### English table (en sessions)

The English table reuses `banCorrectiveNegation`, `banEmDash`, and
`banDegreeAdverbs` with English rule text, and adds five en-only rules:

| Setting (`contributes.settings`) | Rule (default ON)                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `banThroatClearing`              | No throat-clearing openers or emphasis crutches ("Here's the thing:", "It turns out", "Let that sink in.", "Make no mistake"). |
| `banTriadicLists`                | No three-item lists or staccato fragments stacked for drama ("Speed. Quality. Cost."); vary rhythm, two items beat three.      |
| `banVagueDeclaratives`           | No vague declaratives announcing importance without naming the thing ("The stakes are high"); name the specific stake.         |
| `banFalseAgency`                 | No inanimate things performing human actions ("the decision emerges", "the data tells us"); name the person who acts.          |
| `banBusinessJargon`              | No business jargon ("navigate", "unpack", "lean into", "landscape", "game-changer", "double down", "deep dive").               |

## Scope & isolation

This hook is a pure **rewrite**: it only appends to the assembled system
prompt it is handed. It never touches the store, never emits proposals, and
never calls the LLM. Enabling anti-ai-flavor for a session scopes the hook to
that session only (framework hook scoping). It is disabled by default — add
`anti-ai-flavor` to a world's plugin set or enable it per session to activate.
