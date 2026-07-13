---
title: Why I put this site in a public repo from day one
description: Learning to code while running a business — and choosing visibility over the perfect private launch.
date: 2026-07-13
tags:
  - learning
  - ai-tools
  - entrepreneurship
draft: false
---

The first time I thought about putting my code on GitHub, my stomach did the thing it does before a difficult customer call.

Not because I had secrets in the repo. Because the repo *felt* like a secret — messy commits, half-finished pages, placeholder text that still said "coming soon." I'm a managing director at a small metal manufacturing company. I'm used to shipping steel that either holds or it doesn't. Software felt different. You can hide it until it's polished. Most people do.

I almost did too.

## The comfortable lie of "later"

For years my digital life was split in two. On the shopfloor we had systems I couldn't easily change — expensive, slow, built for a different era. At home I had ideas: a better way to track something, a small tool for a recurring headache, a site where I could write about learning to code without pretending I'd been doing it for twenty years.

Every time I started, I made the same quiet deal with myself: *keep it private until it's good.*

Private repos feel safe. Nobody sees the typo in commit message three. Nobody notices you rebuilt the same page four times because Tailwind spacing looked wrong on your laptop. Nobody asks why a CEO is learning Docker at midnight.

But "later" has a cost. Private repos teach you to perform for an audience of one. You optimize for your own embarrassment instead of for clarity. You wait for a level of polish that never arrives — because you're not a full-time developer, and you're not supposed to be.

The breaking point wasn't dramatic. It was a Tuesday evening. I'd spent an hour fixing something small — routing, or a database migration, I don't remember which — and I thought: *if I'm going to learn this properly, I need habits that match how real software gets built.* Real software, in 2026, is often built in the open. Or at least built as if someone might read it tomorrow.

So I made WERKSCODE public from day one. Not day one of a finished site. Day one of the scaffold.

## What I was afraid of

I'll be honest about the fears, because you might have them too.

**"People will think I'm not a real developer."**
Correct. I'm not. I'm a business owner who needed to stop waiting for permission to fix my own problems. Putting the repo public didn't claim expertise. It claimed intent.

**"Someone will steal my idea."**
The ideas that matter on my shopfloor aren't in this repo. This site is a blog and portfolio — a place to think in public. The manufacturing tools I build for internal use stay private, as they should. Public here doesn't mean public everywhere.

**"I'll leak something I shouldn't."**
This one is real. A public repo is a discipline problem. So we treat it like one: no `.env` files, no customer names, no production URLs, no references to internal systems. Comments, commits, and markdown are written as if a stranger will read them — because they might. That constraint sounds annoying. It's actually freeing. It forces you to separate *the lesson* from *the confidential detail*.

**"It's ugly."**
It was. It still is in places. But ugliness in public is honest. Selbstständige don't need another polished landing page. They need proof that a normal person can start.

## What changed when the repo went public

The surprise wasn't GitHub stars or viral traffic. I don't expect those, and that's fine.

The surprise was **how I started working.**

When the repo is public, you stop writing commit messages like `fix stuff` and start writing ones you wouldn't be ashamed to show an employee. You add a `.gitignore` before you need it. You read your own diff. You ask the AI assistant — Cursor, in my case — to follow project rules because those rules are now part of the product, not a private note on your desktop.

AI tools helped more in a public repo, not less. When the standards are written down — how to commit, how to anonymize blog posts, what never to paste into chat — the assistant stops improvising privacy mistakes. The codebase becomes a collaboration surface between me, the tools, and a future reader who might fork it for their own experiment.

I also stopped confusing *learning* with *launching*. The site can say "coming soon" on the homepage while the repository already documents the journey. The blog can be empty while the Makefile and Docker setup are real. Public repo doesn't mean public marketing. It means public **process**.

## Dead ends I still hit

Going public didn't magically make me productive.

I still rebuilt the dev environment after dependency changes. I still hit content-cache errors and had to learn what Nuxt Content keeps in SQLite. I still wrote layout code three different ways before we settled on shared page components. The repo shows that arc if you look at the history — and I'm okay with that.

What public *did* do was prevent the worst dead end: a perfect private project that never ships because it was only ever meant for me.

## What I'd tell another Selbstständiger

If you're learning to code while running a business, you don't need a private sandbox until you're "ready." You need a **small public place** with clear boundaries.

Pick something low-risk to open source — a site, a script, a template — not your crown jewels. Write down what must never appear in git. Use drafts for content you're not ready to publish on the *website*, even if the *repo* is already visible. Let the repository document how you work, not every detail of how you earn a living.

WERKSCODE is my small public place. The name is a joke and a promise: Werks meets code. The repo being public from day one is part of the promise too — *this is how I'm actually learning*, not how I'll pretend I learned once it's pretty.

You don't have to open your manufacturing systems to the internet. You don't have to become an influencer. You only have to decide whether hiding your learning is still helping you — or whether it's the same "we'll digitalize when we have time" story the shopfloor has heard before.

I chose visibility. Not because I'm brave. Because private was too comfortable, and comfortable wasn't getting the work done.
