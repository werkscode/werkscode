export const SITE_NAME = 'Kalkulations-Tool'
export const ORG_NAME = 'WERKSCODE'
export const ORG_URL = 'https://werkscode.de'
export const DEFAULT_SITE_URL = 'https://kalkulator.werkscode.de'
export const GITHUB_URL
  = 'https://github.com/werkscode/werkscode/tree/main/projects/kalkulations-rechner'

export const DEFAULT_DESCRIPTION
  = 'Proof of Concept für die Kalkulation metallverarbeitender Prozesse. Aktuell: Pulverbeschichtung mit Oberfläche, Vorbehandlung und Kosten.'

export interface SeoPageMeta {
  title: string
  description: string
  path: string
}

export interface FaqItem {
  question: string
  answer: string
}

export const homeSeo: SeoPageMeta = {
  title: 'Kalkulations-Tool für Metallprozesse',
  description: DEFAULT_DESCRIPTION,
  path: '/',
}

export const powderCoatingSeo: SeoPageMeta = {
  title: 'Pulverbeschichtung kalkulieren',
  description:
    'Schrittweise Kalkulation für Blechbauteile: Oberfläche, Aufhängung, Pulververbrauch und Kosten.',
  path: '/powder-coating',
}

export const homeFaq: FaqItem[] = [
  {
    question: 'Was ist das Kalkulations-Tool?',
    answer:
      'Ein Proof of Concept von WERKSCODE zur Kalkulation metallverarbeitender Prozesse. Es hilft, Angebote und Kosten schneller und nachvollziehbarer zu erstellen.',
  },
  {
    question: 'Welche Prozesse werden unterstützt?',
    answer:
      'Aktuell ist die Pulverbeschichtung verfügbar: Oberfläche, Vorbehandlung, Pulververbrauch, Aufhängung und Wagenlayout. Weitere Prozesse sind geplant.',
  },
  {
    question: 'Ist das Tool kostenlos nutzbar?',
    answer:
      'Ja. Die öffentliche Demo ist kostenlos. Der Quellcode liegt offen auf GitHub und kann lokal mit eigener Persistenz betrieben werden.',
  },
  {
    question: 'Wo werden meine Daten gespeichert?',
    answer:
      'In der öffentlichen Demo bleiben Kalkulationen und Einstellungen im Browser (localStorage). Mit lokaler Installation und aktivierter Persistenz speichert das Tool in einer PostgreSQL-Datenbank.',
  },
  {
    question: 'Für wen ist das Tool gedacht?',
    answer:
      'Für kleine und mittlere Metallbetriebe sowie Selbstständige, die Pulverbeschichtung und ähnliche Prozesse kalkulieren — ohne teure ERP-Kalkulationsmodule.',
  },
]

export const powderCoatingFaq: FaqItem[] = [
  {
    question: 'Wie funktioniert die Pulverbeschichtungs-Kalkulation?',
    answer:
      'In vier Schritten: Oberfläche ermitteln, Bauteil/Aufhängung/Wagen festlegen, Beschichtung und Vorbehandlung wählen, danach Kostenübersicht prüfen und optional speichern.',
  },
  {
    question: 'Blechkalkulation oder STEP-Datei — was ist der Unterschied?',
    answer:
      'Bei der Blechkalkulation gibst du Maße und Flächen manuell ein. Mit einer STEP-Datei lädst du ein 3D-Modell hoch; das Tool leitet daraus die beschichtbare Oberfläche ab.',
  },
  {
    question: 'Was bedeutet der Demo-Modus?',
    answer:
      'Im Demo-Modus werden Kalkulationen und Einstellungen nur im Browser gespeichert und nicht auf den Server geschrieben. Für Datenbank-Persistenz das Repo klonen und Persistenz aktivieren.',
  },
  {
    question: 'Kann ich Kosten und Katalog anpassen?',
    answer:
      'Ja. Unter Einstellungen (Setup) kannst du Kosten, Wagenmaße, Vorbehandlungen und Pulversorten anpassen — in der Demo lokal im Browser, mit Persistenz in der Datenbank.',
  },
]

export const powderCoatingHowToSteps = [
  {
    name: 'Blechoberfläche ermitteln',
    text: 'Oberfläche per Blechkalkulation eingeben oder STEP-Datei hochladen, um die beschichtbare Fläche zu bestimmen.',
  },
  {
    name: 'Bauteil, Aufhängung und Wagen',
    text: 'Bauteilmaße, Aufhängungsart und Wagenlayout festlegen, um Auslastung und Durchlauf zu planen.',
  },
  {
    name: 'Beschichtung und Vorbehandlung',
    text: 'Stückzahl, Vorbehandlung und Pulversorte wählen; der Verbrauch und die Kosten werden berechnet.',
  },
  {
    name: 'Ergebnis prüfen',
    text: 'Kostenübersicht einsehen und die Kalkulation optional speichern.',
  },
] as const

export function absoluteUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '')
  if (!path || path === '/') return `${base}/`
  const normalized = path.startsWith('/') ? path : `/${path}`
  // Asset paths (files with extensions) should not force a trailing slash
  if (/\.[a-z0-9]+$/i.test(normalized)) {
    return `${base}${normalized}`
  }
  return `${base}${normalized}`
}

export function faqToSchemaMainEntity(items: FaqItem[]) {
  return items.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }))
}
