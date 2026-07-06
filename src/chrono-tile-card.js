import { LitElement, html, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live }                  from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';
import { styleMap }              from 'https://unpkg.com/lit@2.0.0/directives/style-map.js?module';
import { unsafeHTML }            from 'https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module';
import { repeat }                from 'https://unpkg.com/lit@2.0.0/directives/repeat.js?module';

// ─── Version ──────────────────────────────────────────────────────────────────
const CARD_VERSION = '1.0.8';

// ─── MDI icon paths ───────────────────────────────────────────────────────────
const mdiDragHorizontalVariant = 'M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z';

// ─── Version History ──────────────────────────────────────────────────────────
// v1.0.8: Default font_family changed from DSEG14 Modern to DSEG7 Classic.
//         Stub item's font_size changed from 15 to 12, since DSEG7 Classic
//         renders larger per-em than the previous default — 12 matches the
//         visual size the other fonts render at 15.
// v1.0.7: Add the console.info version banner every other chrono-family card
//         logs on load — chrono-tile-card had none, a gap left over from the
//         initial build (the section header was seen in an early pass but
//         its content was never actually copied). Same styled-badge format
//         as chrono-slideshow-card's, substituting TILE for SLIDESHOW.
// v1.0.6: Fix (root cause, not v1.0.5's rejected rAF-retry workaround): the
//         ResizeObserver setup in connectedCallback() looked up ha-card via
//         this.shadowRoot.querySelector('ha-card') — but super.connectedCallback()
//         only schedules Lit's first render, it does not run it synchronously,
//         so ha-card is provably absent from the shadow DOM at that point on
//         every instantiation. The "if (cardEl) ... else observe(this)"
//         branch added in v1.0.3 was dead code — the else branch (observing
//         the host) always ran. This masked itself on the dashboard, where
//         the host's own height happens to equal ha-card's; in the editor
//         dialog the host is a distinct element that resolves to a real,
//         directly-measured zero height while ha-card still gets a real
//         height from its own aspect-ratio rule. Fixed by moving the
//         ResizeObserver creation and .observe() call out of
//         connectedCallback() entirely and into firstUpdated() — a Lit
//         lifecycle method guaranteed to run only after the first render has
//         patched the shadow DOM, so ha-card is certain to exist and no
//         fallback branch is needed.
// v1.0.4: No functional changes - version bump for download.
// v1.0.3: Fix: --scale-factor never set in the editor preview, causing items
//         to render at full em size against REFERENCE_HEIGHT_PX=400 while the
//         actual preview box was only ~300px tall — clipping the digits.
//         Confirmed via console: host element has height 0 at connectedCallback
//         time in the editor (the dialog hasn't laid out yet), so
//         ResizeObserver.observe(this) never fired a non-zero callback due to
//         the existing `if (!height) return` guard. Fixed by observing the
//         ha-card element (which has the correct rendered height) instead of
//         the host element (which collapses to zero in the editor). The guard
//         remains correct — a zero ha-card height is still a degenerate case
//         to skip.
// v1.0.2: Fix: the editor-preview aspect-ratio (16/10) was silently ignored —
//         confirmed via console inspection that isInsideEditDialog() and the
//         --editor-preview-aspect-ratio variable were both working correctly,
//         but ha-card's own hardcoded height:100% left aspect-ratio with no
//         free dimension to compute from (per CSS spec, aspect-ratio only
//         fills a dimension that is otherwise auto). Fixed by making height
//         itself a variable (--editor-preview-height), set to 'auto' inside
//         the edit dialog and '100%' otherwise, alongside the existing
//         aspect-ratio variable. Same latent conflict exists in
//         chrono-slideshow-card.js's identical CSS block — pre-existing
//         there too, not introduced by this port, not touched here.
// v1.0.1: New per-item font_family field (combo-box, FONT_OPTIONS list) with
//         out-of-the-box loading: both Google Fonts and the DSEG segmented
//         fonts are served identically via Fontsource's jsDelivr CDN
//         (https://cdn.jsdelivr.net/npm/@fontsource/<slug>/400.css),
//         stylesheet injected into document.head on first use, deduplicated
//         via a module-level Set — no bundling, no manual setup. Default
//         font_family is 'DSEG14 Modern' (not DSEG7 — this card also
//         displays entity/text tiles, not just clock digits, and DSEG14's
//         alphanumeric segments render sensibly for both). Card-level
//         template variables reinstated from chrono-slideshow-card (every
//         DEFAULT_CONFIG scalar key as {{ cardSnakeKeyInCamelCase }}, plus
//         computed {{ cardDimmerOpacity }}) via a new substituteCardVariables()
//         — a direct copy of slideshow's substitutePhotoVariables() with
//         photo fields replaced by card fields; no exif/photo data exists
//         here to expose. _setupSubscriptions() now runs on every hass
//         update rather than gated to first-time-only, so a card field's
//         substituted value (cardDimmerOpacity chief among them) actually
//         refreshes as the underlying value changes — the existing per-item
//         diff (unchanged substituted string = no-op) is what keeps this
//         cheap, exactly as it already does in chrono-slideshow-card. New UI
//         color picker for letterbox_color in the Card configuration panel
//         (previously YAML-only). getStubConfig()'s starter item's field
//         values updated per user-specified defaults.
// v1.0.0: Initial release. Sibling of chrono-slideshow-card, built from the
//         same 9-zone item-overlay system (entity items and Jinja-template
//         items, per-item styling, drag-reorder editor) and the same ambient
//         lux dimmer feature, with the entire photo/slideshow engine removed.
//         No chrono_folder sensor dependency — items are the only content.
//         Background is a single flat color (letterbox_color). All 7 gesture
//         hooks (tap_action, hold_action, double_tap_action, swipe_up_action,
//         swipe_down_action, swipe_left_action, swipe_right_action) are
//         generic YAML-only pass-throughs with no hardcoded behavior — unlike
//         slideshow, plain tap is not hardcoded to pause/resume and horizontal
//         swipe is not hardcoded to manual photo navigation, since neither
//         concept applies here. zone_modes (static/dynamic) is dropped
//         entirely — that distinction only existed to synchronize overlay
//         zones with a photo transition, which does not exist in this card;
//         only zone_alignment remains. The per-item YAML-extras mechanism
//         (serializeExtrasToYaml/parseYamlExtras/_itemYamlChanged) is not
//         carried over — verified dead code in the source (computed/defined
//         but never wired to any rendered control). UI_CARD_KEYS and
//         UI_ITEM_KEYS are also not carried over for the same reason —
//         verified unused outside the dropped YAML-extras mechanism. Shared
//         editor field components are carried over renamed with a 'ct' tag
//         prefix (chrono-ct-*) instead of chrono-slideshow's 'cs' prefix, so
//         both cards' custom elements can coexist on the same dashboard page
//         without colliding. Deliberate deviation from the slideshow source:
//         _hassShouldRender now also watches dimmer_entity's state — in the
//         source this entity is not in the watched-ids set, which is only
//         safe there because the slideshow's own advance timer keeps
//         re-rendering regardless; this card has no such timer, so without
//         watching dimmer_entity directly the ambient dimmer would not
//         update live.

// ─── Console log ──────────────────────────────────────────────────────────────
console.info(
  `%c CHRONO-%cTILE%c-CARD %c v${CARD_VERSION} `,
  'background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 0 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #101010; color: #4676d3; font-weight: bold; padding: 2px 0;',
  'background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 4px 2px 0;',
  'background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_ITEM = {
  _id:              '',
  show:             true,
  horizontal:       'center',
  vertical:         'middle',
  icon:             '',
  show_state:       false,
  font_color:       '',
  font_family:      'DSEG7 Classic',
  font_size:        1.2,
  font_weight:      600,
  line_height:      1.2,
  border_radius:    50,
  background_color: '',
  padding_top:      10,
  padding_bottom:   10,
  padding_left:     10,
  padding_right:    10,
  text_shadow_color:        '',
  text_shadow_blur:         0,
  text_shadow_offset_x:     0,
  text_shadow_offset_y:     0,
  text_shadow_stroke_width: 0,
  text_shadow_layers:       2, // YAML-only, no dedicated UI field — edit manually to change
};

const DEFAULT_ENTITY_ITEM   = { ...DEFAULT_ITEM, entity:   '' };
const DEFAULT_TEMPLATE_ITEM = { ...DEFAULT_ITEM, template: '' };

// Internal alignment of items stacked within a zone, independent from which
// screen position (column) the zone itself occupies. Defaults to matching
// the zone's own column — left zones default to left, etc.
const DEFAULT_ZONE_ALIGNMENT = {
  'top-left':      'left',
  'top-center':    'center',
  'top-right':     'right',
  'middle-left':   'left',
  'middle-center': 'center',
  'middle-right':  'right',
  'bottom-left':   'left',
  'bottom-center': 'center',
  'bottom-right':  'right',
};

// Reference card height (px) at which a font_size value renders at its
// literal em size (scale factor 1). This is the fixed height the HA card
// editor uses when no real dashboard parent constrains the preview. Any
// other rendered height (dashboard or otherwise) scales proportionally from
// this baseline via ResizeObserver — see the card's connectedCallback.
const REFERENCE_HEIGHT_PX = 400;

// Aspect ratio (CSS <ratio> syntax, e.g. '16 / 10') applied to ha-card, but
// ONLY when the card is rendered inside the HA edit-card dialog's preview —
// never on the real dashboard.
const EDITOR_PREVIEW_ASPECT_RATIO = '16 / 10';

// Walks up through the DOM — crossing shadow-DOM boundaries via
// getRootNode().host when parentElement runs out — checking whether el is
// nested inside the actual <ha-dialog> element HA uses for the per-card edit
// dialog.
function isInsideEditDialog(el) {
  let node = el;
  while (node) {
    if (node.tagName === 'HA-DIALOG') return true;
    node = node.parentElement || node.getRootNode()?.host;
  }
  return false;
}

// Gesture recognition on the card body. HOLD_MS matches HA's own long-press
// convention; DOUBLE_TAP_MS is the window a second tap must land within to
// count as a double-tap instead of two separate single taps.
const HOLD_MS         = 500;
const DOUBLE_TAP_MS   = 250;
const SWIPE_THRESHOLD = 40; // px

const DEFAULT_CONFIG = {
  // Flat background color for the entire card — no photo/slideshow engine
  // exists here, so this is the only background there is.
  letterbox_color: '#000000',
  // Dimmer: a full-coverage overlay whose opacity is derived from an ambient
  // lux sensor, compensating for tablet brightness limits. dimmer_color is
  // YAML-only. All opacity values are plain percentage numbers (0–100).
  // dimmer_aggressiveness is stored as 1–100 (UI slider percentage), converted
  // internally via 10^((pct-50)/50) giving a 0.1–10 range where 50 = 1
  // (pure human-eye perceptual curve, cube-root baseline).
  dimmer_enabled:         false,
  dimmer_entity:          '',
  dimmer_lux_min:         0,
  dimmer_lux_max:         40,
  dimmer_min_opacity:     0,
  dimmer_max_opacity:     80,
  dimmer_color:           '#000000',
  dimmer_aggressiveness:  50,
  zone_alignment:         { ...DEFAULT_ZONE_ALIGNMENT },
  items:                  [],
};

const NUMERIC_ITEM_KEYS = new Set([
  'font_size', 'font_weight', 'line_height', 'border_radius',
  'padding_top', 'padding_bottom', 'padding_left', 'padding_right',
  'text_shadow_blur', 'text_shadow_offset_x', 'text_shadow_offset_y',
  'text_shadow_stroke_width',
]);

const VERTICAL_OPTIONS = [
  { label: 'Top',    value: 'top'    },
  { label: 'Middle', value: 'middle' },
  { label: 'Bottom', value: 'bottom' },
];

const HORIZONTAL_OPTIONS = [
  { label: 'Left',   value: 'left'   },
  { label: 'Center', value: 'center' },
  { label: 'Right',  value: 'right'  },
];

const ZONE_ALIGNMENT_OPTIONS = [
  { label: 'Left',   value: 'left'   },
  { label: 'Center', value: 'center' },
  { label: 'Right',  value: 'right'  },
];

// ─── Fonts ────────────────────────────────────────────────────────────────────
// A curated list, not the full Google Fonts / Fontsource catalog (1500+ entries
// would make the dropdown unusable). Each entry's `value` is the exact
// font-family name Fontsource's CSS declares; `slug` is the Fontsource npm
// package name used to build the CDN URL. Google Fonts and the DSEG segmented
// fonts are loaded through the exact same mechanism — see ensureFontLoaded().
const FONT_OPTIONS = [
  { label: 'Theme default',      value: '',                    slug: ''                     },
  { label: 'DSEG14 Modern',      value: 'DSEG14 Modern',       slug: 'dseg14-modern'         },
  { label: 'DSEG7 Modern',       value: 'DSEG7 Modern',        slug: 'dseg7-modern'          },
  { label: 'DSEG14 Classic',     value: 'DSEG14 Classic',      slug: 'dseg14-classic'        },
  { label: 'DSEG7 Classic',      value: 'DSEG7 Classic',       slug: 'dseg7-classic'         },
  { label: 'DSEG14 Modern Mini', value: 'DSEG14 Modern Mini',  slug: 'dseg14-modern-mini'    },
  { label: 'DSEG7 Modern Mini',  value: 'DSEG7 Modern Mini',   slug: 'dseg7-modern-mini'     },
  { label: 'Roboto',             value: 'Roboto',              slug: 'roboto'                },
  { label: 'Open Sans',          value: 'Open Sans',           slug: 'open-sans'             },
  { label: 'Montserrat',         value: 'Montserrat',          slug: 'montserrat'            },
  { label: 'Poppins',            value: 'Poppins',             slug: 'poppins'               },
  { label: 'Inter',              value: 'Inter',               slug: 'inter'                 },
  { label: 'Oswald',             value: 'Oswald',              slug: 'oswald'                },
  { label: 'Rajdhani',           value: 'Rajdhani',            slug: 'rajdhani'              },
  { label: 'Orbitron',           value: 'Orbitron',            slug: 'orbitron'              },
  { label: 'Share Tech Mono',    value: 'Share Tech Mono',     slug: 'share-tech-mono'       },
  { label: 'VT323',              value: 'VT323',               slug: 'vt323'                 },
  { label: 'Press Start 2P',     value: 'Press Start 2P',      slug: 'press-start-2p'        },
];

const _FONT_SLUG_BY_FAMILY = new Map(FONT_OPTIONS.filter(f => f.slug).map(f => [f.value, f.slug]));

// Stylesheets already injected into document.head, keyed by font-family name
// — module-level so it's shared across every card instance on the dashboard,
// not just this one. A font is only ever injected once per page load.
const _injectedFonts = new Set();

// Loads a font "out of the box": both Google Fonts and DSEG are served by
// Fontsource through the same CDN path (weight 400 only — sufficient for a
// dashboard tile; font_weight is applied separately via CSS regardless).
// An unrecognized font_family (hand-typed in YAML, not from FONT_OPTIONS) is
// left alone — assumed to already be available as a system or theme font.
function ensureFontLoaded(fontFamily) {
  if (!fontFamily || _injectedFonts.has(fontFamily)) return;
  const slug = _FONT_SLUG_BY_FAMILY.get(fontFamily);
  if (!slug) return;
  _injectedFonts.add(fontFamily);
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = `https://cdn.jsdelivr.net/npm/@fontsource/${slug}/400.css`;
  document.head.appendChild(link);
}

const SHOW_ITEM_POSITION_BADGES = false;

const VERTICAL_BADGE_COLORS = {
  top:    '#ac00ac',
  middle: '#c77c00',
  bottom: '#0600ff',
};

const HORIZONTAL_BADGE_COLORS = {
  left:   '#bb9e00',
  center: '#10a800',
  right:  '#00a896',
};

const GROUP_DIVIDER_COLOR = '#009ac7';

// ─── sortItems (overlay items, by zone) ────────────────────────────────────────
const _GROUP_DEFS = [
  { vertical: 'top',    horizontal: 'left',   label: 'Top · Left'      },
  { vertical: 'top',    horizontal: 'center', label: 'Top · Center'    },
  { vertical: 'top',    horizontal: 'right',  label: 'Top · Right'     },
  { vertical: 'middle', horizontal: 'left',   label: 'Middle · Left'   },
  { vertical: 'middle', horizontal: 'center', label: 'Middle · Center' },
  { vertical: 'middle', horizontal: 'right',  label: 'Middle · Right'  },
  { vertical: 'bottom', horizontal: 'left',   label: 'Bottom · Left'   },
  { vertical: 'bottom', horizontal: 'center', label: 'Bottom · Center' },
  { vertical: 'bottom', horizontal: 'right',  label: 'Bottom · Right'  },
];

const _GROUP_ORDER = _GROUP_DEFS.map(g => `${g.vertical}-${g.horizontal}`);

function sortItems(items) {
  const key = item => `${item.vertical ?? 'middle'}-${item.horizontal ?? 'center'}`;
  return [...items].sort((a, b) => _GROUP_ORDER.indexOf(key(a)) - _GROUP_ORDER.indexOf(key(b)));
}

// ─── generateId ───────────────────────────────────────────────────────────────
function generateId(existingItems = []) {
  const existing = new Set(existingItems.map(i => i._id));
  let id;
  do { id = Math.random().toString(16).slice(2, 10); } while (existing.has(id));
  return id;
}

// ─── migrateConfig ────────────────────────────────────────────────────────────
// Backfill a stable _id on any item missing one, and backfill zone_alignment
// with any zone keys missing from an older config. Returns the (possibly new)
// config and whether anything changed.
function migrateConfig(config) {
  let migrated = false;

  if (config.items?.some(i => !i._id)) {
    const withIds = [];
    for (const i of config.items) withIds.push(i._id ? i : { ...i, _id: generateId(config.items.concat(withIds)) });
    config   = { ...config, items: withIds };
    migrated = true;
  }

  const zoneAlignment = config.zone_alignment ?? {};
  const missingAlignmentKey = Object.keys(DEFAULT_ZONE_ALIGNMENT).some(k => !(k in zoneAlignment));
  if (missingAlignmentKey) {
    config   = { ...config, zone_alignment: { ...DEFAULT_ZONE_ALIGNMENT, ...zoneAlignment } };
    migrated = true;
  }

  return { config, migrated };
}

// ─── Home Assistant action compatibility ────────────────────────────────────────
// An externally-loaded card cannot import HA's internal handleAction/fireEvent.
// These are faithful copies of Home Assistant's own implementations so the card
// forwards actions to HA exactly as a built-in card does — including
// fire-dom-event, which HA dispatches as the "ll-custom" event that browser_mod
// and other add-ons listen for. The card adds no allowlist of its own: any action
// HA understands works, and fire-dom-event is HA's extension point for actions
// provided by third-party add-ons.

function fireEvent(node, type, detail = {}, options = {}) {
  const event = new Event(type, {
    bubbles:    options.bubbles    ?? true,
    cancelable: Boolean(options.cancelable),
    composed:   options.composed   ?? true,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
}

function navigate(path, options = {}) {
  if (options.replace) {
    history.replaceState(null, '', path);
  } else {
    history.pushState(null, '', path);
  }
  fireEvent(window, 'location-changed', { replace: options.replace ?? false });
}

function toggleEntity(hass, entityId) {
  if (!entityId) return;
  hass.callService('homeassistant', 'toggle', { entity_id: entityId });
}

// Faithful copy of HA's handleAction, extended with swipe_left/swipe_right
// (chrono-tile-card has no hardcoded horizontal-swipe behavior to route
// around, unlike chrono-slideshow-card's manual photo navigation). Selects
// the action config for the given interaction and routes it. Unknown
// actions do nothing — matching HA, not filtering. assist and action
// confirmation are intentionally not handled: both need internal HA dialogs
// that an externally-loaded card cannot open.
function handleAction(node, hass, config, action) {
  let actionConfig;
  if (action === 'double_tap' && config.double_tap_action) {
    actionConfig = config.double_tap_action;
  } else if (action === 'hold' && config.hold_action) {
    actionConfig = config.hold_action;
  } else if (action === 'tap' && config.tap_action) {
    actionConfig = config.tap_action;
  } else if (action === 'swipe_up' && config.swipe_up_action) {
    actionConfig = config.swipe_up_action;
  } else if (action === 'swipe_down' && config.swipe_down_action) {
    actionConfig = config.swipe_down_action;
  } else if (action === 'swipe_left' && config.swipe_left_action) {
    actionConfig = config.swipe_left_action;
  } else if (action === 'swipe_right' && config.swipe_right_action) {
    actionConfig = config.swipe_right_action;
  }
  if (!actionConfig) actionConfig = { action: 'none' };

  switch (actionConfig.action) {
    case 'none':
      break;
    case 'more-info':
      fireEvent(node, 'hass-more-info', { entityId: actionConfig.entity ?? config.entity });
      break;
    case 'navigate':
      if (actionConfig.navigation_path) {
        navigate(actionConfig.navigation_path, { replace: actionConfig.navigation_replace });
      }
      break;
    case 'url':
      if (actionConfig.url_path) window.open(actionConfig.url_path, '_blank');
      break;
    case 'toggle':
      toggleEntity(hass, config.entity);
      break;
    case 'perform-action':
    case 'call-service': {
      const serviceName = actionConfig.perform_action ?? actionConfig.service;
      if (!serviceName) break;
      const [domain, service] = serviceName.split('.', 2);
      if (!domain || !service) break;
      hass.callService(domain, service, actionConfig.data ?? actionConfig.service_data, actionConfig.target);
      break;
    }
    case 'fire-dom-event':
      fireEvent(node, 'll-custom', actionConfig);
      break;
    default:
      // Unknown action: do nothing, exactly as HA does.
      break;
  }
}

// ─── substituteCardVariables ────────────────────────────────────────────────────
// Direct adaptation of chrono-slideshow-card's substitutePhotoVariables(), with
// photo fields replaced by card fields — no exif/photo data exists in this
// card. Resolves any {{ }} expression's bare identifier tokens against
// cardData BEFORE handing the template to HA's render_template. Any token
// that is an exact, word-boundary-matched key in cardData is replaced with a
// Jinja2 literal (quoted string, or bare number/boolean for values that look
// numeric/boolean) — filters, operators, and any other identifier (e.g. a
// states() call) are left untouched for HA's own Jinja2 engine. If, after
// substitution, no {{ are left, the caller skips the websocket entirely.
const _TEMPLATE_EXPR_RE = /\{\{(.*?)\}\}/gs;
const _IDENTIFIER_RE    = /[A-Za-z_][A-Za-z0-9_]*/g;

function _jinjaLiteral(value) {
  if (value === null || value === undefined) return "''";
  const s = String(value);
  if (s === '')                       return "''";
  if (/^-?\d+(\.\d+)?$/.test(s))      return s;                 // bare int/float
  if (s === 'true' || s === 'false')  return s;                 // bare boolean
  // Quote as a Jinja2 string literal; escape embedded single quotes.
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function substituteCardVariables(template, cardData) {
  const tmpl = String(template ?? '');
  if (!tmpl.includes('{{') || !cardData) {
    return { text: tmpl, fullyLiteral: !tmpl.includes('{{') };
  }

  let fullyLiteral = true;

  // First pass: determine, per block, whether it is a pure bare-identifier
  // card-field reference (no filters/operators/other text inside the braces).
  // If every block in the template qualifies, the second pass below renders
  // plain text directly (raw value, no quoting) instead of Jinja2 syntax.
  const blocks = [];
  tmpl.replace(_TEMPLATE_EXPR_RE, (whole, inner) => {
    const trimmed = inner.trim();
    const isBareIdentifier = /^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed);
    const isCardField      = isBareIdentifier && Object.prototype.hasOwnProperty.call(cardData, trimmed);
    if (!isCardField) fullyLiteral = false;
    blocks.push({ inner, isCardField, field: isCardField ? trimmed : null });
    return whole;
  });

  let blockIndex = 0;
  if (fullyLiteral) {
    // Every block is a bare card-field reference — render plain text, no
    // Jinja2 involvement, no surrounding braces or quoting.
    const text = tmpl.replace(_TEMPLATE_EXPR_RE, () => {
      const { field } = blocks[blockIndex++];
      const value = cardData[field];
      return value === null || value === undefined ? '' : String(value);
    });
    return { text, fullyLiteral: true };
  }

  // Mixed or non-card template: substitute only the bare card-field blocks
  // with Jinja2 literals, leave everything else (filters, states() calls,
  // expressions) untouched for HA's render_template to evaluate.
  const text = tmpl.replace(_TEMPLATE_EXPR_RE, (whole, inner) => {
    const replaced = inner.replace(_IDENTIFIER_RE, (token) => {
      if (Object.prototype.hasOwnProperty.call(cardData, token)) {
        return _jinjaLiteral(cardData[token]);
      }
      return token; // not a card field — leave for HA (states(), filters, etc.)
    });
    return `{{${replaced}}}`;
  });

  return { text, fullyLiteral: false };
}

// ─── ctParseNumber ────────────────────────────────────────────────────────────
function ctParseNumber(raw) {
  const v = String(raw).replace(',', '.');
  if (v === '-' || v === '-0' || v.endsWith('.')) return null;
  if (v === '')                                    return '';
  const n = parseFloat(v);
  if (isNaN(n)) return null;
  // Defer commit while the typed text has not yet reached its canonical
  // numeric form (e.g. "1.0", "1.05" mid-typing), so the live() binding does
  // not overwrite in-progress decimal entry.
  if (String(n) !== v) return null;
  return n;
}

// ─── Editor helper functions ──────────────────────────────────────────────────

function ctTextField(label, value, onChange, opts = {}) {
  return html`
    <div class="text-field">
      <label>${unsafeHTML(label)}</label>
      <chrono-ct-textfield
        .value=${String(value ?? '')}
        type=${opts.type ?? 'text'}
        step=${opts.step ?? ''}
        min=${opts.min ?? ''}
        max=${opts.max ?? ''}
        @input=${onChange}
      ></chrono-ct-textfield>
    </div>
  `;
}

function ctToggleField(label, checked, onChange, extraClass = '', addSpacer = false) {
  return html`
    <div class="toggle-field ${extraClass}">
      ${addSpacer ? html`<label class="toggle-field-spacer" aria-hidden="true">&nbsp;</label>` : ''}
      <div class="toggle-field-row">
        <label>${unsafeHTML(label)}</label>
        <ha-switch .checked=${checked} @change=${onChange}></ha-switch>
      </div>
    </div>
  `;
}

function toSwatchHex(value) {
  const v = String(value ?? '').trim();
  if (/^#[0-9a-fA-F]{3}$/.test(v) || /^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{8}$/.test(v)) return v.slice(0, 7); // drop alpha; color input has none
  return '#000000';                                       // named/rgb()/empty → neutral
}

function ctColorPicker(label, value, onChange) {
  const swatchValue = toSwatchHex(value);
  return html`
    <div class="text-field">
      <label>${unsafeHTML(label)}</label>
      <div class="color-picker-row">
        <input type="color" .value=${swatchValue} @input=${onChange}>
        <chrono-ct-textfield
          .value=${String(value ?? '')}
          @input=${onChange}
        ></chrono-ct-textfield>
      </div>
    </div>
  `;
}

function ctSelectField(label, value, options, onChange) {
  return html`
    <div class="text-field">
      ${label ? html`<label>${unsafeHTML(label)}</label>` : ''}
      <chrono-ct-select
        .value=${value ?? ''}
        .options=${options}
        @change=${onChange}
      ></chrono-ct-select>
    </div>
  `;
}

// ─── ctButtonPicker ───────────────────────────────────────────────────────────
function ctButtonPicker(label, value, options, onChange, align = '', extraClass = '') {
  return html`
    <div class="button-picker-field ${extraClass}" style=${align === 'end' ? 'justify-self:end' : ''}>
      <label>${unsafeHTML(label)}</label>
      <chrono-ct-button-toggle-group
        .value=${value}
        .options=${options}
        @change=${onChange}
      ></chrono-ct-button-toggle-group>
    </div>
  `;
}

// ─── CtTextfield component ────────────────────────────────────────────────────
class CtTextfield extends LitElement {
  static properties = {
    value:       { type: String },
    type:        { type: String },
    step:        { type: String },
    min:         { type: String },
    max:         { type: String },
    placeholder: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    input {
      display: block;
      width: 100%;
      box-sizing: border-box;
      height: 56px;
      padding: 0 12px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      outline: none;
      transition: border-bottom-color 0.2s;
    }
    input:focus {
      border-bottom: 2px solid var(--primary-color);
    }
  `;

  focus() {
    this.shadowRoot?.querySelector('input')?.focus();
  }

  render() {
    return html`
      <input
        .value=${live(this.value ?? '')}
        type=${this.type ?? 'text'}
        step=${this.step ?? ''}
        min=${this.min ?? ''}
        max=${this.max ?? ''}
        placeholder=${this.placeholder ?? ''}
        @input=${e => {
          this.value = e.target.value;
          this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        }}
      >
    `;
  }
}
customElements.define('chrono-ct-textfield', CtTextfield);

// ─── CtTextarea component ─────────────────────────────────────────────────────
class CtTextarea extends LitElement {
  static properties = {
    value:       { type: String },
    placeholder: { type: String },
    error:       { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    textarea {
      display: block;
      width: 100%;
      box-sizing: border-box;
      min-height: calc(3 * 1.5em + 24px);
      max-height: calc(20 * 1.5em + 24px);
      padding: 12px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      color: var(--primary-text-color);
      font-size: 13px;
      font-family: monospace;
      outline: none;
      overflow-y: auto;
      resize: vertical;
      white-space: pre-wrap;
      word-wrap: break-word;
      transition: border-bottom-color 0.2s;
    }
    textarea:focus {
      border-bottom: 2px solid var(--primary-color);
    }
    textarea.error {
      border-bottom: 2px solid var(--error-color, #f44336);
    }
  `;

  focus() {
    this.shadowRoot?.querySelector('textarea')?.focus();
  }

  render() {
    return html`
      <textarea
        class="${this.error ? 'error' : ''}"
        .value=${live(this.value ?? '')}
        placeholder=${this.placeholder ?? ''}
        @input=${e => {
          this.value = e.target.value;
          this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        }}
      ></textarea>
    `;
  }
}
customElements.define('chrono-ct-textarea', CtTextarea);

// ─── CtButtonToggleGroup component ───────────────────────────────────────────
class CtButtonToggleGroup extends LitElement {
  static properties = {
    value:   { type: String },
    options: { type: Array  },
  };

  static styles = css`
    :host {
      display: inline-flex;
    }
    button {
      min-width: 70px;
      height: 32px;
      margin-top: 6px;
      margin-bottom: 6px;
      padding: 0 12px;
      border: none;
      border-left: 1px solid var(--ha-color-border-neutral-quiet, #444);
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      color: var(--primary-text-color);
      background: var(--ha-color-fill-primary-normal-resting, #002e3e);
      transition: background 0.15s;
    }
    button:first-child {
      border-left: none;
      border-radius: 9999px 0 0 9999px;
    }
    button:last-child {
      border-radius: 0 9999px 9999px 0;
    }
    button.only {
      border-radius: 9999px;
    }
    button.active {
      background: var(--ha-color-fill-primary-loud-resting, #009ac7);
    }
    button:not(.active):hover {
      background: var(--ha-color-fill-primary-quiet-hover, #004156);
    }
  `;

  render() {
    const opts = this.options ?? [];
    return html`${opts.map((opt, i) => {
      const isOnly   = opts.length === 1;
      const isFirst  = i === 0;
      const isLast   = i === opts.length - 1;
      const isActive = opt.value === this.value;
      const cls      = [
        isActive ? 'active' : '',
        isOnly ? 'only' : (isFirst ? 'first' : (isLast ? 'last' : '')),
      ].filter(Boolean).join(' ');
      return html`
        <button class="${cls}" @click=${() => this._select(opt.value)}>${opt.label}</button>
      `;
    })}`;
  }

  _select(value) {
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true, composed: true }));
  }

  focus() {
    this.shadowRoot?.querySelector('button')?.focus();
  }
}
customElements.define('chrono-ct-button-toggle-group', CtButtonToggleGroup);

// ─── CtSelect component ───────────────────────────────────────────────────────
class CtSelect extends LitElement {
  static properties = {
    value:   { type: String },
    options: { type: Array  },
    _open:   { state: true  },
    _cursor: { state: true  },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      position: relative;
    }
    .combobox {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      height: 56px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      transition: border-bottom-color 0.2s;
    }
    .combobox:focus-within,
    .combobox-open {
      border-bottom: 2px solid var(--primary-color);
    }
    .combobox-input {
      flex: 1;
      height: 100%;
      padding: 0 8px 0 12px;
      background: transparent;
      border: none;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      outline: none;
      min-width: 0;
      box-sizing: border-box;
    }
    .combobox-chevron {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 100%;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 12px;
      flex-shrink: 0;
      user-select: none;
    }
    .combobox-chevron:hover {
      color: var(--primary-text-color);
    }
    .combobox-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 9999;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, #444);
      border-radius: 0 0 4px 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      max-height: 240px;
      overflow-y: auto;
      margin-top: 1px;
    }
    .combobox-option {
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--primary-text-color);
      cursor: pointer;
      transition: background 0.1s;
    }
    .combobox-option:hover {
      background: var(--secondary-background-color, rgba(255,255,255,0.08));
    }
    .combobox-option-selected {
      color: var(--primary-color);
    }
    .combobox-option-cursor {
      background: var(--secondary-background-color, rgba(255,255,255,0.08));
    }
  `;

  constructor() {
    super();
    this.value            = '';
    this.options          = [];
    this._open            = false;
    this._cursor          = -1;
    this._onOutsideClick  = this._onOutsideClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutsideClick);
  }

  _onOutsideClick(e) {
    if (!this.shadowRoot.contains(e.composedPath()[0]) && e.composedPath()[0] !== this) {
      this._open   = false;
      this._cursor = -1;
    }
  }

  _select(value) {
    this.value   = value;
    this._open   = false;
    this._cursor = -1;
    this.dispatchEvent(new CustomEvent('change', {
      detail:   { value },
      bubbles:  true,
      composed: true,
    }));
  }

  _handleKeyDown(e) {
    const opts = this.options ?? [];
    if (!this._open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this._open   = true;
        this._cursor = 0;
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      this._cursor = Math.min(this._cursor + 1, opts.length - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      this._cursor = Math.max(this._cursor - 1, 0);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (this._cursor >= 0 && this._cursor < opts.length) this._select(opts[this._cursor].value);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this._open   = false;
      this._cursor = -1;
      e.preventDefault();
    }
  }

  render() {
    const opts = this.options ?? [];
    return html`
      <div class="combobox ${this._open ? 'combobox-open' : ''}">
        <input
          class="combobox-input"
          .value=${live(this.value ?? '')}
          @input=${e => {
            this.dispatchEvent(new CustomEvent('change', {
              detail:   { value: e.target.value },
              bubbles:  true,
              composed: true,
            }));
          }}
          @blur=${() => { this._open = false; this._cursor = -1; }}
          @keydown=${this._handleKeyDown}
        >
        <div
          class="combobox-chevron"
          @click=${() => {
            this._open = !this._open;
            this._cursor = -1;
            this.shadowRoot.querySelector('.combobox-input').focus();
          }}
          aria-hidden="true"
        >${this._open ? '▴' : '▾'}</div>
      </div>
      ${this._open ? html`
        <div class="combobox-dropdown">
          ${opts.map((opt, i) => html`
            <div
              class="combobox-option
                     ${opt.value === this.value ? 'combobox-option-selected' : ''}
                     ${i === this._cursor       ? 'combobox-option-cursor'   : ''}"
              @mousedown=${(e) => { e.preventDefault(); this._select(opt.value); }}
            >${opt.label}</div>
          `)}
        </div>
      ` : ''}
    `;
  }

  focus() {
    this.shadowRoot?.querySelector('.combobox-input')?.focus();
  }
}
customElements.define('chrono-ct-select', CtSelect);

// ─── Editor ───────────────────────────────────────────────────────────────────
class ChronoTileCardEditor extends LitElement {
  static properties = {
    hass:            { attribute: false },
    _config:         { state: true },
    _expandedItemId: { state: true },
    _removedItem:    { state: true },
  };

  setConfig(config) {
    const { config: migratedConfig, migrated } = migrateConfig(config);
    this._config = migratedConfig;
    if (migrated) this._fireConfig();
  }

  // ── Fire config-changed ───────────────────────────────────────────────────
  _fireConfig() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail:   { config: this._config },
      bubbles:  true,
      composed: true,
    }));
  }

  // ── Card-level value changed ──────────────────────────────────────────────
  _valueChanged(key, e) {
    if (!this._config) return;
    this._clearUndo();
    const value  = e.target.value ?? e.detail?.value;
    this._config = { ...this._config, [key]: value };
    this._fireConfig();
  }

  // ── Card-level numeric value changed ──────────────────────────────────────
  _numericValueChanged(key, e) {
    if (!this._config) return;
    this._clearUndo();
    const raw    = e.target.value ?? e.detail?.value;
    const parsed = ctParseNumber(raw);
    if (parsed === null) return;
    this._config = { ...this._config, [key]: parsed };
    this._fireConfig();
  }

  // ── Card-level toggle changed ─────────────────────────────────────────────
  _toggleChanged(key, e) {
    if (!this._config) return;
    this._clearUndo();
    const value  = e.target.checked;
    this._config = { ...this._config, [key]: value };
    this._fireConfig();
  }

  // ── Zone internal alignment (left/center/right) changed ──────────────────
  _zoneAlignmentChanged(zoneKey, e) {
    if (!this._config) return;
    this._clearUndo();
    const value          = e.target.value ?? e.detail?.value;
    const zone_alignment = { ...(this._config.zone_alignment ?? DEFAULT_ZONE_ALIGNMENT), [zoneKey]: value };
    this._config          = { ...this._config, zone_alignment };
    this._fireConfig();
  }

  // ── Item-level UI field changed ───────────────────────────────────────────
  _itemChanged(index, key, e) {
    if (!this._config) return;
    this._clearUndo();
    const raw = e.target.value ?? e.detail?.value;
    let value;
    if (NUMERIC_ITEM_KEYS.has(key)) {
      const parsed = ctParseNumber(raw);
      if (parsed === null) return;
      value = parsed;
    } else {
      value = raw;
    }
    let items    = [...(this._config.items ?? [])];
    items[index] = { ...items[index], [key]: value };
    if (key === 'horizontal' || key === 'vertical') items = sortItems(items);
    this._config = { ...this._config, items };
    this._fireConfig();
  }

  _itemToggled(index, key, e) {
    if (!this._config) return;
    this._clearUndo();
    const value      = e.target.checked;
    const items      = [...(this._config.items ?? [])];
    items[index]     = { ...items[index], [key]: value };
    this._config     = { ...this._config, items };
    this._fireConfig();
  }

  // ── Add / remove / reorder items ──────────────────────────────────────────
  _addItem(type) {
    const existing = this._config.items ?? [];
    let defaultValue = '';
    if (type === 'entity') {
      const states = this.hass?.states ?? {};
      const light  = Object.keys(states).find(id => id.startsWith('light.'));
      defaultValue = light ?? Object.keys(states)[0] ?? '';
    } else {
      defaultValue = "{{ now().strftime('%H:%M') }}";
    }
    const base = type === 'entity'
      ? { ...DEFAULT_ENTITY_ITEM,   _id: generateId(existing), entity:   defaultValue }
      : { ...DEFAULT_TEMPLATE_ITEM, _id: generateId(existing), template: defaultValue };
    const items  = sortItems([...existing, base]);
    this._expandedItemId = base._id;
    this._removedItem    = null;
    this._config = { ...this._config, items };
    this._fireConfig();

    // Focus the new item's field only once its panel has rendered its content.
    this.updateComplete.then(async () => {
      const panel = this.shadowRoot?.querySelector(`[data-item-id="${base._id}"]`);
      if (!panel) return;
      await panel.updateComplete;
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      panel.querySelector('chrono-ct-textfield')?.focus();
    });
  }

  _removeItem(index) {
    const items = [...(this._config.items ?? [])];
    this._removedItem = { item: items[index], index };
    this._config = { ...this._config, items: items.filter((_, i) => i !== index) };
    this._fireConfig();
  }

  _undoRemove() {
    if (!this._removedItem) return;
    const { item, index } = this._removedItem;
    const items = [...(this._config.items ?? [])];
    items.splice(index, 0, item);
    this._removedItem = null;
    this._config = { ...this._config, items };
    this._fireConfig();
  }

  _clearUndo() {
    if (this._removedItem) this._removedItem = null;
  }

  // Build the editor's visible list: every group's divider followed by that
  // group's items in array order. All 9 dividers always present. Each item row
  // carries its index within _config.items (the edit handlers address it).
  // If an item was just removed, an undo row appears at its original position.
  _buildRows(items) {
    const rows = [];
    let itemCount = 0;
    for (const g of _GROUP_DEFS) {
      rows.push({ type: 'divider', group: g, key: `divider-${g.vertical}-${g.horizontal}` });
      items.forEach((item, itemIndex) => {
        if ((item.vertical ?? 'middle') === g.vertical && (item.horizontal ?? 'center') === g.horizontal) {
          if (this._removedItem && itemCount === this._removedItem.index) {
            rows.push({ type: 'undo', key: 'undo-remove' });
          }
          rows.push({ type: 'item', item, itemIndex, key: item._id });
          itemCount++;
        }
      });
    }
    if (this._removedItem && itemCount === this._removedItem.index) {
      rows.push({ type: 'undo', key: 'undo-remove' });
    }
    return rows;
  }

  _itemMoved(e) {
    e.stopPropagation();
    this._clearUndo();
    const { oldIndex, newIndex } = e.detail;
    const items = [...(this._config.items ?? [])];
    const rows  = this._buildRows(items);
    if (!rows[oldIndex] || rows[oldIndex].type !== 'item') return; // dividers don't move

    rows.splice(newIndex, 0, rows.splice(oldIndex, 1)[0]);

    // Each item takes the group of the nearest divider above it. An item that
    // ends up above the first divider falls into the first group (top-left).
    let group = _GROUP_DEFS[0];
    const newItems = [];
    for (const row of rows) {
      if (row.type === 'divider') { group = row.group; continue; }
      newItems.push({ ...row.item, vertical: group.vertical, horizontal: group.horizontal });
    }
    this._config = { ...this._config, items: newItems };
    this._fireConfig();
  }

  // ── Option arrays ─────────────────────────────────────────────────────────
  _verticalOptions      = VERTICAL_OPTIONS;
  _horizontalOptions    = HORIZONTAL_OPTIONS;
  _fontFamilyOptions    = FONT_OPTIONS;
  _zoneAlignmentOptions = ZONE_ALIGNMENT_OPTIONS;

  // ─── Zones panel (internal alignment only — no transition mode here) ──────
  _renderZonesPanel() {
    const zoneAlignment = this._config?.zone_alignment ?? DEFAULT_ZONE_ALIGNMENT;
    const bands = ['top', 'middle', 'bottom'];
    return html`
      <ha-expansion-panel header="Zones configuration" outlined .expanded=${false}>
        <p class="zone-modes-hint">
          Alignment controls how multiple items stacked in the same zone align
          relative to each other — independent from which screen position the
          zone itself occupies.
        </p>
        ${bands.map(band => {
          const cols = _GROUP_DEFS.filter(g => g.vertical === band); // left, center, right in order
          return html`
            <div class="zone-band">
              <div class="zone-band-grid">
                <div class="zone-band-name">${band}</div>
                ${cols.map(g => html`<div class="zone-band-colheader">${g.horizontal[0].toUpperCase()}${g.horizontal.slice(1)}</div>`)}

                <div class="zone-band-rowlabel">Alignment</div>
                ${cols.map(g => {
                  const zoneKey = `${g.vertical}-${g.horizontal}`;
                  return ctSelectField('', zoneAlignment[zoneKey] ?? g.horizontal, this._zoneAlignmentOptions, e => this._zoneAlignmentChanged(zoneKey, e));
                })}
              </div>
            </div>
          `;
        })}
      </ha-expansion-panel>
    `;
  }

  // ─── Items panel ───────────────────────────────────────────────────────────
  _renderItemsPanel() {
    const items = this._config?.items ?? [];
    const rows  = this._buildRows(items);

    return html`
      <ha-expansion-panel header="Items configuration" outlined>

        <ha-sortable handle-selector=".handle" @item-moved=${(e) => this._itemMoved(e)}>
          <div class="items-list">
            ${repeat(rows, row => row.key, (row) => {
              if (row.type === 'divider') {
                return html`
                  <div class="group-divider">
                    <span class="group-divider-label" style="color:${GROUP_DIVIDER_COLOR}">${row.group.label}</span>
                    <div class="group-divider-line" style="background:${GROUP_DIVIDER_COLOR}"></div>
                  </div>
                `;
              }

              if (row.type === 'undo') {
                return html`
                  <div class="remove-item-row">
                    <button class="remove-item-btn" @click=${() => this._undoRemove()}>
                      Undo remove
                    </button>
                  </div>
                `;
              }

              const item       = row.item;
              const index      = row.itemIndex;
              const isEntity   = 'entity'   in item;
              const typeLabel  = isEntity ? 'Entity' : 'Template';
              const typeClass  = isEntity ? 'entity' : 'template';
              const headerText = isEntity
                ? (item.entity || `Entity ${index + 1}`)
                : (item.template
                    ? (item.template.length > 30
                        ? item.template.slice(0, 30) + '…'
                        : item.template)
                    : `Template ${index + 1}`);

              return html`
                <ha-expansion-panel
                  outlined
                  data-item-id="${item._id}"
                  .expanded=${this._expandedItemId === item._id}
                  @expanded-changed=${(e) => {
                    this._expandedItemId = e.detail.value ? item._id : null;
                  }}
                >

                  <div slot="header" class="item-header-slot">
                    <div class="item-header-content${item.show === false ? ' item-hidden' : ''}">
                      ${SHOW_ITEM_POSITION_BADGES ? html`
                        <span class="item-pos-badge" style="background:${VERTICAL_BADGE_COLORS[item.vertical ?? 'middle']}">${{ top: 'T', middle: 'M', bottom: 'B' }[item.vertical ?? 'middle']}</span>
                        <span class="item-pos-badge" style="background:${HORIZONTAL_BADGE_COLORS[item.horizontal ?? 'center']}">${{ left: 'L', center: 'C', right: 'R' }[item.horizontal ?? 'center']}</span>
                      ` : ''}
                      <span class="item-type-badge ${typeClass}">${typeLabel}</span>
                      <span>${headerText}</span>
                    </div>
                    <button
                      class="item-visibility-btn"
                      title="${item.show === false ? 'Show item' : 'Hide item'}"
                      @click=${(e) => { e.stopPropagation(); this._itemToggled(index, 'show', { target: { checked: item.show === false } }); }}
                    >
                      <ha-icon .icon=${item.show === false ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}></ha-icon>
                    </button>
                  </div>

                  <div class="handle" slot="leading-icon">
                    <ha-svg-icon .path=${mdiDragHorizontalVariant}></ha-svg-icon>
                  </div>

                  <!-- Position: vertical (top/middle/bottom) and horizontal (left/center/right) -->
                  <div class="item-position-row">
                    ${ctButtonPicker('', item.vertical ?? 'middle', this._verticalOptions, e => this._itemChanged(index, 'vertical', e))}
                    ${ctButtonPicker('', item.horizontal ?? 'center', this._horizontalOptions, e => this._itemChanged(index, 'horizontal', e))}
                  </div>

                  <!-- Entity ID or Template string -->
                  <div class="item-content-row">
                    ${isEntity
                      ? ctTextField('Entity ID', item.entity ?? '', e => this._itemChanged(index, 'entity', e))
                      : ctTextField('Template\n<i>supports Jinja2, e.g. {{ states("sensor.temp") }}</i>', item.template ?? '', e => this._itemChanged(index, 'template', e))
                    }
                  </div>

                  <!-- Entity-only: icon override -->
                  ${isEntity ? html`
                    <div class="item-content-row">
                      ${ctTextField('Icon', item.icon ?? '', e => this._itemChanged(index, 'icon', e))}
                    </div>
                  ` : ''}

                  <!-- Entity-only: show state toggle -->
                  ${isEntity ? html`
                    <div class="item-toggles-row">
                      ${ctToggleField('Show state', item.show_state ?? false, e => this._itemToggled(index, 'show_state', e))}
                    </div>
                  ` : ''}

                  <!-- Font family: combo-box, Google Fonts + DSEG, loaded on demand via Fontsource -->
                  <div class="item-content-row">
                    ${ctSelectField('Font family', item.font_family ?? '', this._fontFamilyOptions, e => this._itemChanged(index, 'font_family', e))}
                  </div>

                  <!-- Typography: font color, size, weight, line height, border radius -->
                  <div class="item-typography">
                    ${ctColorPicker('Font color', item.font_color ?? '', e => this._itemChanged(index, 'font_color', e))}
                    ${ctTextField('Font size (em)', item.font_size   ?? '', e => this._itemChanged(index, 'font_size',   e), { type: 'number', step: '0.1', min: '0' })}
                    ${ctTextField('Font weight',    item.font_weight ?? '', e => this._itemChanged(index, 'font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
                    ${ctTextField('Line height',    item.line_height ?? '', e => this._itemChanged(index, 'line_height', e), { type: 'number', step: '0.1', min: '0' })}
                    ${ctTextField('Border\nradius (px)', item.border_radius ?? '', e => this._itemChanged(index, 'border_radius', e), { type: 'number', step: '1', min: '0' })}
                  </div>

                  <!-- Background color and padding -->
                  <div class="item-bg-color-padding">
                    ${ctColorPicker('Background color', item.background_color ?? '', e => this._itemChanged(index, 'background_color', e))}
                    ${ctTextField('Padding\ntop (px)',    item.padding_top    ?? '', e => this._itemChanged(index, 'padding_top',    e), { type: 'number', step: '1', min: '0' })}
                    ${ctTextField('Padding\nbottom (px)', item.padding_bottom ?? '', e => this._itemChanged(index, 'padding_bottom', e), { type: 'number', step: '1', min: '0' })}
                    ${ctTextField('Padding\nleft (px)',   item.padding_left   ?? '', e => this._itemChanged(index, 'padding_left',   e), { type: 'number', step: '1', min: '0' })}
                    ${ctTextField('Padding\nright (px)',  item.padding_right  ?? '', e => this._itemChanged(index, 'padding_right',  e), { type: 'number', step: '1', min: '0' })}
                  </div>

                  <!-- Text shadow / stroke: color, blur, x/y offset, stroke width -->
                  <div class="item-text-shadow">
                    ${ctColorPicker('Shadow color', item.text_shadow_color ?? '', e => this._itemChanged(index, 'text_shadow_color', e))}
                    ${ctTextField('Shadow\nblur (px)',     item.text_shadow_blur         ?? '', e => this._itemChanged(index, 'text_shadow_blur',         e), { type: 'number', step: '1', min: '0' })}
                    ${ctTextField('Shadow\noffset X (px)', item.text_shadow_offset_x     ?? '', e => this._itemChanged(index, 'text_shadow_offset_x',     e), { type: 'number', step: '1' })}
                    ${ctTextField('Shadow\noffset Y (px)', item.text_shadow_offset_y     ?? '', e => this._itemChanged(index, 'text_shadow_offset_y',     e), { type: 'number', step: '1' })}
                    ${ctTextField('Stroke\nwidth (px)',    item.text_shadow_stroke_width ?? '', e => this._itemChanged(index, 'text_shadow_stroke_width', e), { type: 'number', step: '1', min: '0' })}
                  </div>

                  <!-- Remove button -->
                  <div class="remove-item-row">
                    <button class="remove-item-btn" @click=${() => this._removeItem(index)}>
                      Remove item
                    </button>
                  </div>

                </ha-expansion-panel>
              `;
            })}
          </div>
        </ha-sortable>

        <div class="add-item-row">
          <button class="add-item-btn" @click=${() => this._addItem('entity')}>+ Add entity</button>
          <button class="add-item-btn" @click=${() => this._addItem('template')}>+ Add template</button>
        </div>
      </ha-expansion-panel>
    `;
  }

  static styles = css`

    ha-expansion-panel {
      margin-top: 8px;
    }

    /* ── Grid rows ─────────────────────────────────────────────────────────── */

    .card-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    .card-row-1 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .slider-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .slider-label {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    .slider-field input[type="range"] {
      width: 100%;
      accent-color: var(--primary-color);
    }

    .item-position-row {
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
      margin-top: 4px;
    }

    .item-content-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .item-toggles-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 24px;
      margin-bottom: 16px;
    }

    .item-typography {
      display: grid;
      grid-template-columns: 19fr 8fr 8fr 8fr 8fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .item-bg-color-padding {
      display: grid;
      grid-template-columns: 19fr 8fr 8fr 8fr 8fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .item-text-shadow {
      display: grid;
      grid-template-columns: 19fr 8fr 8fr 8fr 8fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    /* ── Zone alignment grid ───────────────────────────────────────────────── */

    .zone-modes-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: 4px 0 12px;
    }

    .zone-band {
      border-top: 1px solid var(--divider-color, #444);
      padding-top: 10px;
      margin-bottom: 20px;
    }
    .zone-band:last-child {
      margin-bottom: 8px;
    }

    .zone-band-name {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }

    .zone-band-grid {
      display: grid;
      grid-template-columns: 3fr 4fr 4fr 4fr;
      column-gap: 8px;
      row-gap: 6px;
      align-items: center;
    }

    .zone-band-rowlabel {
      font-size: 12px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }

    .zone-band-colheader {
      font-size: 12px;
      color: var(--secondary-text-color);
      text-align: center;
    }

    /* ── Text fields ───────────────────────────────────────────────────────── */

    .text-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .text-field label,
    .toggle-field-spacer {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
      white-space: pre-line;
    }

    /* ── Color picker row ──────────────────────────────────────────────────── */

    .color-picker-row {
      display: flex;
      align-items: stretch;
      gap: 6px;
    }

    .color-picker-row input[type="color"] {
      width: 40px;
      min-width: 40px;
      height: 56px;
      padding: 4px;
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .color-picker-row chrono-ct-textfield {
      flex: 1;
    }

    /* ── Toggle fields ─────────────────────────────────────────────────────── */

    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toggle-field-spacer {
      visibility: hidden;
    }

    .toggle-field-row {
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
    }

    .toggle-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    /* ── Add / remove item buttons ─────────────────────────────────────────── */

    .add-item-row {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 12px;
      margin-bottom: 4px;
    }

    .add-item-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
      height: 36px;
      padding: 0 8px;
      cursor: pointer;
      border-radius: 4px;
    }

    .add-item-btn:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
    }

    .remove-item-row {
      display: flex;
      justify-content: center;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    .remove-item-btn {
      background: none;
      border: none;
      color: var(--error-color, #f44336);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
      height: 36px;
      padding: 0 8px;
      cursor: pointer;
      border-radius: 4px;
    }

    .remove-item-btn:hover {
      background: rgba(244, 67, 54, 0.08);
    }

    /* ── Drag handle ───────────────────────────────────────────────────────── */

    .handle {
      cursor: move;
      cursor: grab;
      padding: 0 4px;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
    }

    .handle > * {
      pointer-events: none;
    }

    /* ── Item type badge ───────────────────────────────────────────────────── */

    .item-header-slot {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
    }

    .item-header-content {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
    }

    .item-header-content.item-hidden {
      opacity: 0.45;
    }

    .group-divider {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0 4px;
    }

    .group-divider-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }

    .group-divider-line {
      flex: 1;
      height: 1px;
      background: var(--divider-color, #444);
      opacity: 0.4;
    }

    .item-visibility-btn {
      background: none;
      border: none;
      padding: 0 4px;
      cursor: pointer;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .item-visibility-btn:hover {
      color: var(--primary-text-color);
    }

    .item-pos-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 2px 6px;
      border-radius: 4px;
      color: white;
    }

    .item-type-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .item-type-badge.entity {
      background: var(--success-color, #4CAF50);
      color: white;
    }

    .item-type-badge.template {
      background: var(--info-color, #2196F3);
      color: white;
    }

  `;

  render() {
    if (!this._config) return html``;

    const c = this._config;

    return html`

      <!-- ── Card configuration ──────────────────────────────────────────────── -->

      <ha-expansion-panel header="Card configuration" outlined .expanded=${false}>

        <!-- Background color -->
        <div class="card-row-1">
          ${ctColorPicker('Background color', c.letterbox_color ?? '#000000', e => this._valueChanged('letterbox_color', e))}
        </div>

        <!-- Dimmer -->
        <div class="card-row">
          ${ctToggleField('Ambient dimmer', c.dimmer_enabled ?? false, e => this._toggleChanged('dimmer_enabled', e), '', true)}
        </div>
        ${c.dimmer_enabled ? html`
        <div class="card-row-1">
          <ha-entity-picker
            label="Ambient lux sensor"
            .hass=${this.hass}
            .value=${c.dimmer_entity ?? ''}
            allow-custom-entity
            @value-changed=${e => this._valueChanged('dimmer_entity', e)}
          ></ha-entity-picker>
        </div>
        <div class="card-row">
          ${ctTextField('Lux min', c.dimmer_lux_min ?? 0, e => this._numericValueChanged('dimmer_lux_min', e), { type: 'number', step: '1', min: '0' })}
          ${ctTextField('Lux max', c.dimmer_lux_max ?? 40, e => this._numericValueChanged('dimmer_lux_max', e), { type: 'number', step: '1', min: '0' })}
        </div>
        <div class="card-row">
          ${ctTextField('Max opacity (%)', c.dimmer_max_opacity ?? 80, e => this._numericValueChanged('dimmer_max_opacity', e), { type: 'number', step: '1', min: '0', max: '100' })}
          ${ctTextField('Min opacity (%)', c.dimmer_min_opacity ?? 0, e => this._numericValueChanged('dimmer_min_opacity', e), { type: 'number', step: '1', min: '0', max: '100' })}
        </div>
        <div class="card-row-1">
          <div class="slider-field">
            <label class="slider-label">Aggressiveness: ${c.dimmer_aggressiveness ?? DEFAULT_CONFIG.dimmer_aggressiveness}%</label>
            <input type="range" min="1" max="100" step="1"
              .value=${String(c.dimmer_aggressiveness ?? DEFAULT_CONFIG.dimmer_aggressiveness)}
              @change=${e => this._numericValueChanged('dimmer_aggressiveness', e)}
            />
          </div>
        </div>
        ` : ''}

      </ha-expansion-panel>

      <!-- ── Zones panel ──────────────────────────────────────────────────────── -->

      ${this._renderZonesPanel()}

      <!-- ── Items panel ──────────────────────────────────────────────────────── -->

      ${this._renderItemsPanel()}

    `;
  }
}
customElements.define('chrono-tile-card-editor', ChronoTileCardEditor);

// ─── Card ─────────────────────────────────────────────────────────────────────
class ChronoTileCard extends LitElement {
  static properties = {
    _config:     { attribute: false },
    _itemValues: { state: true },
  };

  static getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('chrono-tile-card-editor');
  }

  static getStubConfig() {
    return {
      ...DEFAULT_CONFIG,
      items: [{
        ...DEFAULT_TEMPLATE_ITEM,
        _id:                      generateId([]),
        show:                     true,
        horizontal:               'center',
        vertical:                 'middle',
        icon:                     '',
        show_state:               false,
        font_color:               '#888888',
        font_size:                12,
        font_weight:              400,
        line_height:              1.2,
        border_radius:            50,
        background_color:         '',
        padding_top:              10,
        padding_bottom:           10,
        padding_left:             10,
        padding_right:            10,
        text_shadow_color:        '',
        text_shadow_blur:         0,
        text_shadow_offset_x:     0,
        text_shadow_offset_y:     0,
        text_shadow_stroke_width: 0,
        text_shadow_layers:       2,
        template:                 "{{ now().strftime('%H:%M') }}",
      }],
    };
  }

  constructor() {
    super();
    this._config        = null;
    this._hass           = null;
    this._itemValues     = {};
    this._itemSubs       = new Map(); // key → { template, unsub }
    this._subscribed     = false;
    this._holdTimer       = null;
    this._holdFired       = false;
    this._lastTapTime     = 0;
    this._pendingTapTimer = null;
    this._touchStartX     = null;
    this._touchStartY     = null;
    this._resizeObserver  = null;
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass  = hass;
    // Runs on every hass update, not just the first — the per-item diff in
    // _setupSubscriptions() (unchanged substituted string = no-op) is what
    // keeps this cheap, exactly as in chrono-slideshow-card. Needed so a
    // substituted card field whose value keeps changing (cardDimmerOpacity
    // chief among them) actually stays live.
    if (this._config) this._setupSubscriptions();
    if (this._hassShouldRender(prev, hass)) this.requestUpdate();
  }

  get hass() {
    return this._hass;
  }

  // ── Decide whether a hass update affects anything this card renders ─────────
  // Entity overlay items need fresh hass on state changes; the dimmer's own
  // lux entity needs watching too, so live ambient-light readings actually
  // reach the opacity calculation — this card has no slideshow timer to fall
  // back on for incidental re-renders the way chrono-slideshow-card does.
  _hassShouldRender(prev, next) {
    if (!prev || !next) return true;
    const c = this._config;
    if (!c) return true;
    if (prev.locale !== next.locale || prev.formatEntityState !== next.formatEntityState) return true;
    const ids = new Set();
    if (c.dimmer_entity) ids.add(c.dimmer_entity);
    for (const item of c.items ?? []) if (item.entity) ids.add(item.entity);
    for (const id of ids) if (prev.states?.[id] !== next.states?.[id]) return true;
    return false;
  }

  setConfig(config) {
    ({ config } = migrateConfig(config));
    this._config = config;
    if (this._hass) this._setupSubscriptions();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._hass && this._config && !this._subscribed) {
      this._setupSubscriptions();
    }

    this.style.setProperty(
      '--editor-preview-aspect-ratio',
      isInsideEditDialog(this) ? EDITOR_PREVIEW_ASPECT_RATIO : 'auto'
    );
    this.style.setProperty(
      '--editor-preview-height',
      isInsideEditDialog(this) ? 'auto' : '100%'
    );
  }

  // Lit calls firstUpdated() exactly once, after the component's first
  // render has completed and patched the shadow DOM — guaranteeing ha-card
  // exists (given _config is already set by this point). connectedCallback()
  // cannot be used for this: super.connectedCallback() only schedules the
  // first render, it does not run it synchronously, so ha-card is provably
  // absent from the shadow DOM at any point still inside connectedCallback().
  // Observing the host element instead (as a fallback) is not equivalent: on
  // the dashboard the host's own height happens to match ha-card's, masking
  // the bug, but in the editor dialog the host resolves to a real, distinct
  // zero height (confirmed via direct measurement) while ha-card still gets
  // a real height from its own aspect-ratio rule — two different elements
  // with two different sizes, and the wrong one was being watched.
  firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    const cardEl = this.shadowRoot?.querySelector('ha-card');
    if (!cardEl) return;
    this._resizeObserver = new ResizeObserver(entries => {
      const height = entries[0]?.contentRect?.height;
      if (!height) return;
      this.style.setProperty('--scale-factor', height / REFERENCE_HEIGHT_PX);
    });
    this._resizeObserver.observe(cardEl);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardownSubscriptions();
    this._resizeObserver?.disconnect();
  }

  // ── Template/entity subscriptions for overlay items ─────────────────────
  // For each template item, run substituteCardVariables against the current
  // card field values first (chrono-slideshow-card's exact mechanism, with
  // photo fields replaced by card fields — no photo data exists here). It
  // reports whether every {{ }} block was a bare card-field reference
  // (fullyLiteral) — if so, the rendered plain-text value is used directly
  // with no websocket involved at all. If any block contains a filter,
  // expression, or a live HA-state reference (e.g. states()), the
  // substituted string is sent to render_template — exactly
  // chrono-picture-card's subscription mechanism, applied to the
  // post-substitution text.
  //
  // Subscriptions are diffed per item (keyed by `item-<index>`) against the
  // previously-substituted string for that same item, kept in _itemSubs. An
  // item whose substituted text is unchanged keeps its existing open
  // subscription untouched. Only an item whose substituted text actually
  // differs — typically because it references a card field whose value
  // changed, cardDimmerOpacity chief among them — has its old subscription
  // torn down and a new one (or, if fullyLiteral, a plain value) opened.
  // This method runs on every hass update (see set hass()), so that diff is
  // what keeps repeated calls cheap, not something to avoid triggering.
  _setupSubscriptions() {
    if (!this._itemSubs) this._itemSubs = new Map();

    const items = this._config?.items ?? [];
    const c     = this._config ?? {};
    const seenKeys = new Set();

    // Every root-level DEFAULT_CONFIG scalar key, snake_case converted to
    // camelCase with a 'card' prefix (e.g. dimmer_max_opacity ->
    // {{ cardDimmerMaxOpacity }}), so it's usable in any template item.
    // cardDimmerOpacity is a computed value (0–100, 1 decimal), not a raw
    // config key.
    const _toCamel = s => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const cardData = {};
    const skipKeys = new Set(['zone_alignment', 'items']);
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      if (skipKeys.has(key)) continue;
      const camelKey = 'card' + _toCamel(key).replace(/^./, ch => ch.toUpperCase());
      cardData[camelKey] = c[key] ?? DEFAULT_CONFIG[key];
    }
    cardData['cardDimmerOpacity'] = Math.round(this._computeDimmerOpacity() * 1000) / 10;

    items.forEach((item, index) => {
      if (!('template' in item)) return;
      const key = `item-${index}`;
      seenKeys.add(key);
      const { text: substituted, fullyLiteral } = substituteCardVariables(item.template ?? '', cardData);
      const existing = this._itemSubs.get(key);

      if (existing && existing.substituted === substituted) return; // unchanged — leave subscription alone

      // Substituted text changed (or no prior subscription) — tear down the
      // old one for this key only, then (re)establish.
      if (existing?.unsub) this._unsubscribeOne(existing.unsub);

      if (fullyLiteral) {
        this._itemValues = { ...this._itemValues, [key]: substituted };
        this._itemSubs.set(key, { substituted, unsub: null });
        return;
      }

      const unsub = this._hass.connection.subscribeMessage(
        (msg) => { this._itemValues = { ...this._itemValues, [key]: msg.result }; },
        { type: 'render_template', template: substituted }
      );
      this._itemSubs.set(key, { substituted, unsub });
    });

    // Remove subscriptions for items that no longer exist (item removed/retyped).
    for (const [key, entry] of [...this._itemSubs.entries()]) {
      if (!seenKeys.has(key)) {
        if (entry.unsub) this._unsubscribeOne(entry.unsub);
        this._itemSubs.delete(key);
        const { [key]: _drop, ...rest } = this._itemValues;
        this._itemValues = rest;
      }
    }

    this._subscribed = true;
  }

  _unsubscribeOne(unsub) {
    Promise.resolve(unsub)
      .then(fn => { if (typeof fn === 'function') fn(); })
      .catch(() => {});
  }

  _teardownSubscriptions() {
    if (this._itemSubs) {
      for (const entry of this._itemSubs.values()) {
        if (entry.unsub) this._unsubscribeOne(entry.unsub);
      }
      this._itemSubs.clear();
    }
    this._subscribed = false;
  }

  // ── Action handling ───────────────────────────────────────────────────────
  _handleAction(config, action = 'tap') {
    if (!this._hass) return;
    handleAction(this, this._hass, config, action);
  }

  // ── Unified gesture recognition via Pointer Events (mouse, touch, and pen
  //    all fire the same events). All 7 outcomes (tap, hold, double-tap, and
  //    4 swipe directions) are plain pass-throughs to the generic action
  //    system — none has any hardcoded behavior. ──────────────────────────
  _onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    this._touchStartX = e.clientX;
    this._touchStartY = e.clientY;
    this._holdFired = false;
    if (this._holdTimer) clearTimeout(this._holdTimer);
    this._holdTimer = setTimeout(() => {
      this._holdFired = true;
      this._handleAction(this._config, 'hold');
    }, HOLD_MS);
  }

  _onPointerUp(e) {
    if (this._touchStartX === null) return;
    const dx = e.clientX - this._touchStartX;
    const dy = e.clientY - this._touchStartY;
    this._touchStartX = null;
    this._touchStartY = null;
    if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }

    const horizontalSwipe = Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) >= Math.abs(dy);
    const verticalSwipe   = Math.abs(dy) >= SWIPE_THRESHOLD && Math.abs(dy) >  Math.abs(dx);

    if (horizontalSwipe) {
      if (!this._holdFired) this._handleAction(this._config, dx < 0 ? 'swipe_left' : 'swipe_right');
      return;
    }
    if (verticalSwipe) {
      if (!this._holdFired) this._handleAction(this._config, dy < 0 ? 'swipe_up' : 'swipe_down');
      return;
    }
    if (this._holdFired) return; // hold already handled this press/release

    // Neither swipe nor hold — single tap, or the second tap of a double-tap.
    const now = Date.now();
    if (now - this._lastTapTime < DOUBLE_TAP_MS) {
      this._lastTapTime = 0;
      if (this._pendingTapTimer) { clearTimeout(this._pendingTapTimer); this._pendingTapTimer = null; }
      this._handleAction(this._config, 'double_tap');
      return;
    }
    this._lastTapTime = now;
    if (this._pendingTapTimer) clearTimeout(this._pendingTapTimer);
    this._pendingTapTimer = setTimeout(() => {
      this._pendingTapTimer = null;
      this._handleAction(this._config, 'tap');
    }, DOUBLE_TAP_MS);
  }

  _onPointerCancel() {
    this._touchStartX = null;
    this._touchStartY = null;
    if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
  }

  // Cancels the hold timer once movement clearly indicates a swipe is
  // underway, rather than letting hold fire on pure elapsed time regardless
  // of movement.
  _onPointerMove(e) {
    if (this._touchStartX === null || !this._holdTimer) return;
    const dx = e.clientX - this._touchStartX;
    const dy = e.clientY - this._touchStartY;
    if (Math.abs(dx) >= SWIPE_THRESHOLD || Math.abs(dy) >= SWIPE_THRESHOLD) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
  }

  // ── Dimmer ────────────────────────────────────────────────────────────────
  // Returns the overlay opacity as a 0–1 fraction. Uses a Stevens power-law
  // curve (exponent 0.33 = human brightness perception baseline, cube-root)
  // scaled by dimmer_aggressiveness. The curve maps lux onto the configured
  // min–max opacity range, with lux clamped to [lux_min, lux_max]:
  //   t = (lux - lux_min) / (lux_max - lux_min)   — normalized 0–1
  //   opacity = max + (min - max) × t^(0.33 × aggressiveness)
  // At t=0 (dark) opacity = max; at t=1 (bright) opacity = min.
  _computeDimmerOpacity() {
    const c = this._config;
    const entity = c.dimmer_entity ?? '';
    if (!entity) return 0;
    const stateObj = this._hass?.states?.[entity];
    const lux = stateObj ? parseFloat(stateObj.state) : 0;
    if (isNaN(lux)) return 0;

    const luxMin  = c.dimmer_lux_min  ?? DEFAULT_CONFIG.dimmer_lux_min;
    const luxMax  = c.dimmer_lux_max  ?? DEFAULT_CONFIG.dimmer_lux_max;
    const opMin   = (c.dimmer_min_opacity ?? DEFAULT_CONFIG.dimmer_min_opacity) / 100;
    const opMax   = (c.dimmer_max_opacity ?? DEFAULT_CONFIG.dimmer_max_opacity) / 100;
    const aggrPct = c.dimmer_aggressiveness ?? DEFAULT_CONFIG.dimmer_aggressiveness;
    const aggr    = Math.pow(10, (aggrPct - 50) / 50);

    if (luxMax <= luxMin) return opMax; // degenerate config — always max opacity
    const t = Math.max(0, Math.min(1, (lux - luxMin) / (luxMax - luxMin)));
    return opMax + (opMin - opMax) * Math.pow(t, 0.33 * aggr);
  }

  // ── Item style map ────────────────────────────────────────────────────────
  _itemStyleMap(item) {
    const pxScaled = v => (v !== '' && v != null) ? `calc(${v}px * var(--scale-factor, 1))` : undefined;
    const emScaled = v => (v !== '' && v != null) ? `calc(${v}em * var(--scale-factor, 1))` : undefined;
    const raw      = v => (v !== '' && v != null) ? `${v}`   : undefined;
    return {
      'color':            item.font_color       || undefined,
      'font-family':      item.font_family      || undefined,
      'font-size':        emScaled(item.font_size),
      'font-weight':      raw(item.font_weight),
      'line-height':      raw(item.line_height),
      'border-radius':    pxScaled(item.border_radius),
      'background-color': item.background_color || undefined,
      'padding-top':      pxScaled(item.padding_top),
      'padding-bottom':   pxScaled(item.padding_bottom),
      'padding-left':     pxScaled(item.padding_left),
      'padding-right':    pxScaled(item.padding_right),
      'text-shadow':              item.text_shadow_color
        ? Array(Math.max(1, Number(item.text_shadow_layers ?? 2) || 1))
            .fill(`${pxScaled(item.text_shadow_offset_x ?? 0)} ${pxScaled(item.text_shadow_offset_y ?? 0)} ${pxScaled(item.text_shadow_blur ?? 0)} ${item.text_shadow_color}`)
            .join(', ')
        : undefined,
      '-webkit-text-stroke-width': item.text_shadow_color ? pxScaled(item.text_shadow_stroke_width ?? 0) : undefined,
      '-webkit-text-stroke-color': item.text_shadow_color || undefined,
    };
  }

  // ── Render a single overlay item ──────────────────────────────────────────
  _renderItem(item) {
    if (item.show === false) return html``;
    ensureFontLoaded(item.font_family);
    if ('template' in item) {
      const key    = `item-${this._config.items.indexOf(item)}`;
      const value  = this._itemValues[key] ?? '';
      const hasTap = item.tap_action && item.tap_action.action !== 'none';
      return html`
        <span
          class="overlay-template-item${hasTap ? ' clickable' : ''}"
          style=${styleMap(this._itemStyleMap(item))}
          @click=${hasTap ? () => this._handleAction(item) : undefined}
        >${value}</span>
      `;
    }

    if ('entity' in item) {
      const stateObj  = this._hass?.states?.[item.entity];
      if (!stateObj) {
        return html`
          <span class="overlay-entity-missing" title="Entity not found: ${item.entity}">!</span>
        `;
      }
      const itemConfig = { ...item, entity: item.entity };
      const stateLabel = item.show_state
        ? (this._hass?.formatEntityState
            ? this._hass.formatEntityState(stateObj)
            : stateObj.state)
        : '';

      return html`
        <div
          class="overlay-entity-item"
          style=${styleMap(this._itemStyleMap(item))}
          title="${stateObj.attributes.friendly_name ?? item.entity}: ${stateObj.state}"
          @click=${(e) => { e.stopPropagation(); this._handleAction(itemConfig); }}
        >
          <ha-state-icon
            .hass=${this._hass}
            .stateObj=${stateObj}
            .icon=${item.icon || undefined}
          ></ha-state-icon>
          ${item.show_state ? html`<span class="entity-state-label">${stateLabel}</span>` : ''}
        </div>
      `;
    }

    return html``;
  }

  // ── Render a zone's items ─────────────────────────────────────────────────
  _renderZoneItems(vertical, horizontal) {
    const allItems = this._config?.items ?? [];
    const items    = allItems.filter(item =>
      (item.horizontal ?? 'center') === horizontal &&
      (item.vertical   ?? 'middle') === vertical
    );
    if (items.length === 0) return html``;
    const zoneKey   = `${vertical}-${horizontal}`;
    const alignment = this._config?.zone_alignment?.[zoneKey] ?? DEFAULT_ZONE_ALIGNMENT[zoneKey] ?? horizontal;
    return html`
      <div class="overlay-zone overlay-zone-align-${alignment}">
        ${items.map(item => this._renderItem(item))}
      </div>
    `;
  }

  // ── Render the full 9-zone grid ───────────────────────────────────────────
  _renderZoneGrid() {
    const rows = ['top', 'middle', 'bottom'].map(vertical => {
      const cells = ['left', 'center', 'right'].map(horizontal =>
        html`<div class="overlay-cell">${this._renderZoneItems(vertical, horizontal)}</div>`
      );
      return html`<div class="overlay-row">${cells}</div>`;
    });
    return html`<div class="overlay-grid">${rows}</div>`;
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    ha-card {
      position: relative;
      width: 100%;
      height: var(--editor-preview-height, 100%);
      min-height: 100px;
      aspect-ratio: var(--editor-preview-aspect-ratio, auto);
      overflow: hidden;
      box-sizing: border-box;
    }
    .tile-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      touch-action: none;
    }

    /* ── Dimmer overlay: sits above all items ─────────────────────────────── */
    .dimmer-overlay {
      position: absolute;
      inset: 0;
      z-index: 5;
      pointer-events: none;
    }

    /* ── 9-zone grid layout ──────────────────────────────────────────────── */
    .overlay-grid {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
    .overlay-row {
      display: flex;
      flex-direction: row;
      flex: 1;
    }
    .overlay-cell {
      flex: 1;
      display: flex;
      min-width: 0;
      min-height: 0;
    }
    .overlay-row:nth-child(1) .overlay-cell { align-items: flex-start; }
    .overlay-row:nth-child(2) .overlay-cell { align-items: center;    }
    .overlay-row:nth-child(3) .overlay-cell { align-items: flex-end;  }
    .overlay-cell:nth-child(1) { justify-content: flex-start; }
    .overlay-cell:nth-child(2) { justify-content: center;     }
    .overlay-cell:nth-child(3) { justify-content: flex-end;   }

    .overlay-zone {
      display: flex;
      flex-direction: column;
      gap: calc(4px * var(--scale-factor, 1));
      pointer-events: auto;
      padding: calc(8px * var(--scale-factor, 1));
    }
    .overlay-zone-align-left   { align-items: flex-start; text-align: left;   }
    .overlay-zone-align-center { align-items: center;     text-align: center; }
    .overlay-zone-align-right  { align-items: flex-end;   text-align: right;  }

    .overlay-template-item {
      color: var(--ha-picture-card-text-color, white);
      white-space: pre-wrap;
      line-height: 1.4;
    }
    .overlay-template-item.clickable {
      cursor: pointer;
    }
    .overlay-entity-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      min-width: calc(40px * var(--scale-factor, 1));
    }
    .overlay-entity-item ha-state-icon {
      --mdc-icon-size: calc(24px * var(--scale-factor, 1));
    }
    .entity-state-label {
      display: block;
      font-size: calc(10px * var(--scale-factor, 1));
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--ha-picture-card-text-color, white);
      max-width: calc(96px * var(--scale-factor, 1));
    }
    .overlay-entity-missing {
      color: var(--error-color, #f44336);
      font-weight: bold;
      padding: 0 calc(4px * var(--scale-factor, 1));
    }
  `;

  render() {
    if (!this._config) return html``;
    const c = this._config;

    return html`
      <ha-card>
        <div
          class="tile-container"
          style=${styleMap({ 'background-color': c.letterbox_color || undefined })}
          @pointerdown=${(e) => this._onPointerDown(e)}
          @pointermove=${(e) => this._onPointerMove(e)}
          @pointerup=${(e) => this._onPointerUp(e)}
          @pointercancel=${() => this._onPointerCancel()}
        >
          ${this._renderZoneGrid()}

          ${(c.dimmer_enabled && c.dimmer_entity) ? html`
            <div class="dimmer-overlay" style="
              background-color: ${c.dimmer_color ?? DEFAULT_CONFIG.dimmer_color};
              opacity: ${this._computeDimmerOpacity()};
            "></div>
          ` : ''}
        </div>
      </ha-card>
    `;
  }
}
customElements.define('chrono-tile-card', ChronoTileCard);

// ─── Card registration ────────────────────────────────────────────────────────
window.customCards = window.customCards || [];
window.customCards.push({
  type:        'chrono-tile-card',
  name:        'Chrono Tile Card',
  description: 'A 9-zone grid of templated or entity-driven tiles, with an ambient-light dimmer overlay.',
  preview:     true,
});
