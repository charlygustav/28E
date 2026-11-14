---
name: "28E — Afterglow"
description: "Existing dark 28E identity, with scoped tokens for compact Afterglow."
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
  voice-dock: "#20241b"
  voice-dock-line: "#474c3d"
  voice-dock-meta: "#b9c1ad"
  voice-dock-active: "#373e2d"
typography:
  voice-headline:
    fontFamily: "'Inter', sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  voice-title:
    fontFamily: "'Inter', sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.03em"
  voice-title-compact:
    fontFamily: "'Inter', sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.2
  voice-tab:
    fontFamily: "'Inter', sans-serif"
    fontSize: "16px"
    fontWeight: 500
  voice-status:
    fontFamily: "'Inter', sans-serif"
    fontSize: "14px"
  voice-timer:
    fontFamily: "'Inter', sans-serif"
    fontSize: "15px"
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
  voice-dock-action: "10px"
spacing:
  voice-compact: "8px"
  voice-control-gap: "12px"
  voice-gutter-mobile: "20px"
  voice-gutter: "24px"
  voice-header-top: "26px"
  voice-header-gutter: "28px"
  voice-call-gap: "8px"
  voice-dock-gap: "4px"
  voice-inner-gutter: "16px"
components:
  voice-button-primary:
    backgroundColor: "{colors.voice-accent}"
    textColor: "{colors.voice-accent-ink}"
    rounded: "{rounded.voice-control}"
    padding: "11px 16px"
  voice-button-primary-hover:
    backgroundColor: "{colors.voice-primary-hover}"
  voice-button-secondary:
    backgroundColor: "{colors.voice-surface}"
    textColor: "{colors.voice-text}"
    rounded: "{rounded.voice-control}"
    padding: "11px 16px"
  voice-input:
    backgroundColor: "{colors.voice-surface}"
    textColor: "{colors.voice-text}"
    typography: "{typography.voice-input}"
    rounded: "{rounded.voice-control}"
    padding: "11px 12px"
  voice-tabs:
    textColor: "{colors.voice-muted}"
    typography: "{typography.voice-tab}"
  voice-tab-selected:
    textColor: "{colors.voice-accent}"
  voice-unread:
    backgroundColor: "{colors.voice-accent}"
    textColor: "{colors.voice-accent-ink}"
    rounded: "{rounded.voice-unread}"
    height: "20px"
  voice-call-control:
    backgroundColor: "transparent"
    textColor: "{colors.voice-muted}"
    rounded: "{rounded.voice-control}"
    padding: "0 4px"
  voice-call-control-pressed:
    backgroundColor: "transparent"
    textColor: "{colors.voice-accent}"
  voice-leave-control:
    backgroundColor: "transparent"
    textColor: "{colors.voice-danger}"
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
  voice-minimized-dock:
    backgroundColor: "{colors.voice-dock}"
    textColor: "{colors.voice-text}"
    rounded: "{rounded.voice-overlay}"
    padding: "8px"
    width: "370px"
---

# Design System: 28E

## Overview

**Creative North Star: "Una sala para conversar"** — the approved voice-surface direction, not a new name for the entire product.

28E is an intimate, personal digital time capsule with a dark editorial identity. Its durable product commitments are OLED black, subtle borders, Inter with Merriweather, and amber and tulip accents. Those commitments remain the host brand; this document does not replace them or prescribe a new global theme.

The implemented Afterglow voice-channel variant is a compact, restrained room within that world: olive-tinted dark layers, ivory text, amber actions, recognizable avatars and quiet dividers. Entry, composers and call controls stay in view; queue and catalog content use adaptive pages. Its code-led visual language uses CSS geometry and inline icons; no new raster assets were created. The detailed tokens and component previews below are scoped to this variant, not a full audit of the site.

**Key Characteristics:**
- Dark 28E identity with a clearly scoped warm voice variant.
- People and presence take priority over decorative containers.
- Compact hierarchy with visible actions, bounded transcript scrolling and adaptive music pages.
- Readable inputs, direct dock controls and restrained motion.

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

The room title is 28px (26px in short viewports), status is 14px, timer is 15px and tabs are 16px with 20px icons and 48px targets. Put the timer on the status row to preserve a readable title at narrow widths.

**Host commitment:** Inter with Merriweather. This extraction does not define an unverified global type scale. The voice variant uses Inter with a sans-serif fallback throughout; Merriweather remains a host-brand commitment rather than a voice heading face.

**Voice hierarchy:** the lobby headline uses `voice-headline`; the room heading uses `voice-title`; ordinary content uses `voice-body`; tabs use `voice-tab`; editable text uses `voice-input`. Headings are closely tracked and sentence case. The lobby headline is 30px by default, 28px at the mobile breakpoint, 26px at heights up to 700px and 22px in short landscape. The room title is 28px by default and 26px at heights up to 700px. Secondary metadata ranges from 10–13px; it supports the content rather than competing with it. Timers and counts use tabular numerals.

## Layout

The room header starts directly with the room name, presence, elapsed time and close control. Do not add a separate logo or Afterglow wordmark row; it uses space needed by the activity area. The heading has 26px top, 28px horizontal and 16px bottom padding. The title and 44px close control share the first grid row; presence and timer align on the second. Tabs align to the same horizontal inset. At widths up to 380px, heading and tab insets reduce to 24px. In short landscape the heading uses 12px top, 24px horizontal and 6px bottom padding, with the timer beside the title and close control.

These measurements describe the Afterglow voice variant only. On desktop the panel sits on the right, inset 16px, capped at 440px wide and 880px high, with a viewport-relative height using `100dvh`. At widths up to 480px it uses an 8px horizontal inset, safe-area-aware top and bottom insets, an 18px corner and the available viewport height. At heights up to 700px it reduces spacing, type and avatars. In short landscape (height up to 480px, width at least 600px), the panel widens to a 720px cap and the lobby and music queue use two-column arrangements. The lobby description and room status are omitted there to retain the primary actions.

Activity content uses compact gutters from 16px to 24px; the room header keeps the larger inset documented above. Identity and the join action stay visible in the lobby. In the room, the heading, stable timer, tabs and bottom call controls frame a flexible activity area. The participant grid retains two columns for four people, with a single participant spanning both. Chat and music composers remain visible with the main controls; only a populated conversation transcript uses bounded scrolling. Empty chat and music views do not require a scroll to reach actions. Connection or error state screens can scroll on exceptionally short viewports.

Music uses a single current-track block: artwork and title above a slim seek rail with play/pause and skip. There is no music-volume control. The current track is omitted from the waiting queue, whose heading shares a quiet Spotlight text link. Pagination appears only for multiple pages; the URL field keeps an accessible label without a separate visible caption. Music queue and catalog occupy clipped list windows with adaptive pagination. Each track row is 48px high; available list height determines the number of visible rows. The player, catalog access and URL composer remain outside the queue window. Catalog search and previous/next navigation remain outside its window. Resizing adjusts page size rather than pushing actions below the panel; existing input drafts survive list updates. These are Afterglow surface arrangements, not global page-layout rules.

The minimized dock is a separate controller with restore, microphone, audio and leave buttons. Desktop placement is 24px from the right and safe-area-adjusted bottom, with a 370px width and viewport cap. At widths up to 600px it centers at 360px wide and sits 88px above the safe-area bottom, above the host letter button. At widths up to 380px the dock audio button is hidden; audio remains available inside the room.

## Elevation & Depth

Voice surfaces rely on tonal layering and one-pixel borders. The panel and incoming-call overlay have no ambient card shadow. A dark scrim separates overlays from host content. The minimized dock uses the documented shadow (`0 12px 28px -12px #000a`) to remain legible over the host page.

**The Quiet Depth Rule.** Separate voice surfaces with tonal layers and thin borders. Reserve the documented shadow for the minimized dock.

The panel enters horizontally over 260ms using `cubic-bezier(.16, 1, .3, 1)` and fades over 180ms. Button color changes use 150ms ease-out; the speaking border uses 180ms ease-out. Reduced-motion preferences remove transitions and animation; connection progress retains a static dashed indicator.

## Shapes

Voice panels use generous rounded corners; controls and fields share the softer control radius. Participant avatars are circular. A two-pixel speaking ring sits outside the participant avatar. Lobby avatars are 88px, room avatars 80px, reducing to 70px and 64px respectively in short viewports. Dividers and outlined fields use thin borders. Participant identity is presented directly in the room rather than inside nested cards. Chat bubbles use a small directional corner within otherwise rounded shapes.

## Components

### Buttons

The primary entry action is amber with dark ink, full width, 48px minimum height and the documented control padding. Secondary actions use the voice surface and ivory text. Fine-pointer hover lightens primary amber; icon and secondary hover use the raised layer. Controls expose an amber two-pixel focus outline offset by 4px, and pressed feedback darkens via brightness. Disabled panel buttons use reduced opacity and a waiting cursor. Standard icon actions are 44px square. Send is 48px wide by 44px high; add is 48px square; compact playback is 44px square. Page arrows are 36px square for fine pointers and 44px square for coarse pointers.

### Inputs / Fields

Chat and music fields use the surface layer, line border, control radius and 11px by 12px padding. Text remains 16px to support mobile editing. Focus uses the shared amber outline inset by 2px. Placeholder text uses the muted color without additional opacity reduction.

### Navigation

Room tabs are quiet labels on a single ruled row. Tabs have a 48px minimum height; the selected tab turns amber with a two-pixel underline. Selection is conveyed through `aria-selected`; unread counts appear as compact amber badges. Preserve the semantic tab relationship and inert hidden panels.

### Cards / Containers

The channel panel and incoming-call overlay share dark tonal surfaces and thin borders. They are functional containers rather than decorative cards. The incoming-call overlay uses the overlay radius. Queue and catalog windows clip to available height and paginate their contents rather than becoming scrolling containers.

### Voice participants and call controls

Large avatars identify participants; names truncate safely and state text sits beneath. The amber ring appears only while speaking. The bottom dock groups three equal controls with visible icon and label: microphone, audio and leaving. Buttons are transparent with 42px circular icon outlines, 11px labels and 64px minimum height (44px horizontal layout with 38px icons in short landscape). Pressed microphone/audio icons use a warm fill and amber text; leaving has a small dark red circle rather than a filled button block. The timer holds its place when tabs change.

Opening, closing and minimizing preserve keyboard access and focus behavior. The minimized dock is a semantic group of sibling buttons, never a button containing other buttons. Restore opens the active call; microphone, audio and leave act directly without first opening the panel. Dock actions use 44px targets, pressed states match the room, and focus has a two-pixel amber outline offset by 2px. The dock shows participant count, status, stable timer and chat/music notices; its symbol turns amber while speaking. Hide it from interaction and focus while the panel or host menu is open.

Chat, queue and playback controls use the same voice type and surface vocabulary. Queue/catalog previous and next arrows show a live page count, disable at bounds, and adapt to the available row count. Keep composers and call actions visible when list size or viewport changes.

GSAP 3.12.5 uses transform/opacity for panel entry/exit (260/200ms), view changes and the moving tab underline (200ms), and press feedback (100/160ms), with `power3.out`. Entry groups stagger by 30ms. Existing participants, timers and background queue-size refreshes stay still. Reduced motion uses a 120ms fade without translation; keyboard navigation is immediate. New renders cancel owned tweens, and missing GSAP keeps CSS and all controls functional.

## Do's and Don'ts

### Do

- Do use the voice-prefixed tokens for Afterglow’s channel, minimized dock and incoming-call overlay.
- Do keep recognizable circular avatars, a stable timer and persistent bottom call controls in the voice room.
- Do retain visible focus, semantic selected and pressed states, readable inputs and safe-area spacing.
- Do preserve reduced-motion behavior and real presence/status information.
- Do keep primary actions and composers in view; paginate queue/catalog content and bound transcript scrolling.

### Don't

- Don't apply the olive voice palette as a global 28E rebrand.
- Don't replace the host’s Inter/Merriweather and amber/tulip commitments with the voice variant’s narrower vocabulary.
- Don't add nested participant cards or a permanent speaking ring.
- Don't invent a global spacing, typography or color scale from these scoped observations.
- Don't restore call-history controls or recording to Afterglow.
- Don't make the minimized dock a single nested-button target or require opening it to mute or leave.

Afterglow is the voice, chat and shared-music feature name. Keep it unchanged across languages; technical IDs and the principal room name stay stable.
