# Abhinandha K — portfolio

A static, dependency-free personal site. No build step, no framework, no `npm install`.

```
index.html          all content and structure
styles/main.css     tokens, layout, every animation
scripts/main.js     hello intro, progress rider, copy email, zones, cursor, text splitting, reveals, parallax, rotator, lightbox, embeds
assets/work/        product screenshots and portrait (webp); supplied case-study media goes here.
                    Diagram facts (row counts, table counts, the cloud → self-hosted hop) were read
                    from the live database catalogue on 2026-09-14, schema metadata only.
assets/work/slack/  customer Slack threads + one Meet call (webp)
```

## Run it locally

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Hosted on **Vercel**, deployed by GitHub Actions (`.github/workflows/deploy.yml`):

- push to `main` → production
- pull request → preview URL, linked from the PR's checks
- every run warns about any image or file `index.html` points at that doesn't exist

Vercel's own Git auto-deploy is off (`vercel.json`) so deploys only come from the workflow.

**One-time setup**

1. `vercel login`, then `vercel link` in this folder (creates the project, writes `.vercel/project.json`).
2. From `.vercel/project.json`, copy `orgId` and `projectId`.
3. Create a token at vercel.com/account/tokens.
4. In the GitHub repo → Settings → Secrets and variables → Actions, add
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
5. Re-run the workflow (Actions → Deploy → Run workflow) or push a commit.

## Things you'll want to change

**The walkthrough video.** In `index.html`:

```html
<div class="video reveal" data-anim="up" id="video" data-loom="3a11377e...">
```

Replace `data-loom` with the share id of the final recording (the part of a Loom URL
after `/share/`). **The current recording shows real customer email addresses.** The
player is click-to-load so nothing loads for a visitor who doesn't press play, but swap
it before sharing the site widely.

**Page order.** Hero → Working with customers (`#customers`) → Work (`#work`) → walkthrough →
side projects → about. The customer proof runs first, deliberately: it is the part that isn't code.
The `data-zone` letters must stay in page order (hero `a`, customers `b`, work `c`, …) because the
background colour morphs to the zone of the section under the reading line, and the nav links are a
table of contents, so they follow the same order.

**The Work section.** Eight full-width chapters (`article.case`). Each has a header with a
huge faint number behind the title (`.case__n`), two columns — `.case__lead` (the lede and
the one-line **Outcome** pill) and `.case__body` (paragraphs and tags) — 01's feature list
(`.case__wide`) full width, and, where there is one, a media figure the full width of the column.
No index. 01 shows the Data Explorer companies view (`huntd-explorer-companies.webp`, company
names and domains blurred); 02, 03, 04, 05 and 08 carry inline SVG diagrams drawn in the site's own
style (`svg.dia`: Lilita headings, Rubik text, tint panels, coral arrows; `.shot--flat` so they get
no 3D lean). 03, 04 and 05 pair their diagram with a real screenshot underneath it — a supporting
screenshot gets `.shot--narrow` (620px) so it does not compete with the diagram. Pixel-font text
(`.dia__k`) has no arrow glyph, so write "FALSE TO TRUE" there rather than "FALSE → TRUE".

Work media is capped: figures are 940px wide (900 for diagrams, 620 for `.shot--narrow`) and
`img` is `max-height: 440px` with `object-fit: cover`, so no single screenshot owns a chapter.

**Adding pictures and videos.** Cases 06 and 07 still carry a commented `MEDIA SLOT` block in
`index.html` with the filenames already filled in:

| case | files |
|---|---|
| 06 Web research agent | `assets/work/web-search-agent.webp` |
| 07 Building Clay | `assets/work/web-searches.webp` |

Drop the files in, delete the `MEDIA SLOT` and `END MEDIA SLOT` comment lines around the
figure, and set each `<img>`'s real `width`/`height`. For a video instead of a picture, replace
the `<img>` inside its `shot__frame` with:

```html
<video controls preload="none" playsinline poster="assets/work/signup-poster.webp">
  <source src="assets/work/signup.mp4" type="video/mp4">
</video>
```

Nothing loads until play. For a Loom or YouTube recording, give the `shot__frame` the classes
`shot__frame embed` plus `data-embed data-loom="<share id>"` (or `data-youtube`) and copy the
play button from `#video`; the iframe is injected on click only. On click the loader also holds a
spinner (`.video__wait`) over the iframe until it fires `load`, reveals an "open it on Loom" link
after 4s and clears itself after 20s, because the Loom player takes a few seconds to boot and an
empty black box reads as broken. Hovering the play button preconnects to Loom.

**Project repo links.** LostNFound and Inkling link to their repos; the other three cards
still point at the GitHub profile root — search `class="ul"` inside `.card` and swap in the
individual repo URLs. The cards carry no images: not every project had an architecture diagram, so
the GitHub link does that job. Cards run three across on desktop in this order: AI Fashion Platform, Accident
Detection, Personal AI Assistant, LostNFound, Inkling; **Read more** opens each one.

**The rotating headline.** The four lines under "Software that" live in `#rot`. Keep them
short enough to fit one line at desktop width (about 22 characters) — a line that wraps
makes the mask box taller and the rotation looks wrong.

**Colours.** Every colour is a token at the top of `styles/main.css`. Six colours plus
their `--*-ink` small-text twins; change a colour and its twin together and re-run the
contrast check (all small text must stay ≥ 4.5:1 on every `--zone-*` page colour).

## Design — v7, soft

Calm, rounded and airy, coloured with *Color Palette No. 16* from the owner's Pinterest
board. One theme, no libraries.

- **Palette.** The six colours exactly as printed — pink `#F686A5`, coral `#FE8D6F`,
  yellow `#FDC455`, lime `#DFD96C`, sky `#A0DDED`, mint `#9ADBC5` — used two ways: as soft
  tints for fills (`--pink-t` … `--mint-t`: pills, badges, skill cards, stickers, diagram
  boxes) and at full strength only for small accents (buttons are coral, the name's
  underline is pink, 5px colour bands on cards and tiles, bullet dots, the rider). Warm
  cream `#FFFBF6` ground, soft plum-charcoal `#2F2B3A` ink, same ink for the footer with
  yellow links. Small text uses the darker `--*-ink` twins; weakest pair on the page is
  `--muted` on `--bg-2` at 5.0:1.
- **Surfaces.** No outlines and no hard shadows. `--border` is a 1px hairline at 8% ink;
  `--shadow-sm` / `--shadow` / `--shadow-lg` are layered, diffused shadows; radii are
  `--r-sm 12` / `--r 20` / `--r-lg 28`. Hover is a small lift plus the next shadow step.
- **The page colour drifts.** `--zone-a..f` are whisper-pale tints of the six — peach
  `#FFF3EB`, soft coral `#FFE9E3`, yellow `#FFF8E5`, lime `#F8F9EA`, pink `#FFF0F4`, mint `#EDF8F2` —
  one per section. The whole page is one colour at a time; `main.js` sets `data-zone` on
  `<html>` for the section under the reading line and the body fades to its colour over
  1.6 s. Each section's eyebrow, bullet dots, chip hover and heading glow take its hue. The
  footer is a full-width plum band.
- **No gradients.** One flat colour per element. The only `*-gradient()` uses are the
  single-colour hover spotlight on cards and tiles.
- **Type.** Lilita One for display and titles, Rubik for reading, Press Start 2P only for
  eyebrows, badges and card labels.
- **Content rules kept:** no college, student status, city, country, "intern", dates or
  metrics strip; "Side projects"; the chess line; every Work case study, the
  `.facts` list carried over byte-for-byte.

## The mechanics, and how each one works

Everything degrades to a static, fully visible page without JS (animation styles are gated
on `html.js`) or under `prefers-reduced-motion`.

| effect | where | mechanism |
|---|---|---|
| hello intro | `.pl`, `#hi` | The letters of "hello" bounce in on cream with no box. Once fonts + hero image are ready (1.2 s cap) and the letters have landed, `leave()` transforms the word onto the sticker text beside "I'm" (centre, size, tilt) while the veil fades; on arrival `.is-landed` fades the sticker's box in around the text. `sweep()` holds the hero until `html.is-loading` clears. |
| Work chapters | `.case` | Watermark number in coral at 22%, title over its lower-right, lede + outcome left and paragraphs right, media full width under the text (no bleed — the user found it "going out of the screen"). |
| Picture wipe | `.shot`, `.tile`, `.feature` | Media unveils top to bottom with `clip-path` as its reveal fires, and the image settles from a slight zoom. |
| Contact | nav, hero, footer | "Let's connect" and "Get in touch" scroll to the footer. **Email me** opens Gmail compose in a new tab; clicking the address itself copies it (Clipboard API, textarea fallback) and a small pill confirms. `mailto:` links were dropped because they do nothing on a machine with no mail app. |
| Progress + rider | `.track`, `#rider` | A 3px hairline across the top; a small coral dot with a soft halo sits at `left: calc(var(--p) * 100%)`. |
| Zone morph | `[data-zone]` | Body background drifts to the zone of the section under the reading line (offset so the change lands as the section arrives), 1.6 s ease. |
| Nav hover swap | `.nl` | Char-by-char swap on hover (`.nl__w` wraps the two layers); the active link takes the accent. |
| Side projects | `.card`, `.card__more` | Cards arrive from `translateX(60vw)` with an overshoot, 120 ms apart, showing a kicker, title, one-line summary and GitHub link. **Read more** expands the body (details, diagram, tags) with a `grid-template-rows: 0fr → 1fr` transition; collapsed bodies are `inert`. Without JS the bodies are simply open. |
| Sticker scene | `#scene` | The hello sticker and My-work tag slide by their own `--depth` under the pointer, drift idly and flip on hover; the name's underline (`.swash`) draws itself on reveal; the product card floats on `@property`-animated angles summed with the pointer tilt. |
| Reveals | `.reveal`, `[data-anim]`, `[data-split]` | Case text and media rise 40px and un-tilt 8° about their top edge, so a tall case reads as soon as it enters (the sweep fires at 92% of the viewport); the walkthrough and wide tiles rise from 18° back; tiles fan in from ±28°; heading words rise and flip up from −70°; hero name chars rise, twist and un-blur. Hovers use the `--bounce` overshoot. |
| Scroll lean, spotlight + tilt, cursor, magnetic buttons | frames, `.tile`, `.card` | Frames lean up to ±8° as they cross the viewport, pointer tilt 7° (cards 5°), the hero card floats ±4° and tilts 9°/7° with the pointer. Cursor is a small ink dot and a hairline ring that fills with a pale tint over links and a coral tint (with a label) over media. |

Removed in this round, by request: the perspective lane behind the hero, the floating
coins, and the whole points system (HUD, coin pickups, station toasts, run badge).

**Every animated element needs the `reveal` class.** The reveal sweep is deterministic
(scroll, load, resize, plus a self-clearing poll), not IntersectionObserver, and nothing
scroll-driven lives inside `requestAnimationFrame`.

Traps met on the way, so they aren't met again:

1. **Never hold a reveal with `transition-delay`** — a delay changed mid-flight never
   restarts. The hero is held by withholding `.is-in` in JS.
2. **`[hidden] { display: none !important }`** is in the base styles because the
   lightbox's `display: grid` would otherwise override the attribute.
3. **Nav chars and headline chars must not share a class** — nav chars are `.c-nav`.
4. **Replacing a CSS block by comment markers deletes whatever else lived between them**
   — frame rules live beside the case-study rules for that reason.
5. **Off-screen arrival transforms inflate `scrollWidth`** even with `body
   { overflow-x: hidden }`; clip at the section.
6. **Chrome's screenshot canvas wraps at 16,384 px** — the page is taller than that, so
   render the footer separately (`#main { display: none }`) instead of trusting a tall
   capture's bottom.

## Customer evidence

`assets/work/slack/` holds five threads and two calls, picked from a larger set:

| file | what it proves |
|---|---|
| `forty-contacts` | Featured as *Protecting Deepgram's lead attribution*: forty contacts already carried the customer's own attribution, so it was raised with their team and the approach they chose was shipped. Shown in full beside the prose. |
| `signup-signal` | Shipped a feature before launch; "This is amazing thank you." |
| `salesforce-live` | Two customer people thanking her by name for the troubleshooting. |
| `cross-sell` | Spotted one customer's workflow fit another and offered it. |
| `hubspot-spec` | A complete loop: spec → they create it → she backfills → done. |
| `deepgram-call` | A Google Meet with the customer's team — live calls, not just Slack. The two calls lead the tile grid. |
| `hyperbound-call` | A Google Meet onboarding HyperBound with the Data Explorer shared on screen. |

**Redaction rule:** people *in* the conversation — names, avatars, @mentions — stay
visible; that's the point of the section. Only outsiders are Gaussian-blurred: a
prospect's name, title, employer and email in `signup-signal`; an email and Salesforce org
IDs in the file previews in `salesforce-live`; one deactivated employee's name in
`forty-contacts`; on `hyperbound-call` the shared screen's prospect rows (names, emails,
companies, titles), the customer's login email and the meeting code. `deepgram-call` and
`hyperbound-call` show other people's faces unblurred — the owner should have their ok
before this is public. **If you regenerate any of these, read every
export back and confirm the blurred text is unrecoverable.**

A recruiter email in the source folder containing salary figures and a third party's
confidential ARR is deliberately excluded and should stay that way.

## Verifying changes

Traps that cost time here:

1. **Headless Chrome starves `requestAnimationFrame`**, so transitions crawl and
   screenshots come back half-faded. Verify with DOM measurement (computed styles,
   bounding rects, `img.naturalWidth`), not pixels. For visual checks, inject a style that
   kills transitions and add `.is-in` to everything.
2. **Windows won't open Chrome narrower than ~512px.** A `--window-size=400,…` capture is a
   crop of a 512px layout and looks like an overflow. Check
   `scrollWidth === clientWidth` instead.
3. **The page is ~9,700px tall.** A 9,000px canvas silently drops the footer. Render at
   11,000 and crop by the footer's measured offset, not by colour detection — the footer is
   a solid block that defeats "find the last row that differs from the background".
