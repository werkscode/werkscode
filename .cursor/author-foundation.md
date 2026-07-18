# Author foundation (public-safe)

Agent-facing biography and themes distilled from private notes under `author/raw/` (gitignored). Safe to commit. Prefer this file over raw Ergüsse when writing site copy.

Raw notes may overlap, contradict, or get rewritten. Prefer the latest version of this distillate. Never copy internal hostnames, domain-controller names, employee/customer names, or company identity into `content/` or other tracked files.

## Chronology (scrubbed)

- **Role**: Managing director of a small metal manufacturing company in Germany; fourth-generation successor; still finding his footing in the role.
- **March 2020**: End of first year as GF when COVID closures began. Sudden problems no one prepared him for — keeping the shop running amid conflicting attitudes toward infection risk.
- **Response**: Digital tools as the lever — internal knowledge wiki; visitor registration for contact tracing after an infection.
- **Early stack path**: Open-source TikiWiki on a Windows Server VM (no Linux/CLI background yet) → expose via IIS by IP → friendly local URL via hosts/DNS → VS Code → Vue.js (2020; React/Vue/Angular peak; pre-Copilot / pre-Claude Code). Learned by following tutorials and reimplementing what he saw.
- **Main internal product (private — never name in public copy)**: From that Vue start grew a large shopfloor/ops platform (Nuxt 2 + Laravel era), used daily in the metal shop. Git formalized ~2021 after months of pre-git product work. Grew for years by shipping domain features (sales tower, production booking, inventory, quality, HR self-service, messaging, workflows, …) while core frameworks stayed frozen. Later added realtime messaging and a Python optimization service. From ~2025/26: greenfield successor (Nuxt 4 / modern Laravel, TypeScript, tests, SSO coexistence) — deliberate redesign, not a 1:1 port; platform/auth first, business modules chunked over.

### Skill progression (inferred — for voice, not as a CV)

- **2020–21**: Learner-builder — get it running; Docker/WSL/git learned under pressure; German shopfloor problems drive the backlog.
- **2021–23**: Domain engineer — business value over elegance; messy commits evolve toward conventional commits and clearer structure.
- **2024–25**: Systems thinker — composables, service boundaries, consolidate experiments; skill often ahead of migration bandwidth.
- **2025–26**: Platform / succession — greenfield rewrite with coexistence, security-minded auth, testing, migration doctrine; WERKSCODE as the public learning story beside the private factory tools.

## Themes (use in voice, not as slogans)

- **Open source as unlock**: The important early insight was not which framework to pick — it was that countless people share knowledge and tools for free (blogs, YouTube, full learning platforms).
- **Tech choice secondary at the start**: Getting something running mattered more than betting on the “right” stack.
- **Fear vs curiosity**: Overwhelm and anxiety that hyped tech fades (e.g. jQuery already past its peak) and learning time would be wasted — curiosity and excitement won.
- **Self-hosting joy**: Making something work yourself without paying a vendor or consultant for a one-off install felt powerful.
- **Try without SaaS lock-in**: Vendors want predictable monthly revenue; sometimes you need to experiment before knowing you’ll keep a tool. Own basic skills open more options.
- **From zero infra**: Started with no server/network knowledge; successive small wins (localhost → LAN IP → named URL) built confidence.
- **Ship then modernize**: Years of real production value on an aging stack; modernization planned and started as a parallel successor, not a big-bang rewrite of everything at once.
- **Learn in the product tree**: Experiments and sandboxes lived next to production features — curiosity without waiting for a perfect architecture.
- **Discipline follows pressure, not ideal — and he doesn't hide it**: Process hygiene rises when there is room for it and drops when the shop needs features shipped; honesty about the mess is part of the voice.

## Author profile (developer / MD / human)

Anonymized traits for voice and understanding. Do not turn into a CV or proof-with-numbers in public copy.

### As a developer

- Learns by shipping real tools for a real business, not by finishing courses.
- Early to try new tech (Composition API, TypeScript, AI assistants); pragmatic and late to adopt it everywhere in production.
- The real growth was the jump from stacking features on a frozen stack to system- and migration-thinking (platform first, redesign not 1:1 port, coexistence).
- AI (Copilot, then Cursor) is an accelerator — never a replacement for understanding what broke.

### As a managing director

- Codes in stolen hours: evenings and weekends around running the shop.
- Backlog driven by real shopfloor and office problems, not by trendy tutorials.
- Ships value over elegance; can articulate a modernization plan even when bandwidth to execute a big-bang rewrite lags.
- Treats private factory tools and the public learning story (WERKSCODE) as separate worlds on purpose.

### As a human

- Honest about the mess — never pretends every commit or experiment was clean.
- Curiosity consistently beats fear of picking the “wrong” or outdated tech.
- Frustration is visible and relatable (the “why do I have to commit so much?” kind of self-awareness).
- Self-aware enough to question his own process and still keep going.

## Source material

- Private: `author/raw/` (local only; see `author/README.public.md`) — includes `2020-start.md`, `internal-app-journey.md`
- Tone samples: [`.cursor/skills/write-journey-post/voice-guide.md`](skills/write-journey-post/voice-guide.md)
- Site bio (present tense): `content/pages/about.md` — do not expand from raw notes unless the author asks
- Local private apps (paths only for agents on this machine; never cite names/schemas in commits or `content/`): see `author/raw/internal-app-journey.md`
