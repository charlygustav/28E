---
name: "28E — Afterglow"
description: "Existing dark 28E identity, with extracted tokens for Afterglow."
colors:
  brand-oled: "#000000"
  brand-subtle-line: "rgba(255,255,255,0.05)"
  voice-bg: "#111210"
  voice-surface: "#1c1e19"
  voice-raised: "#252821"
  voice-line: "#34382e"
  voice-text: "#f4f1e9"
  voice-muted: "#aaa99f"
  voice-accent: "#e8bd83"
  voice-accent-ink: "#272016"
  voice-success: "#9ccc9d"
  voice-danger: "#f1a29a"
  voice-primary-hover: "#f1cca0"
  voice-control: "#2c3026"
  voice-control-hover: "#3d4433"
  voice-control-pressed: "#483d2b"
  voice-control-pressed-text: "#f5d6ac"
  voice-leave: "#482b28"
  voice-leave-text: "#f6b3aa"
  voice-leave-hover: "#603a34"
  voice-avatar: "#343c2b"
  voice-avatar-text: "#d5dfc7"
typography:
  voice-headline:
    fontFamily: "'Inter', sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  voice-title:
    fontFamily: "'Inter', sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.03em"
  voice-body:
    fontFamily: "'Inter', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  voice-label:
    fontFamily: "'Inter', sans-serif"
    fontSize: "12px"
    fontWeight: 500
  voice-input:
    fontFamily: "'Inter', sans-serif"
    fontSize: "16px"
rounded:
  voice-control: "12px"
  voice-overlay: "16px"
  voice-panel-mobile: "18px"
  voice-panel: "20px"
  voice-avatar: "50%"
  voice-unread: "4px"
spacing:
  voice-compact: "8px"
  voice-control-gap: "12px"
  voice-gutter-mobile: "20px"
  voice-gutter: "24px"
  voice-lobby-gutter: "28px"
components:
  voice-button-primary:
    backgroundColor: "{colors.voice-accent}"
    textColor: "{colors.voice-accent-ink}"
    rounded: "{rounded.voice-control}"
    padding: "13px 18px"
  voice-button-primary-hover:
    backgroundColor: "{colors.voice-primary-hover}"
  voice-button-secondary:
    backgroundColor: "{colors.voice-surface}"
    textColor: "{colors.voice-text}"
    rounded: "{rounded.voice-control}"
    padding: "13px 18px"
  voice-input:
    backgroundColor: "{colors.voice-surface}"
    textColor: "{colors.voice-text}"
    typography: "{typography.voice-input}"
    rounded: "{rounded.voice-control}"
    padding: "13px"
  voice-tabs:
    textColor: "{colors.voice-muted}"
    typography: "{typography.voice-label}"
  voice-tab-selected:
    textColor: "{colors.voice-accent}"
  voice-unread:
    backgroundColor: "{colors.voice-accent}"
    textColor: "{colors.voice-accent-ink}"
    rounded: "{rounded.voice-unread}"
    height: "17px"
  voice-call-control:
    backgroundColor: "{colors.voice-control}"
    textColor: "{colors.voice-text}"
    rounded: "{rounded.voice-control}"
    padding: "10px 5px"
  voice-call-control-pressed:
    backgroundColor: "{colors.voice-control-pressed}"
    textColor: "{colors.voice-control-pressed-text}"
  voice-leave-control:
    backgroundColor: "{colors.voice-leave}"
    textColor: "{colors.voice-leave-text}"
    rounded: "{rounded.voice-control}"
  voice-panel:
    backgroundColor: "{colors.voice-bg}"
    textColor: "{colors.voice-text}"
    rounded: "{rounded.voice-panel}"
    width: "min(440px, calc(100vw - 32px))"
  voice-participant-avatar:
    backgroundColor: "{colors.voice-avatar}"
    textColor: "{colors.voice-avatar-text}"
    rounded: "{rounded.voice-avatar}"
    size: "80px"
---

# Design System: 28E

## Overview

**Creative North Star: "Una sala para conversar"** — the approved voice-surface direction, not a new name for the entire product.

28E is an intimate, personal digital time capsule with a dark editorial identity. Its durable product commitments are OLED black, subtle borders, Inter with Merriweather, and amber and tulip accents. Those commitments remain the host brand; this document does not replace them or prescribe a new global theme.

The implemented voice-channel variant is a warm, restrained room within that world: olive-tinted dark layers, ivory text, amber actions, generous avatars and quiet dividers. Its code-led visual language uses CSS geometry and inline icons; no new raster assets were created. The detailed tokens and component previews below are scoped to this variant, not a full audit of the site.

**Key Characteristics:**
- Dark 28E identity with a clearly scoped warm voice variant.
- People and presence take priority over decorative containers.
- Readable type, generous touch controls and restrained motion.

Evidence: `PRODUCT.md` supplies durable brand constraints; `assets/css/voice-channel.css` supplies the scoped implementation; `.impeccable/surfaces/assets-js-voice-channel-widget-js.md` records the selected surface. The host `index.html` also contains local typography and background overrides, so the global commitments here are not a claim that every existing page already conforms. Only `brand-oled` and `brand-subtle-line` represent explicit global color commitments; no numeric amber or tulip scale is inferred.

## Colors

### Primary

- **Voice amber:** action, selected tabs, music progress and speaking activity in the channel. **Amber ink** supplies dark text on amber controls.
- **Host amber and tulip:** established product accents; their numeric scales were outside this extraction and are intentionally not invented here.

### Neutral

- **Host OLED and subtle line:** the product’s existing black and low-contrast border commitments.
- **Voice background, surface and raised:** progressively lighter olive-tinted layers for the room, control dock and secondary content.
- **Voice ivory and muted:** primary reading and secondary metadata. **Voice line** separates regions without heavy framing.
- **Voice avatar and avatar text:** fallback participant identity colors; existing participant photos remain usable.

**State colors:** voice success indicates connected presence; voice danger and the dedicated leave colors identify failure, disabled audio indicators or leaving. Pressed controls use their own warm dark treatment; a pressed microphone/audio button is not a generic success state.

**The Scope Rule.** Apply voice-prefixed tokens only to voice-channel surfaces. Keep the host product’s OLED, amber and tulip commitments intact.

**The Speaking Ring Rule.** The amber participant ring marks speaking activity; do not make it a permanent avatar decoration.

## Typography

**Host commitment:** Inter with Merriweather. This extraction does not define an unverified global type scale. The voice variant uses Inter with a sans-serif fallback throughout; Merriweather remains a host-brand commitment rather than a voice heading face.

**Voice hierarchy:** the lobby headline uses `voice-headline`; the room heading uses `voice-title`; ordinary content uses `voice-body`; tabs use `voice-label`; editable text uses `voice-input`. Headings are closely tracked and sentence case. The lobby headline reduces to 32px at the mobile breakpoint and 28px on short viewports. Metadata ranges from 10–13px; it supports the content rather than competing with it. Timers and counts use tabular numerals.

## Layout

These measurements describe the voice variant only. On desktop the panel sits on the right, inset 16px, capped at 440px wide and 880px high, with a viewport-relative height using `100dvh`. At widths up to 480px it uses an 8px horizontal inset, safe-area-aware top and bottom insets, an 18px corner and the available viewport height. At heights up to 700px it reduces spacing and avatars; state screens can scroll below 480px height.

Content gutters use the documented voice spacing steps. The lobby keeps identity and the entry action near the bottom. In the room, a two-column participant grid accommodates four people; a single participant spans the grid. The room heading and timer remain above the tabs while microphone, audio and leave controls remain in the bottom dock. The content between them can scroll independently. Chat and music retain the same surrounding room structure. These are the selected voice-surface arrangements, not layouts to copy indiscriminately across the site.

## Elevation & Depth

Voice surfaces rely on tonal layering and one-pixel borders. The panel, history dialog and incoming-call overlay have no ambient card shadow. A dark scrim separates overlays from host content. The minimized call bar uses the sole documented shadow (`0 10px 24px -8px #0008`) to remain legible over the host page.

**The Quiet Depth Rule.** Separate voice surfaces with tonal layers and thin borders. Reserve the documented shadow for the minimized call bar.

The panel enters horizontally over 260ms using `cubic-bezier(.16, 1, .3, 1)` and fades over 180ms. Button color changes use 150ms ease-out; the speaking border uses 180ms ease-out. Reduced-motion preferences remove transitions and animation; connection progress retains a static dashed indicator.

## Shapes

Voice panels use generous rounded corners; controls and fields share the softer control radius. Participant avatars are circular. A two-pixel speaking ring sits outside the participant avatar. Lobby avatars are 88px, room avatars 80px, reducing to 70px and 64px respectively in short viewports. Dividers and outlined fields use thin borders. Participant identity is presented directly in the room rather than inside nested cards. Chat bubbles use a small directional corner within otherwise rounded shapes.

## Components

### Buttons

The primary entry action is amber with dark ink, full width, 52px minimum height and the documented control padding. Secondary actions use the voice surface and ivory text. Fine-pointer hover lightens primary amber; icon and secondary hover use the raised layer. Controls expose an amber two-pixel focus outline offset by 4px, and pressed feedback darkens via brightness. Disabled panel buttons use reduced opacity and a waiting cursor. Icon actions are at least 44px square; send, add and playback actions use 48px.

### Inputs / Fields

Chat and music fields use the surface layer, line border, control radius and 13px padding. Text remains 16px to support mobile editing. Focus uses the shared amber outline inset by 2px. Placeholder text uses the muted color without additional opacity reduction.

### Navigation

Room tabs are quiet labels on a single ruled row. Tabs have a 48px minimum height; the selected tab turns amber with a two-pixel underline. Selection is conveyed through `aria-selected`; unread counts appear as compact amber badges. Preserve the semantic tab relationship and inert hidden panels.

### Cards / Containers

The channel panel, history dialog and incoming-call overlay share dark tonal surfaces and thin borders. They are functional containers rather than decorative cards. History rows use dividers. The incoming-call overlay uses the overlay radius; the history dialog shares the panel radius.

### Voice participants and call controls

Large avatars identify participants; names truncate safely and state text sits beneath. The amber ring appears only while speaking. The bottom dock groups three equal controls with visible icon and label: microphone, audio and leaving. Its buttons have a 64px minimum height; microphone/audio pressed states use the dedicated warm tokens, and leaving uses the dedicated danger treatment. The timer holds its place when tabs change.

Opening, closing and minimizing preserve keyboard access and focus behavior. The minimized call bar is a return path to the existing call. Chat, queue and playback controls use the same voice type and surface vocabulary; do not introduce a separate music visual theme.

## Do's and Don'ts

### Do

- Do use the voice-prefixed tokens for the channel, history dialog and incoming-call overlay.
- Do keep large circular avatars, a stable timer and persistent bottom call controls in the voice room.
- Do retain visible focus, semantic selected and pressed states, readable inputs and safe-area spacing.
- Do preserve reduced-motion behavior and real presence/status information.

### Don't

- Don't apply the olive voice palette as a global 28E rebrand.
- Don't replace the host’s Inter/Merriweather and amber/tulip commitments with the voice variant’s narrower vocabulary.
- Don't add nested participant cards or a permanent speaking ring.
- Don't invent a global spacing, typography or color scale from these scoped observations.

Afterglow is the voice, chat and shared-music feature name. Keep it unchanged across languages; technical IDs and the principal room name stay stable.
