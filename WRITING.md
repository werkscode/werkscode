# Writing (author-owned)

Agents do not fill this in. You type every reader-facing word that lands in the repo. AI may suggest in chat. You type what gets committed.

Titles and functional UI (nav, buttons, form labels, placeholders, errors, loading, short status labels) may be agent-written. Anything longer than two sentences or twenty words is yours, including meta descriptions, alt text, empty states, footer lines, card blurbs, trust copy, about text, and SEO descriptions. Agents do not translate. An empty German string stays empty.

When you want a new empty blog file, ask the agent to scaffold (`add-blog-post`). Then you write the body.

See also: [AI-USAGE.md](AI-USAGE.md), [/transparency](https://werkscode.de/transparency).

## Pages and strings to fill

Same keys in [i18n/locales/en.json](i18n/locales/en.json) and [de.json](i18n/locales/de.json) unless noted. Empty means you have not written it yet. Do not ask an agent to draft the sentence.

### Home

The homepage shows the title, links to blog, about, and contact, and the latest published post when one exists. `home.description` renders under the title when you set it.

- [ ] `home.description`
- [ ] `seo.home.description`

These keys are empty and not rendered after the layout change:

- [ ] `home.manifesto.text`
- [ ] `home.blogCard.description`
- [ ] `home.contactStrip.text`

### About

- [ ] `content/pages/about.md`
- [ ] `content/de/pages/about.md`
- [ ] `about.description`
- [ ] `seo.about.description`

### Transparency

Reachable from the nav. Not featured on the homepage.

- [ ] `content/pages/transparency.md`
- [ ] `content/de/pages/transparency.md`
- [ ] `seo.transparency.description`

### Contact

Trust lines are hidden while empty. The form labels and submit button stay.

- [ ] `contact.description`
- [ ] `contact.trust.who`
- [ ] `contact.trust.response`
- [ ] `contact.trust.privacy`
- [ ] `contact.toast.successDescription`

### Footer and blog chrome

Hidden while empty.

- [ ] `footer.statement`
- [ ] `footer.authorship`
- [ ] `blog.description`
- [ ] `blog.endCta.text`

### Blog files

- [ ] `content/blog/why-i-stopped-letting-ai-write.md` — your draft; add `content/de/blog/` when you write the German
- [ ] Delete or ignore `content/blog/placeholder.md` (and `content/de/blog/placeholder.md`) when you no longer need the template

## How to publish

1. Write the markdown (or locale string) yourself.
2. Set `draft: false` (or remove `draft`) when a blog post is ready for listings.
3. Commit — no `Assisted-by: Cursor` on prose-only commits.
