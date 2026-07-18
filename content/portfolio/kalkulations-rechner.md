---
title: Powder-coating quote calculator
description: A full-stack Nuxt tool that turns sheet-metal surface area and hanging-cart layout into a powder-coating quote — including STEP upload and a 3D cart view.
date: 2026-07-18
tech:
  - Nuxt
  - PostgreSQL
  - Three.js
  - Python
  - Zod
featured: true
draft: false
link: https://kalkulator.werkscode.de
ai_assist:
  - drafting
  - code
---

# Powder-coating quote calculator

Powder coating quotes used to live in spreadsheets and gut feeling. For a small metal manufacturing company, that means the same questions every time: How much surface? How many parts fit on a hanging cart? What does one cart pass actually cost once you add wash, hang, powder, cure?

I wanted one place where those numbers come from the same rules every time — not from whoever last edited the Excel file.

## Constraints

No vendor project. The tool had to survive real shopfloor inputs: weight and thickness for sheet metal, optional STEP files from CAD, and cart dimensions that change when the line runs differently. And it had to be honest about uncertainty — overspray, minimum charge, partial last carts — instead of pretending every quote is a perfect science.

## Approach

I built a standalone Nuxt app: a four-step wizard for surface area, part hanging and cart fill, coating and pretreatment, then a breakdown you can save. Shared calculation logic runs on client and server. PostgreSQL holds catalog defaults (powder types, work steps, cart size) and saved quotes. Three.js shows how parts sit on the cart. A small Python service converts STEP to GLB so you can preview the part and tweak interior vs exterior faces when CAD is available.

AI tools helped me move faster on scaffolding and Three.js wiring. The domain rules — how carts fill, how powder kg are derived — I still had to own and check against how the shop actually works.

## Result

A working quote flow you can run locally or host on its own subdomain. Sheet-metal mode works without CAD; STEP is optional. Setup pages let you adjust rates without touching code. The live app for this portfolio sits at [kalkulator.werkscode.de](https://kalkulator.werkscode.de) (when deployed).

## Lesson

You do not need a full MES to fix one painful quote process. One bounded problem, one stack you can deploy yourself, and defaults you can change later beat waiting for the perfect internal system.
