---
title: Kalkulationsrechner für die Pulverbeschichtung
description: Ein Nuxt-Tool, das aus Blechfläche und Wagenbelegung ein Pulverbeschichtungs-Angebot macht — mit optionalem STEP-Upload und 3D-Ansicht des Wagens.
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
  - editing
---

# Kalkulationsrechner für die Pulverbeschichtung

Pulverbeschichtungs-Angebote liefen bei uns lange über Excel und Bauchgefühl. In einer kleinen Metallverarbeitung kommen immer dieselben Fragen: Wie viel Oberfläche? Wie viele Teile passen auf den Gehängewagen? Was kostet ein Wagendurchlauf wirklich — mit Waschen, Aufhängen, Pulvern und Aushärten?

Ich wollte einen Ort, an dem diese Zahlen immer denselben Regeln folgen — und nicht davon abhängen, wer zuletzt die Excel-Datei angefasst hat.

## Vorgaben

Kein externes Projekt, kein Agenturauftrag. Das Tool musste mit echten Eingaben aus der Halle klarkommen: Gewicht und Blechdicke, optional STEP aus dem CAD, Wagenmaße, die sich ändern, wenn die Linie anders läuft. Und es sollte Unsicherheit ehrlich abbilden — Overspray, Mindestbetrag, der letzte Wagen, der nicht voll wird — statt so zu tun, als wäre jedes Angebot Präzisionsarbeit.

## Vorgehen

Ich habe eine eigene Nuxt-App gebaut: vier Schritte für Oberfläche, Aufhängung und Wagenfüllung, Beschichtung und Vorbehandlung, danach eine nachvollziehbare Aufschlüsselung zum Speichern. Die Berechnungslogik steckt in gemeinsam genutztem Code für Client und Server. PostgreSQL hält Stammdaten (Pulversorten, Arbeitsschritte, Wagenmaße) und gespeicherte Kalkulationen. Three.js zeigt, wie die Teile auf dem Wagen sitzen. Ein kleiner Python-Dienst wandelt STEP nach GLB um — für die 3D-Vorschau und zum Nachjustieren von Innen- und Außenflächen, wenn CAD vorhanden ist.

Mit KI-Tools ging Gerüst und Three.js-Anbindung schneller. Die Fachregeln — wie der Wagen sich füllt, wie aus Fläche Pulver-Kilogramm werden — musste ich selbst tragen und am echten Ablauf prüfen.

## Ergebnis

Ein lauffähiger Kalkulationsfluss, lokal oder auf eigener Subdomain. Blech geht ohne CAD; STEP ist optional. Über die Einstellungen lassen sich Sätze ändern, ohne am Code zu schrauben. Die Live-Demo fürs Portfolio: [kalkulator.werkscode.de](https://kalkulator.werkscode.de).

## Fazit

Du brauchst kein volles MES, um einen schmerzhaften Angebotsschritt zu reparieren. Ein begrenztes Problem, ein Stack, den du selbst hosten kannst, und Vorgaben, die du später anpasst — das schlägt das Warten auf das perfekte interne System.
