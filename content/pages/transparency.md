---
title: How I use AI on this site
description: What AI tools help with, what I still do myself, and how I keep this project honest and personal.
---

This site is personal. I want it to stay that way — even though AI tools helped me build it.

I'm not hiding that. If you're reading this, you probably care about authenticity too. So here is how I work, in plain language.

## The short version

**I use AI as a tool, not as a ghostwriter.**

[Cursor](https://cursor.com) is my main assistant for code and content. It drafts, suggests, and speeds things up. I decide what goes live, edit what sounds wrong, and take responsibility for what you read here.

If something on this site feels like *me*, it's because I made it feel that way on purpose.

## What I use

- **Cursor** — coding, refactoring, debugging, and content drafting in this repo
- **Large language models** (via Cursor) — research, wording, translation EN → DE

That's it for now. No secret stack. When that changes, this page gets updated.

## What AI typically helps with

| Label | What it means |
|-------|----------------|
| **drafting** | First versions of blog posts, portfolio text, or page copy |
| **editing** | Grammar, structure, tightening sentences, tone checks |
| **translation** | German versions based on an English draft I have already approved |
| **code** | Scaffolding, boilerplate, refactors, and "why is this broken?" sessions |
| **research** | Looking up APIs, framework docs, or patterns I haven't used yet |
| **images** | AI-generated or assisted visuals — only when noted on a specific piece |

Blog and portfolio entries can record these labels in frontmatter (`ai_assist`) as structured metadata. You won't see badges on every post yet — but the record exists in the [GitHub repository](https://github.com/werkscode/werkscode) for anyone who wants to check.

## What I still do myself

- **Decide** what to publish and what stays draft
- **Edit** until the voice sounds like a shopfloor CEO, not a marketing bot
- **Verify** facts, links, and that nothing private slipped in
- **Run** the business context — the stories here come from my experience, anonymized
- **Take responsibility** for errors, tone, and what this project stands for

AI didn't write my app for me. It shortened the distance between "I have an idea" and "let me see if this works." I still had to understand what broke when it broke.

## Privacy boundaries

The [GitHub repository](https://github.com/werkscode/werkscode) is [public from day one](/blog/public-repo-from-day-one). That means discipline:

- No real company, customer, or employee names in git — ever
- No `.env` files, credentials, or internal system details
- Content is written as if a stranger will read it

AI assistants follow the same rules via project standards in `.cursor/`. When the boundaries are written down, the tools stop improvising privacy mistakes.

See also [AI-USAGE.md](https://github.com/werkscode/werkscode/blob/main/AI-USAGE.md) in the repository for the full policy.

## Commits and code

When AI helped with a commit in a meaningful way, I may add an optional trailer:

```
Assisted-by: Cursor
```

That's not a badge of shame. It's a habit — like writing commit messages you'd show an employee.

## What this is not

- **Not** "AI wrote my entire site" — it didn't
- **Not** pretending every word was typed without help
- **Not** a tutorial on how to automate your personality away

WERKSCODE is a small public place to learn in the open. Transparency is part of that promise.

## Questions?

If something here is unclear or you think I missed a disclosure, [get in touch](/contact). I'd rather fix it than hide behind vague wording.
