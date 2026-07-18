---
title: Kalkulations-Rechner für Pulverbeschichtung
description: Ein Full-Stack-Nuxt-Tool, das Blechoberfläche und Wagenbelegung in ein Pulverbeschichtungs-Angebot übersetzt — inkl. STEP-Upload und 3D-Wagenansicht.
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
  - translation
---

# Kalkulations-Rechner für Pulverbeschichtung

Pulverbeschichtungs-Angebote lebten bei uns lange in Tabellen und Bauchgefühl. In einer kleinen Metallverarbeitung heißt das immer dieselben Fragen: Wie viel Oberfläche? Wie viele Teile passen auf den Aufhängewagen? Was kostet ein Wagendurchlauf wirklich — mit Waschen, Aufhängen, Pulvern, Aushärten?

Ich wollte einen Ort, an dem diese Zahlen immer denselben Regeln folgen — nicht dem, wer zuletzt die Excel-Datei angefasst hat.

## Rahmenbedingungen

Nur abends. Kein Agenturprojekt. Das Tool musste echte Shopfloor-Eingaben aushalten: Gewicht und Blechdicke, optional STEP aus dem CAD, Wagenmaße die sich ändern. Und es musste Unsicherheit ehrlich abbilden — Overspray, Mindestauftrag, unvollständig gefüllter letzter Wagen — statt so zu tun, als wäre jedes Angebot Präzisionswissenschaft.

## Ansatz

Eine eigenständige Nuxt-App: ein Vier-Schritt-Wizard für Oberfläche, Aufhängung und Wagenfüllung, Beschichtung und Vorbehandlung, dann eine nachvollziehbare Aufschlüsselung zum Speichern. Die Berechnungslogik liegt in geteiltem Code für Client und Server. PostgreSQL hält Stammdaten (Pulversorten, Arbeitsschritte, Wagenmaß) und gespeicherte Kalkulationen. Three.js zeigt die Wagenbelegung. Ein kleiner Python-Service wandelt STEP nach GLB um — für die 3D-Vorschau und zum Nachjustieren von Innen- und Außenflächen, wenn CAD da ist.

KI-Tools haben mich bei Gerüst und Three.js schneller gemacht. Die Fachregeln — wie der Wagen sich füllt, wie Pulver-kg entstehen — musste ich selbst tragen und gegen den echten Ablauf prüfen.

## Ergebnis

Ein lauffähiger Kalkulationsfluss, lokal oder auf eigener Subdomain. Blechmodus geht ohne CAD; STEP ist optional. Über die Setup-Seiten lassen sich Sätze ändern, ohne Code anzufassen. Die Live-Demo fürs Portfolio: [kalkulator.werkscode.de](https://kalkulator.werkscode.de) (nach dem Deploy).

## Takeaway

Du brauchst kein volles MES, um einen schmerzhaften Angebotsschritt zu reparieren. Ein begrenztes Problem, ein Stack den du selbst hosten kannst, und Defaults die du später anpasst — das schlägt das Warten auf das perfekte interne System.
