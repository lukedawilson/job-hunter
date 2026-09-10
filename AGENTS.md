# AGENTS

Job Hunter is an OpenCode-powered job hunting toolkit. Commands run from `.opencode/command/*.md`, backed by a user profile and application pipeline stored in a configurable data directory (default `./data`). The data path is stored in `.jobhunterrc`.

## ADRs

Architecture decisions live in `docs/architecture/decisions/`. Read them before making structural changes. Format follows Michael Nygard's template:

- `# N. <decision>`
- `## Status` (Accepted / Superseded by NNNN)
- `## Context`: problem, alternatives, constraints
- `## Decision`: what we chose and the decisive factor
- `## Consequences`: trade-offs, follow-ups, risks
- `## References`: PRs, files, external docs

Before adding a dependency, changing the data model, or altering the scraping approach, write an ADR.

## Project conventions

- **Commands:** markdown files in `.opencode/command/` with YAML frontmatter (`description:`). Use `$ARGUMENTS` for user input.
- **Data path:** stored in `.jobhunterrc` (JSON: `{"dataPath": "./data"}`). Always read before accessing data files. Default to `./data` if the file is missing.
- **Data files:** `<dataPath>/jobs.json` — JSON array of tracked job entries. `<dataPath>/profile.md` — the user's profile in markdown.
- **Applications:** per-job outputs go in `<dataPath>/applications/<job-id>/` (cover-letter.md, cv.md).
- **Config:** `.jobhunterrc` and the data directory are gitignored. Each user maintains their own.
- **Dependencies:** root `package.json` for tool dependencies (Playwright, etc.). `.opencode/package.json` is for the OpenCode plugin runtime only (gitignored).
- **Skills:** the `unslop` skill is vendored at `.agents/skills/unslop/` and restored from `skills-lock.json` (source `theclaymethod/unslop`). The mandatory unslop pass depends on it. Check it exists before doing any work that generates text. If `.agents/skills/unslop/SKILL.md` is missing, run `./scripts/install-unslop.sh` before continuing.
- **Scraping:** use Playwright + stealth. See ADR 0001. Rate limit, isolate contexts per source.
- **Job object schema:** each entry in `jobs.json` follows this shape:
  - `title`: job title
  - `company`: company name
  - `location`: location string
  - `url`: primary URL. For paywalled sources this is the resolved direct ATS/company link (or `null` if unverifiable). For non-paywalled sources this is the listing URL.
  - `listing_url`: the board listing URL (present on paywalled sources; useful for reference)
  - `source`: which scraper produced the listing (e.g. `"weworkremotely"`, `"indeed"`)
  - `unverifiable`: `true` if the listing came from a paywalled source and the direct company link could not be resolved
- **No comments:** don't add comments to code files unless asked.
- **Commit only when asked.**

## Writing / tone

No conversational filler or "Claude-speak". Open with the substance: never announce that you're about to make a point or that you found something. Applies everywhere, especially text drafted for the user to send to others (cover letters, application answers, emails), since it reads as the user's own voice.

### Unslop pass (mandatory on all generated text)

Before generating any text the user might read or send (cover letters, application answers, emails, chat replies, commit messages), read `.agents/skills/unslop/SKILL.md` and its `references/core-contract.md` (the single behavior contract), and apply them on top of the rules above. Treat both rule lists as one set. When they conflict, the stricter reading wins.

### No em dashes

Never use an em dash (—) anywhere: chat replies, cover letters, application answers, data files, commit messages. Use a comma, colon, full stop, or parentheses instead.

### No over-claiming

Every claim in generated text (cover letters, application answers, emails) must be directly supported by `<dataPath>/profile.md`. Never invent employers, durations, scales, or skills. Never inflate extent: if the profile does not show a majority, do not write "most of my career"; if it says "proficient", do not write "expert" or "deep". When extent or duration is not stated, name only where the skill was used (e.g. "my main toolkit across client work since 2017", with the roles to back it), not how much of a career it represents.

### Claude bullshit to avoid

| Phrase / pattern | Instead | Why |
| --- | --- | --- |
| **Any praise of the reader's idea, action, question, or judgement**: "Good catch", "great question", "you're absolutely right", "Good call", "nice work", "great job", "well spotted", "good point", "smart", "makes sense" as an opener | Nothing: just state the fact or answer | Performative praise/agreement, not content. This is a CLASS, not a fixed list: the enumerated phrases are examples; if a clause's job is to approve of the reader rather than convey information, cut it, even a phrasing not listed here. Worst in text drafted for the user to send to others, where it reads as the user patronising a peer. State the substance instead ("the transcode worker needed the same fix and it's there"), never a verdict on the reader ("Good call fixing the transcode worker") |
| "Happy to help" | Nothing | Filler |
| "Thanks for this" / "thanks for the write-up" / "thanks for flagging" as an opener | Nothing: open with substance | The user is a peer to the recipient (e.g. engineers on the same squad), not their boss; thanking someone for doing their job reads as patronizing from a peer |
| "Yep" / "Yeah" | "Yes" | Breezy contraction standing in for a plain word |
| "minted" / "mint a …" (of a URL, token, credential) | "generated" / "created" | LLM-ism; use the plain word |
| "Your call" | "Your decision" / "up to you" | Same |
| "X's call" (e.g. "Manuel's call") | "X's decision" | Same |
| "Found it" / "Found it:" as an opener | State the finding directly | Announces you found something instead of just saying it |
| "Bottom line" as a heading or lead-in | State the point directly | Announces you're about to make a point instead of making it |
| Any breezy contraction standing in for a plain word | The plain word | General case of the "Yep"/"Yeah" rule |
| "Leaving the X to Y" / "I'll leave the Y call to X" | State who decides, plainly (e.g. "Y decides X" / "X is Y's decision") | Stilted, announces the act of deferring instead of just deferring |
| "anchor" / "anchoring id" / "anchor the search on X" | "correlating id" / "search on X" / "start from X" | LLM-ism; use the plain word |
| "fails closed" / "fails open" (of error handling) | Describe the actual behaviour plainly (e.g. "swallows the error and returns Encode anyway", "defaults to deny on error") | Jargon that's routinely used backwards: fail-closed properly means default-to-deny; using it for a permissive default is inverted and misleads. The plain description can't be got backwards |
| **Any invented three-letter abbreviation**: "OCC", "MSU", "CRU", "TLA", "CMS id" | Spell it out every time: "optimistic concurrency control", "combined media stream id" | The single worst habit. Coined mid-conversation, never defined, then reused as if shared vocabulary; the reader has to stop and ask "wtf is OCC?". Costs them more than writing the words costs me. Only long-established industry abbreviations are fine (HTTP, JSON, SQL, DAO, TDD) |
| Compressing a term to initials *after* using it once in full | Keep writing it in full | Defining on first use does not license the abbreviation afterwards. If the full term is too long to repeat, it's too obscure to abbreviate |
| Abbreviations in commit messages, branch names, task/slice ids, code identifiers | Full words | These outlive the conversation that coined them and end up permanent in git history where no one has the context |
| "ghost delete", "orphaned emit", "emit-before-write", "the happy path", "blast radius" and similar coined shorthand | Describe the mechanism: "emits a delete for the id it then keeps", "the delete is sent but the write never lands" | Compressing a mechanism into a punchy label feels like insight but hides whether I actually understand it. The description is checkable; the label isn't |
| "load-bearing" (of a decision, claim, assumption, rule) | Say what depends on it and what breaks without it: "the reorder depends on this", "remove it and the cleanup deletes the wrong id" | Borrowed-from-architecture metaphor that sounds weighty while saying nothing checkable. Name the dependency instead |
| "gate" / "gated" / "the gate" (of a check, guard, condition) | Name the actual check and what it does: "the check rejects the submit", "curation is blocked while any sibling recording is live" | Metaphor dressing up a plain conditional; reads technical, hides the concrete predicate. State what is checked and what happens when it fails |
| **"X is real" / "the gap is real" / "the concern is real" / "confirmed real"** as a verdict on a finding | State what the evidence shows: "prod resolved the finished recording to the live manifest and ffprobe 504'd on it" | Verification theatre: announces a conclusion instead of showing the evidence that is the conclusion. The reader can't check "real"; they can check the log line. If the evidence is stated, "is real" adds nothing; if it isn't, "is real" is an unbacked assertion |
| Reaching for jargon to sound authoritative: "idempotent", "invariant", "monotonic", "convergent", where a plain sentence works | The plain sentence: "safe to run twice", "must always be true", "only ever moves one way" | Jargon is fine when it's the precise term the reader already uses; it's bullshit when it's dressing up a claim. If I'd struggle to define it on the spot, I shouldn't be using it |
| Puffery: "pivotal", "testament to", "evolving landscape", "sets the stage for", "deeply rooted" | Cut it, state what happened | Decoration, not information; none of it survives "what does this tell the reader to do or know?" |
| Superficial `-ing` tails: "…, highlighting X", "…, ensuring Y", "…, showcasing Z" hung off a clause | End the sentence, or state X as its own fact with the source | The trailing clause asserts significance without evidence and usually just restates the main clause |
| "Not just X, but Y" | State Y directly | Manufactured contrast; the "not just X" half carries no information |
| Contrast tail that only asserts significance: "...dependable now, not aspirational" | Cut the "not X" half. Let the fact and its consequence stand: "Given the volume doubles every quarter, the software has to be dependable now." | The negative half carries no checkable information. General case of "Not just X, but Y" |
| Dangling demonstrative pronoun referring forward: "I build that." with "that" defined only by the next sentence | Fuse the sentences and name the noun: "I build the development process and the systems that hold up under real load." | Makes the reader hold an unresolved reference until the next sentence; the noun is the information, write it |
| Forcing three: padding a point into a group of three parallel items for rhythm | Use the real number: one, two, or five | Rhythm-driven, not content-driven; the third item is usually invented to fill the pattern |
| Synonym cycling: "the stream… the combined media stream… the angle… it" for one thing in a paragraph | Pick one term and repeat it | Reads like variety but forces the reader to check whether these are the same thing |
| False range: "from timeouts to schema drift" where the endpoints aren't on one scale | List the items plainly | "From X to Y" implies a spectrum that isn't there |
| Filler stems: "in order to", "due to the fact that", "it is important to note that" | "to", "because", delete | Carry no meaning; cut on sight |
| Passive where the actor matters: "queries are validated", "the file is parsed" | Name the actor: "the compiler validates queries", "the loader parses the file" | In pipeline/debugging write-ups the actor IS the point; hiding it drops the fact worth stating. Passive is fine only when the actor is unknown or genuinely doesn't matter |
| Adverb propping up a weak verb: "runs quickly", "significantly improves" | Stronger verb or the number: "is fast", "cuts p99 from 4s to 900ms" | The adverb means the verb is wrong or the measurement is missing |
| Abstract-metaphor nouns: "substrate", "wedge", "vector", "surface" (as in "API surface"), "flywheel", "north star", "scaffolding"/"harness"/"ratchet" as metaphor | The concrete word: "base", "add", "way/method", the mechanism's real name | General case of the "load-bearing"/"anchor" rows: reads technical, means less than a plain word. If I can't define it concretely here, it's dressing |
| Fancy synonyms for plain verbs: "utilize", "leverage", "facilitate", "numerous" | "use", "use", "help", "many" | The fancier word is never clearer |
| "That's the right shape" / "right shape" as a verdict on someone's summary or understanding | State what is correct and what needs adjusting | Approval-flavoured filler; the correction is the content, not the meta-verdict on their model |
| **Cliches**: "home turf", "in my wheelhouse", "sweet spot", "perfect fit", "at the end of the day", "hit the ground running", "the core of what I do", "bread and butter", "wearing many hats" | The plain statement of the specific fact: "I have twenty-plus years across TypeScript, Node, React, and PostgreSQL" | A cliche is a stock phrase standing in for a specific fact; the specific fact is the content. This is a CLASS: any stock idiom doing the work of a concrete claim gets replaced by the claim itself |
