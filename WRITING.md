# Writing (author-owned)

Counterpart to `AGENTS.md`. Agents do not fill this in for you. You write every first-person word on the site.

## Doctrine

1. Every word a reader sees in a first-person voice is written by you. No AI drafting, no AI translation, no AI polish.
2. Code, config, scaffolding, and technical docs stay AI-built — that is the public story.

When you want a new empty file: ask the agent to **scaffold** (`add-blog-post` / `add-portfolio-entry`). Then you write the body.

See also: [AI-USAGE.md](AI-USAGE.md), [/transparency](https://werkscode.de/transparency).

## Checklist — prose to write

### Blog

- [ ] `content/blog/why-i-stopped-letting-ai-write.md` (+ DE when ready) — pivot announcement
- [ ] Redo any old topics from scratch if they still matter (wrong stack / stolen hours / commits / ship then modernize) — do not restore AI drafts
- [ ] Delete or ignore `content/blog/placeholder.md` when you no longer need the template

### Portfolio

- [ ] `content/portfolio/kalkulations-rechner.md` body (+ DE) — currently `draft: true` scaffold
- [ ] Delete or ignore portfolio placeholder when unused

### Editorial pages

- [ ] `content/pages/about.md` — replace factual stub with your voice
- [ ] `content/pages/transparency.md` — replace factual stub with your voice
- [ ] `content/de/pages/about.md` — your German, not a machine translation
- [ ] `content/de/pages/transparency.md` — your German

### Voice-bearing UI strings (still AI-phrased placeholders)

Rewrite in both [i18n/locales/en.json](i18n/locales/en.json) and [de.json](i18n/locales/de.json) when ready:

- [ ] `home.description`
- [ ] `home.manifesto.text`
- [ ] `home.blogCard.description`
- [ ] `home.portfolioCard.description`
- [ ] `footer.statement`
- [ ] `footer.authorship`
- [ ] `blog.description`
- [ ] `portfolio.description`
- [ ] `contact.trust.*`
- [ ] `lab.morph.intro`
- [ ] `seo.*` descriptions (home, about, transparency, blog, portfolio, contact, labMorph)

Functional labels (nav, buttons, errors) can stay agent-maintained.

## How to publish

1. Write the markdown (or locale string) yourself.
2. Set `draft: false` (or remove `draft`) when ready for listings.
3. Commit — no `Assisted-by: Cursor` on prose-only commits.
