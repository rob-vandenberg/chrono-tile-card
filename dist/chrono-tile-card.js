import{LitElement,html,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";import{styleMap}from"https://unpkg.com/lit@2.0.0/directives/style-map.js?module";import{unsafeHTML}from"https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module";import{repeat}from"https://unpkg.com/lit@2.0.0/directives/repeat.js?module";const CARD_VERSION="1.1.13",mdiDragHorizontalVariant="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z";console.info("%c CHRONO-%cTILE%c-CARD %c v1.1.13 ","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 0 2px 4px; border-radius: 3px 0 0 3px;","background-color: #101010; color: #4676d3; font-weight: bold; padding: 2px 0;","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 4px 2px 0;","background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");const DEFAULT_ITEM={_id:"",show:!0,horizontal:"center",vertical:"middle",icon:"",show_state:!1,font_color:"#FFFFFF",font_family:"DSEG7 Classic",font_size:1,font_weight:400,line_height:"",border_radius:"",background_color:"",padding_horizontal:"",padding_vertical:"",margin_top:"",margin_bottom:"",text_shadow_color:"",text_shadow_blur:"",text_shadow_offset_x:"",text_shadow_offset_y:"",text_shadow_stroke_width:"",text_shadow_layers:2},DEFAULT_ENTITY_ITEM={...DEFAULT_ITEM,entity:""},DEFAULT_TEMPLATE_ITEM={...DEFAULT_ITEM,template:""},DEFAULT_ZONE_ALIGNMENT={"top-left":"left","top-center":"center","top-right":"right","middle-left":"left","middle-center":"center","middle-right":"right","bottom-left":"left","bottom-center":"center","bottom-right":"right"},DEFAULT_ZONE_OFFSET_X={"top-left":12,"top-center":0,"top-right":-12,"middle-left":12,"middle-center":0,"middle-right":-12,"bottom-left":12,"bottom-center":0,"bottom-right":-12},DEFAULT_ZONE_OFFSET_Y={"top-left":-12,"top-center":-12,"top-right":-12,"middle-left":0,"middle-center":0,"middle-right":0,"bottom-left":12,"bottom-center":12,"bottom-right":12},REFERENCE_HEIGHT_PX=400,EDITOR_PREVIEW_ASPECT_RATIO="16 / 10";function isInsideEditDialog(t){let e=t;for(;e;){if("HA-DIALOG"===e.tagName)return!0;e=e.parentElement||e.getRootNode()?.host}return!1}const HOLD_MS=500,DOUBLE_TAP_MS=250,SWIPE_THRESHOLD=40,DEFAULT_CONFIG={background_color:"#000000",dimmer_enabled:!1,dimmer_entity:"",dimmer_lux_min:0,dimmer_lux_max:40,dimmer_opacity_min:0,dimmer_opacity_max:80,dimmer_color:"#000000",dimmer_aggressiveness:50,zone_alignment:{...DEFAULT_ZONE_ALIGNMENT},zone_offset_x:{...DEFAULT_ZONE_OFFSET_X},zone_offset_y:{...DEFAULT_ZONE_OFFSET_Y},items:[]},NUMERIC_ITEM_KEYS=new Set(["font_size","font_weight","line_height","border_radius","padding_horizontal","padding_vertical","margin_top","margin_bottom","text_shadow_blur","text_shadow_offset_x","text_shadow_offset_y","text_shadow_stroke_width"]),SHADOW_DEPENDENT_KEYS=new Set(["text_shadow_blur","text_shadow_offset_x","text_shadow_offset_y"]),VERTICAL_OPTIONS=[{label:"Top",value:"top"},{label:"Middle",value:"middle"},{label:"Bottom",value:"bottom"}],HORIZONTAL_OPTIONS=[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"}],ZONE_ALIGNMENT_OPTIONS=[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"}],FONT_OPTIONS=[{label:"Theme default",value:"",family:"",slug:"",italic:!1},{label:"DSEG14 Classic",value:"DSEG14 Classic",family:"DSEG14 Classic",slug:"dseg14-classic",italic:!1},{label:"DSEG14 Classic Italic",value:"DSEG14 Classic Italic",family:"DSEG14 Classic",slug:"dseg14-classic",italic:!0},{label:"DSEG7 Classic",value:"DSEG7 Classic",family:"DSEG7 Classic",slug:"dseg7-classic",italic:!1},{label:"DSEG7 Classic Italic",value:"DSEG7 Classic Italic",family:"DSEG7 Classic",slug:"dseg7-classic",italic:!0},{label:"Roboto",value:"Roboto",family:"Roboto",slug:"roboto",italic:!1},{label:"Open Sans",value:"Open Sans",family:"Open Sans",slug:"open-sans",italic:!1},{label:"Montserrat",value:"Montserrat",family:"Montserrat",slug:"montserrat",italic:!1},{label:"Poppins",value:"Poppins",family:"Poppins",slug:"poppins",italic:!1},{label:"Inter",value:"Inter",family:"Inter",slug:"inter",italic:!1},{label:"Oswald",value:"Oswald",family:"Oswald",slug:"oswald",italic:!1},{label:"Rajdhani",value:"Rajdhani",family:"Rajdhani",slug:"rajdhani",italic:!1},{label:"Orbitron",value:"Orbitron",family:"Orbitron",slug:"orbitron",italic:!1},{label:"Share Tech Mono",value:"Share Tech Mono",family:"Share Tech Mono",slug:"share-tech-mono",italic:!1},{label:"VT323",value:"VT323",family:"VT323",slug:"vt323",italic:!1},{label:"Press Start 2P",value:"Press Start 2P",family:"Press Start 2P",slug:"press-start-2p",italic:!1}],_FONT_OPTION_BY_VALUE=new Map(FONT_OPTIONS.map(t=>[t.value,t])),_injectedFonts=new Set;function ensureFontLoaded(t){if(!t||_injectedFonts.has(t))return;const e=_FONT_OPTION_BY_VALUE.get(t);if(!e?.slug)return;_injectedFonts.add(t);const i=e.italic?"400-italic.css":"400.css",o=document.createElement("link");o.rel="stylesheet",o.href=`https://cdn.jsdelivr.net/npm/@fontsource/${e.slug}/${i}`,document.head.appendChild(o)}const SHOW_ITEM_POSITION_BADGES=!1,VERTICAL_BADGE_COLORS={top:"#ac00ac",middle:"#c77c00",bottom:"#0600ff"},HORIZONTAL_BADGE_COLORS={left:"#bb9e00",center:"#10a800",right:"#00a896"},GROUP_DIVIDER_COLOR="#009ac7",_GROUP_DEFS=[{vertical:"top",horizontal:"left",label:"Top · Left"},{vertical:"top",horizontal:"center",label:"Top · Center"},{vertical:"top",horizontal:"right",label:"Top · Right"},{vertical:"middle",horizontal:"left",label:"Middle · Left"},{vertical:"middle",horizontal:"center",label:"Middle · Center"},{vertical:"middle",horizontal:"right",label:"Middle · Right"},{vertical:"bottom",horizontal:"left",label:"Bottom · Left"},{vertical:"bottom",horizontal:"center",label:"Bottom · Center"},{vertical:"bottom",horizontal:"right",label:"Bottom · Right"}],_GROUP_ORDER=_GROUP_DEFS.map(t=>`${t.vertical}-${t.horizontal}`);function sortItems(t){const e=t=>`${t.vertical??"middle"}-${t.horizontal??"center"}`;return[...t].sort((t,i)=>_GROUP_ORDER.indexOf(e(t))-_GROUP_ORDER.indexOf(e(i)))}function generateId(t=[]){const e=new Set(t.map(t=>t._id));let i;do{i=Math.random().toString(16).slice(2,10)}while(e.has(i));return i}function migrateConfig(t){let e=!1;if(t.items?.some(t=>!t._id)){const i=[];for(const e of t.items)i.push(e._id?e:{...e,_id:generateId(t.items.concat(i))});t={...t,items:i},e=!0}const i=t.zone_alignment??{};Object.keys(DEFAULT_ZONE_ALIGNMENT).some(t=>!(t in i))&&(t={...t,zone_alignment:{...DEFAULT_ZONE_ALIGNMENT,...i}},e=!0);const o=t.zone_offset_x??{};Object.keys(DEFAULT_ZONE_OFFSET_X).some(t=>!(t in o))&&(t={...t,zone_offset_x:{...DEFAULT_ZONE_OFFSET_X,...o}},e=!0);const n=t.zone_offset_y??{};return Object.keys(DEFAULT_ZONE_OFFSET_Y).some(t=>!(t in n))&&(t={...t,zone_offset_y:{...DEFAULT_ZONE_OFFSET_Y,...n}},e=!0),{config:t,migrated:e}}function fireEvent(t,e,i={},o={}){const n=new Event(e,{bubbles:o.bubbles??!0,cancelable:Boolean(o.cancelable),composed:o.composed??!0});return n.detail=i,t.dispatchEvent(n),n}function navigate(t,e={}){e.replace?history.replaceState(null,"",t):history.pushState(null,"",t),fireEvent(window,"location-changed",{replace:e.replace??!1})}function toggleEntity(t,e){e&&t.callService("homeassistant","toggle",{entity_id:e})}function handleAction(t,e,i,o){let n;switch("double_tap"===o&&i.double_tap_action?n=i.double_tap_action:"hold"===o&&i.hold_action?n=i.hold_action:"tap"===o&&i.tap_action?n=i.tap_action:"swipe_up"===o&&i.swipe_up_action?n=i.swipe_up_action:"swipe_down"===o&&i.swipe_down_action?n=i.swipe_down_action:"swipe_left"===o&&i.swipe_left_action?n=i.swipe_left_action:"swipe_right"===o&&i.swipe_right_action&&(n=i.swipe_right_action),n||(n={action:"none"}),n.action){case"none":default:break;case"more-info":fireEvent(t,"hass-more-info",{entityId:n.entity??i.entity});break;case"navigate":n.navigation_path&&navigate(n.navigation_path,{replace:n.navigation_replace});break;case"url":n.url_path&&window.open(n.url_path,"_blank");break;case"toggle":toggleEntity(e,i.entity);break;case"perform-action":case"call-service":{const t=n.perform_action??n.service;if(!t)break;const[i,o]=t.split(".",2);if(!i||!o)break;e.callService(i,o,n.data??n.service_data,n.target);break}case"fire-dom-event":fireEvent(t,"ll-custom",n)}}const _TEMPLATE_EXPR_RE=/\{\{(.*?)\}\}/gs,_IDENTIFIER_RE=/[A-Za-z_][A-Za-z0-9_]*/g;function _jinjaLiteral(t){if(null==t)return"''";const e=String(t);return""===e?"''":/^-?\d+(\.\d+)?$/.test(e)||"true"===e||"false"===e?e:`'${e.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}function substituteCardVariables(t,e){const i=String(t??"");if(!i.includes("{{")||!e)return{text:i,fullyLiteral:!i.includes("{{")};let o=!0;const n=[];i.replace(_TEMPLATE_EXPR_RE,(t,i)=>{const r=i.trim(),a=/^[A-Za-z_][A-Za-z0-9_]*$/.test(r)&&Object.prototype.hasOwnProperty.call(e,r);return a||(o=!1),n.push({inner:i,isCardField:a,field:a?r:null}),t});let r=0;if(o){return{text:i.replace(_TEMPLATE_EXPR_RE,()=>{const{field:t}=n[r++],i=e[t];return null==i?"":String(i)}),fullyLiteral:!0}}return{text:i.replace(_TEMPLATE_EXPR_RE,(t,i)=>`{{${i.replace(_IDENTIFIER_RE,t=>Object.prototype.hasOwnProperty.call(e,t)?_jinjaLiteral(e[t]):t)}}}`),fullyLiteral:!1}}function ctParseNumber(t){const e=String(t).replace(",",".");if("-"===e||"-0"===e||e.endsWith("."))return null;if(""===e)return"";const i=parseFloat(e);return isNaN(i)||String(i)!==e?null:i}function ctTextField(t,e,i,o={}){return html`
    <div class="text-field">
      <label>${unsafeHTML(t)}</label>
      <chrono-ct-textfield
        .value=${String(e??"")}
        type=${o.type??"text"}
        step=${o.step??""}
        min=${o.min??""}
        max=${o.max??""}
        @input=${i}
      ></chrono-ct-textfield>
    </div>
  `}function ctToggleField(t,e,i,o="",n=!1){return html`
    <div class="toggle-field ${o}">
      ${n?html`<label class="toggle-field-spacer" aria-hidden="true">&nbsp;</label>`:""}
      <div class="toggle-field-row">
        <label>${unsafeHTML(t)}</label>
        <ha-switch .checked=${e} @change=${i}></ha-switch>
      </div>
    </div>
  `}function toSwatchHex(t){const e=String(t??"").trim();return/^#[0-9a-fA-F]{3}$/.test(e)||/^#[0-9a-fA-F]{6}$/.test(e)?e:/^#[0-9a-fA-F]{8}$/.test(e)?e.slice(0,7):"#000000"}function ctColorPicker(t,e,i){const o=toSwatchHex(e);return html`
    <div class="text-field">
      <label>${unsafeHTML(t)}</label>
      <div class="color-picker-row">
        <input type="color" .value=${o} @input=${i}>
        <chrono-ct-textfield
          .value=${String(e??"")}
          @input=${i}
        ></chrono-ct-textfield>
      </div>
    </div>
  `}function ctSelectField(t,e,i,o){return html`
    <div class="text-field">
      ${t?html`<label>${unsafeHTML(t)}</label>`:""}
      <chrono-ct-select
        .value=${e??""}
        .options=${i}
        @change=${o}
      ></chrono-ct-select>
    </div>
  `}function ctButtonPicker(t,e,i,o,n="",r=""){return html`
    <div class="button-picker-field ${r}" style=${"end"===n?"justify-self:end":""}>
      <label>${unsafeHTML(t)}</label>
      <chrono-ct-button-toggle-group
        .value=${e}
        .options=${i}
        @change=${o}
      ></chrono-ct-button-toggle-group>
    </div>
  `}class CtTextfield extends LitElement{static properties={value:{type:String},type:{type:String},step:{type:String},min:{type:String},max:{type:String},placeholder:{type:String}};static styles=css`
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
  `;focus(){this.shadowRoot?.querySelector("input")?.focus()}render(){return html`
      <input
        part="input"
        .value=${live(this.value??"")}
        type=${this.type??"text"}
        step=${this.step??""}
        min=${this.min??""}
        max=${this.max??""}
        placeholder=${this.placeholder??""}
        @input=${t=>{this.value=t.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}
      >
    `}}customElements.define("chrono-ct-textfield",CtTextfield);class CtTextarea extends LitElement{static properties={value:{type:String},placeholder:{type:String},error:{type:Boolean}};static styles=css`
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
  `;focus(){this.shadowRoot?.querySelector("textarea")?.focus()}render(){return html`
      <textarea
        class="${this.error?"error":""}"
        .value=${live(this.value??"")}
        placeholder=${this.placeholder??""}
        @input=${t=>{this.value=t.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}
      ></textarea>
    `}}customElements.define("chrono-ct-textarea",CtTextarea);class CtButtonToggleGroup extends LitElement{static properties={value:{type:String},options:{type:Array}};static styles=css`
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
  `;render(){const t=this.options??[];return html`${t.map((e,i)=>{const o=1===t.length,n=0===i,r=i===t.length-1,a=[e.value===this.value?"active":"",o?"only":n?"first":r?"last":""].filter(Boolean).join(" ");return html`
        <button class="${a}" @click=${()=>this._select(e.value)}>${e.label}</button>
      `})}`}_select(t){this.value=t,this.dispatchEvent(new CustomEvent("change",{detail:{value:t},bubbles:!0,composed:!0}))}focus(){this.shadowRoot?.querySelector("button")?.focus()}}customElements.define("chrono-ct-button-toggle-group",CtButtonToggleGroup);class CtSelect extends LitElement{static properties={value:{type:String},options:{type:Array},_open:{state:!0},_cursor:{state:!0}};static styles=css`
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
  `;constructor(){super(),this.value="",this.options=[],this._open=!1,this._cursor=-1,this._onOutsideClick=this._onOutsideClick.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onOutsideClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onOutsideClick)}_onOutsideClick(t){this.shadowRoot.contains(t.composedPath()[0])||t.composedPath()[0]===this||(this._open=!1,this._cursor=-1)}_select(t){this.value=t,this._open=!1,this._cursor=-1,this.dispatchEvent(new CustomEvent("change",{detail:{value:t},bubbles:!0,composed:!0}))}_handleKeyDown(t){const e=this.options??[];this._open?"ArrowDown"===t.key?(this._cursor=Math.min(this._cursor+1,e.length-1),t.preventDefault()):"ArrowUp"===t.key?(this._cursor=Math.max(this._cursor-1,0),t.preventDefault()):"Enter"===t.key?(this._cursor>=0&&this._cursor<e.length&&this._select(e[this._cursor].value),t.preventDefault()):"Escape"===t.key&&(this._open=!1,this._cursor=-1,t.preventDefault()):"ArrowDown"!==t.key&&"ArrowUp"!==t.key||(this._open=!0,this._cursor=0,t.preventDefault())}render(){const t=this.options??[];return html`
      <div part="combobox" class="combobox ${this._open?"combobox-open":""}">
        <input
          class="combobox-input"
          .value=${live(this.value??"")}
          @input=${t=>{this.dispatchEvent(new CustomEvent("change",{detail:{value:t.target.value},bubbles:!0,composed:!0}))}}
          @blur=${()=>{this._open=!1,this._cursor=-1}}
          @keydown=${this._handleKeyDown}
        >
        <div
          class="combobox-chevron"
          @click=${()=>{this._open=!this._open,this._cursor=-1,this.shadowRoot.querySelector(".combobox-input").focus()}}
          aria-hidden="true"
        >${this._open?"▴":"▾"}</div>
      </div>
      ${this._open?html`
        <div class="combobox-dropdown">
          ${t.map((t,e)=>html`
            <div
              class="combobox-option
                     ${t.value===this.value?"combobox-option-selected":""}
                     ${e===this._cursor?"combobox-option-cursor":""}"
              @mousedown=${e=>{e.preventDefault(),this._select(t.value)}}
            >${t.label}</div>
          `)}
        </div>
      `:""}
    `}focus(){this.shadowRoot?.querySelector(".combobox-input")?.focus()}}customElements.define("chrono-ct-select",CtSelect);class ChronoTileCardEditor extends LitElement{static properties={hass:{attribute:!1},_config:{state:!0},_expandedItemId:{state:!0},_removedItem:{state:!0}};setConfig(t){const{config:e,migrated:i}=migrateConfig(t);this._config=e,i&&this._fireConfig()}_fireConfig(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_valueChanged(t,e){if(!this._config)return;this._clearUndo();const i=e.target.value??e.detail?.value;this._config={...this._config,[t]:i},this._fireConfig()}_numericValueChanged(t,e){if(!this._config)return;this._clearUndo();const i=ctParseNumber(e.target.value??e.detail?.value);null!==i&&(this._config={...this._config,[t]:i},this._fireConfig())}_toggleChanged(t,e){if(!this._config)return;this._clearUndo();const i=e.target.checked;this._config={...this._config,[t]:i},this._fireConfig()}_zoneAlignmentChanged(t,e){if(!this._config)return;this._clearUndo();const i=e.target.value??e.detail?.value,o={...this._config.zone_alignment??DEFAULT_ZONE_ALIGNMENT,[t]:i};this._config={...this._config,zone_alignment:o},this._fireConfig()}_zoneOffsetChanged(t,e,i){if(!this._config)return;this._clearUndo();const o=ctParseNumber(i.target.value??i.detail?.value);if(null===o)return;const n="x"===t?"zone_offset_x":"zone_offset_y",r="x"===t?DEFAULT_ZONE_OFFSET_X:DEFAULT_ZONE_OFFSET_Y,a={...this._config[n]??r,[e]:o};this._config={...this._config,[n]:a},this._fireConfig()}_itemChanged(t,e,i){if(!this._config)return;this._clearUndo();const o=i.target.value??i.detail?.value;let n;if(NUMERIC_ITEM_KEYS.has(e)){const i=ctParseNumber(o);if(null===i)return;n=i,""===n&&SHADOW_DEPENDENT_KEYS.has(e)&&this._config.items[t]?.text_shadow_color&&(n=0)}else n=o;let r=[...this._config.items??[]];const a=r[t]?.text_shadow_color;let s={...r[t],[e]:n};if("text_shadow_color"===e&&!a&&n)for(const t of SHADOW_DEPENDENT_KEYS)""===s[t]&&(s[t]=0);r[t]=s,"horizontal"!==e&&"vertical"!==e||(r=sortItems(r)),this._config={...this._config,items:r},this._fireConfig()}_itemToggled(t,e,i){if(!this._config)return;this._clearUndo();const o=i.target.checked,n=[...this._config.items??[]];n[t]={...n[t],[e]:o},this._config={...this._config,items:n},this._fireConfig()}_addItem(t){const e=this._config.items??[];let i="";if("entity"===t){const t=this.hass?.states??{};i=Object.keys(t).find(t=>t.startsWith("light."))??Object.keys(t)[0]??""}else i="{{ now().strftime('%H:%M') }}";const o="entity"===t?{...DEFAULT_ENTITY_ITEM,_id:generateId(e),entity:i}:{...DEFAULT_TEMPLATE_ITEM,_id:generateId(e),template:i},n=sortItems([...e,o]);this._expandedItemId=o._id,this._removedItem=null,this._config={...this._config,items:n},this._fireConfig(),this.updateComplete.then(async()=>{const t=this.shadowRoot?.querySelector(`[data-item-id="${o._id}"]`);t&&(await t.updateComplete,t.scrollIntoView({behavior:"smooth",block:"nearest"}),t.querySelector("chrono-ct-textfield")?.focus())})}_removeItem(t){const e=[...this._config.items??[]];this._removedItem={item:e[t],index:t},this._config={...this._config,items:e.filter((e,i)=>i!==t)},this._fireConfig()}_undoRemove(){if(!this._removedItem)return;const{item:t,index:e}=this._removedItem,i=[...this._config.items??[]];i.splice(e,0,t),this._removedItem=null,this._config={...this._config,items:i},this._fireConfig()}_clearUndo(){this._removedItem&&(this._removedItem=null)}_buildRows(t){const e=[];let i=0;for(const o of _GROUP_DEFS)e.push({type:"divider",group:o,key:`divider-${o.vertical}-${o.horizontal}`}),t.forEach((t,n)=>{(t.vertical??"middle")===o.vertical&&(t.horizontal??"center")===o.horizontal&&(this._removedItem&&i===this._removedItem.index&&e.push({type:"undo",key:"undo-remove"}),e.push({type:"item",item:t,itemIndex:n,key:t._id}),i++)});return this._removedItem&&i===this._removedItem.index&&e.push({type:"undo",key:"undo-remove"}),e}_itemMoved(t){t.stopPropagation(),this._clearUndo();const{oldIndex:e,newIndex:i}=t.detail,o=[...this._config.items??[]],n=this._buildRows(o);if(!n[e]||"item"!==n[e].type)return;n.splice(i,0,n.splice(e,1)[0]);let r=_GROUP_DEFS[0];const a=[];for(const t of n)"divider"!==t.type?a.push({...t.item,vertical:r.vertical,horizontal:r.horizontal}):r=t.group;this._config={...this._config,items:a},this._fireConfig()}_verticalOptions=VERTICAL_OPTIONS;_horizontalOptions=HORIZONTAL_OPTIONS;_fontFamilyOptions=FONT_OPTIONS;_zoneAlignmentOptions=ZONE_ALIGNMENT_OPTIONS;_renderZonesPanel(){const t=this._config?.zone_alignment??DEFAULT_ZONE_ALIGNMENT,e=this._config?.zone_offset_x??DEFAULT_ZONE_OFFSET_X,i=this._config?.zone_offset_y??DEFAULT_ZONE_OFFSET_Y;return html`
      <ha-expansion-panel header="Zones configuration" outlined .expanded=${!1}>
        <p class="zone-modes-hint">
          Alignment controls how multiple items stacked in the same zone align
          relative to each other — independent from which screen position the
          zone itself occupies. Margins shift the entire zone's contents,
          since a zone does not stretch to fill its 1/3 of the screen — it
          sits pinned to whichever edge its column/row dictates. Positive x
          moves right, negative x moves left; positive y moves up, negative
          y moves down — for every zone, regardless of which corner or edge
          it's in.
        </p>
        ${["top","middle","bottom"].map(o=>{const n=_GROUP_DEFS.filter(t=>t.vertical===o);return html`
            <div class="zone-band">
              <div class="zone-band-grid">
                <div class="zone-band-name">${o}</div>
                ${n.map(t=>html`<div class="zone-band-colheader">${t.horizontal[0].toUpperCase()}${t.horizontal.slice(1)}</div>`)}

                <div class="zone-band-rowlabel">Alignment</div>
                ${n.map(e=>{const i=`${e.vertical}-${e.horizontal}`;return ctSelectField("",t[i]??e.horizontal,this._zoneAlignmentOptions,t=>this._zoneAlignmentChanged(i,t))})}

                <div class="zone-band-rowlabel">Margins (x,y)</div>
                ${n.map(t=>{const o=`${t.vertical}-${t.horizontal}`;return html`
                    <div class="zone-offset-pair">
                      <chrono-ct-textfield
                        class="zone-offset-mini"
                        type="number" step="1"
                        .value=${String(e[o]??0)}
                        @input=${t=>this._zoneOffsetChanged("x",o,t)}
                      ></chrono-ct-textfield>
                      <chrono-ct-textfield
                        class="zone-offset-mini"
                        type="number" step="1"
                        .value=${String(i[o]??0)}
                        @input=${t=>this._zoneOffsetChanged("y",o,t)}
                      ></chrono-ct-textfield>
                    </div>
                  `})}
              </div>
            </div>
          `})}
      </ha-expansion-panel>
    `}_renderItemsPanel(){const t=this._config?.items??[],e=this._buildRows(t);return html`
      <ha-expansion-panel header="Items configuration" outlined>

        <ha-sortable handle-selector=".handle" @item-moved=${t=>this._itemMoved(t)}>
          <div class="items-list">
            ${repeat(e,t=>t.key,t=>{if("divider"===t.type)return html`
                  <div class="group-divider">
                    <span class="group-divider-label" style="color:${"#009ac7"}">${t.group.label}</span>
                    <div class="group-divider-line" style="background:${"#009ac7"}"></div>
                  </div>
                `;if("undo"===t.type)return html`
                  <div class="remove-item-row">
                    <button class="remove-item-btn" @click=${()=>this._undoRemove()}>
                      Undo remove
                    </button>
                  </div>
                `;const e=t.item,i=t.itemIndex,o="entity"in e,n=o?"Entity":"Template",r=o?"entity":"template",a=o?e.entity||`Entity ${i+1}`:e.template?e.template.length>30?e.template.slice(0,30)+"…":e.template:`Template ${i+1}`;return html`
                <ha-expansion-panel
                  outlined
                  data-item-id="${e._id}"
                  .expanded=${this._expandedItemId===e._id}
                  @expanded-changed=${t=>{this._expandedItemId=t.detail.value?e._id:null}}
                >

                  <div slot="header" class="item-header-slot">
                    <div class="item-header-content${!1===e.show?" item-hidden":""}">
                      ${""}
                      <span class="item-type-badge ${r}">${n}</span>
                      <span>${a}</span>
                    </div>
                    <button
                      class="item-visibility-btn"
                      title="${!1===e.show?"Show item":"Hide item"}"
                      @click=${t=>{t.stopPropagation(),this._itemToggled(i,"show",{target:{checked:!1===e.show}})}}
                    >
                      <ha-icon .icon=${!1===e.show?"mdi:eye-off-outline":"mdi:eye-outline"}></ha-icon>
                    </button>
                  </div>

                  <div class="handle" slot="leading-icon">
                    <ha-svg-icon .path=${mdiDragHorizontalVariant}></ha-svg-icon>
                  </div>

                  <!-- Position: vertical (top/middle/bottom) and horizontal (left/center/right) -->
                  <div class="item-position-row">
                    ${ctButtonPicker("",e.vertical??"middle",this._verticalOptions,t=>this._itemChanged(i,"vertical",t))}
                    ${ctButtonPicker("",e.horizontal??"center",this._horizontalOptions,t=>this._itemChanged(i,"horizontal",t))}
                  </div>

                  <!-- Entity ID or Template string -->
                  <div class="item-content-row">
                    ${o?ctTextField("Entity ID",e.entity??"",t=>this._itemChanged(i,"entity",t)):ctTextField('Template\n<i>supports Jinja2, e.g. {{ states("sensor.temp") }}</i>',e.template??"",t=>this._itemChanged(i,"template",t))}
                  </div>

                  <!-- Entity-only: icon override -->
                  ${o?html`
                    <div class="item-content-row">
                      ${ctTextField("Icon",e.icon??"",t=>this._itemChanged(i,"icon",t))}
                    </div>
                  `:""}

                  <!-- Entity-only: show state toggle -->
                  ${o?html`
                    <div class="item-toggles-row">
                      ${ctToggleField("Show state",e.show_state??!1,t=>this._itemToggled(i,"show_state",t))}
                    </div>
                  `:""}

                  <!-- Font family: combo-box, Google Fonts + DSEG, loaded on demand via Fontsource -->
                  <div class="item-content-row">
                    ${ctSelectField("Font family",e.font_family??"",this._fontFamilyOptions,t=>this._itemChanged(i,"font_family",t))}
                  </div>

                  <!-- Typography: font color, size, weight, line height, border radius -->
                  <div class="item-typography">
                    ${ctColorPicker("Font color",e.font_color??"",t=>this._itemChanged(i,"font_color",t))}
                    ${ctTextField("Font size",e.font_size??"",t=>this._itemChanged(i,"font_size",t),{type:"number",step:"0.1",min:"0"})}
                    ${ctTextField("Font weight",e.font_weight??"",t=>this._itemChanged(i,"font_weight",t),{type:"number",step:"100",min:"100",max:"900"})}
                    ${ctTextField("Line height",e.line_height??"",t=>this._itemChanged(i,"line_height",t),{type:"number",step:"0.1",min:"0"})}
                    ${ctTextField("Border radius",e.border_radius??"",t=>this._itemChanged(i,"border_radius",t),{type:"number",step:"1",min:"0"})}
                  </div>

                  <!-- Background color, padding (horizontal/vertical), margin (top/bottom) -->
                  <div class="item-bg-color-padding">
                    ${ctColorPicker("Background color",e.background_color??"",t=>this._itemChanged(i,"background_color",t))}
                    ${ctTextField("Vertical padding",e.padding_vertical??"",t=>this._itemChanged(i,"padding_vertical",t),{type:"number",step:"1",min:"0"})}
                    ${ctTextField("Horizontal padding",e.padding_horizontal??"",t=>this._itemChanged(i,"padding_horizontal",t),{type:"number",step:"1",min:"0"})}
                    ${ctTextField("Top margin",e.margin_top??"",t=>this._itemChanged(i,"margin_top",t),{type:"number",step:"1"})}
                    ${ctTextField("Bottom margin",e.margin_bottom??"",t=>this._itemChanged(i,"margin_bottom",t),{type:"number",step:"1"})}
                  </div>

                  <!-- Text shadow / stroke: color, blur, x/y offset, stroke width -->
                  <div class="item-text-shadow">
                    ${ctColorPicker("Shadow color",e.text_shadow_color??"",t=>this._itemChanged(i,"text_shadow_color",t))}
                    ${ctTextField("Shadow blur",e.text_shadow_blur??"",t=>this._itemChanged(i,"text_shadow_blur",t),{type:"number",step:"1",min:"0"})}
                    ${ctTextField("Shadow offset X",e.text_shadow_offset_x??"",t=>this._itemChanged(i,"text_shadow_offset_x",t),{type:"number",step:"1"})}
                    ${ctTextField("Shadow offset Y",e.text_shadow_offset_y??"",t=>this._itemChanged(i,"text_shadow_offset_y",t),{type:"number",step:"1"})}
                    ${ctTextField("Stroke width",e.text_shadow_stroke_width??"",t=>this._itemChanged(i,"text_shadow_stroke_width",t),{type:"number",step:"1",min:"0"})}
                  </div>

                  <!-- Remove button -->
                  <div class="remove-item-row">
                    <button class="remove-item-btn" @click=${()=>this._removeItem(i)}>
                      Remove item
                    </button>
                  </div>

                </ha-expansion-panel>
              `})}
          </div>
        </ha-sortable>

        <div class="add-item-row">
          <button class="add-item-btn" @click=${()=>this._addItem("entity")}>+ Add entity</button>
          <button class="add-item-btn" @click=${()=>this._addItem("template")}>+ Add template</button>
        </div>
      </ha-expansion-panel>
    `}static styles=css`

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

    .zone-offset-pair {
      display: flex;
      gap: 4px;
    }

    .zone-offset-mini {
      width: 0; /* flex-basis via flex:1 below — width:0 avoids intrinsic-content overflow */
      flex: 1;
    }

    /* Zones panel only: both the Alignment select and the Margins
       mini-fields share one uniform 48px row height — the select's own
       default (56px, used everywhere else in the editor) and a mini-field's
       natural size were too far apart from each other. */
    .zone-band-grid chrono-ct-select::part(combobox) {
      height: 48px;
    }

    .zone-offset-mini::part(input) {
      height: 48px;
      font-size: 13px;
      text-align: center;
      padding: 0 4px;
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

  `;render(){if(!this._config)return html``;const t=this._config;return html`

      <!-- ── Card configuration ──────────────────────────────────────────────── -->

      <ha-expansion-panel header="Card configuration" outlined .expanded=${!1}>

        <!-- Background color -->
        <div class="card-row-1">
          ${ctColorPicker("Background color",t.background_color??"#000000",t=>this._valueChanged("background_color",t))}
        </div>

        <!-- Dimmer -->
        <div class="card-row">
          ${ctToggleField("Ambient dimmer",t.dimmer_enabled??!1,t=>this._toggleChanged("dimmer_enabled",t),"",!0)}
        </div>
        ${t.dimmer_enabled?html`
        <div class="card-row-1">
          <ha-entity-picker
            label="Ambient lux sensor"
            .hass=${this.hass}
            .value=${t.dimmer_entity??""}
            allow-custom-entity
            @value-changed=${t=>this._valueChanged("dimmer_entity",t)}
          ></ha-entity-picker>
        </div>
        <div class="card-row-1">
          ${ctColorPicker("Dimmer color",t.dimmer_color??DEFAULT_CONFIG.dimmer_color,t=>this._valueChanged("dimmer_color",t))}
        </div>
        <div class="card-row">
          ${ctTextField("Minimum Ambient light (lux)",t.dimmer_lux_min??0,t=>this._numericValueChanged("dimmer_lux_min",t),{type:"number",step:"1",min:"0"})}
          ${ctTextField("Maximum Ambient light (lux)",t.dimmer_lux_max??40,t=>this._numericValueChanged("dimmer_lux_max",t),{type:"number",step:"1",min:"0"})}
        </div>
        <div class="card-row">
          ${ctTextField("Max opacity %",t.dimmer_opacity_max??80,t=>this._numericValueChanged("dimmer_opacity_max",t),{type:"number",step:"1",min:"0",max:"100"})}
          ${ctTextField("Min opacity %",t.dimmer_opacity_min??0,t=>this._numericValueChanged("dimmer_opacity_min",t),{type:"number",step:"1",min:"0",max:"100"})}
        </div>
        <div class="card-row-1">
          <div class="slider-field">
            <label class="slider-label">Aggressiveness: ${t.dimmer_aggressiveness??DEFAULT_CONFIG.dimmer_aggressiveness}%</label>
            <input type="range" min="1" max="100" step="1"
              .value=${String(t.dimmer_aggressiveness??DEFAULT_CONFIG.dimmer_aggressiveness)}
              @change=${t=>this._numericValueChanged("dimmer_aggressiveness",t)}
            />
          </div>
        </div>
        `:""}

      </ha-expansion-panel>

      <!-- ── Zones panel ──────────────────────────────────────────────────────── -->

      ${this._renderZonesPanel()}

      <!-- ── Items panel ──────────────────────────────────────────────────────── -->

      ${this._renderItemsPanel()}

    `}}customElements.define("chrono-tile-card-editor",ChronoTileCardEditor);class ChronoTileCard extends LitElement{static properties={_config:{attribute:!1},_itemValues:{state:!0}};static getCardSize(){return 3}static getConfigElement(){return document.createElement("chrono-tile-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG,items:[{...DEFAULT_TEMPLATE_ITEM,_id:generateId([]),show:!0,horizontal:"center",vertical:"middle",icon:"",show_state:!1,font_color:"#808080",font_size:12,font_weight:400,line_height:1.2,border_radius:50,background_color:"",padding_vertical:10,padding_horizontal:10,margin_top:"",margin_bottom:"",text_shadow_color:"",text_shadow_blur:0,text_shadow_offset_x:0,text_shadow_offset_y:0,text_shadow_stroke_width:0,text_shadow_layers:2,template:"{{ now().strftime('%H:%M') }}"}]}}constructor(){super(),this._config=null,this._hass=null,this._itemValues={},this._itemSubs=new Map,this._subscribed=!1,this._holdTimer=null,this._holdFired=!1,this._lastTapTime=0,this._pendingTapTimer=null,this._touchStartX=null,this._touchStartY=null,this._resizeObserver=null,this._observedCardEl=null}set hass(t){const e=this._hass;this._hass=t,this._config&&this._setupSubscriptions(),this._hassShouldRender(e,t)&&this.requestUpdate()}get hass(){return this._hass}_hassShouldRender(t,e){if(!t||!e)return!0;const i=this._config;if(!i)return!0;if(t.locale!==e.locale||t.formatEntityState!==e.formatEntityState)return!0;const o=new Set;i.dimmer_entity&&o.add(i.dimmer_entity);for(const t of i.items??[])t.entity&&o.add(t.entity);for(const i of o)if(t.states?.[i]!==e.states?.[i])return!0;return!1}setConfig(t){({config:t}=migrateConfig(t)),this._config=t,this._hass&&this._setupSubscriptions()}connectedCallback(){super.connectedCallback(),this._hass&&this._config&&!this._subscribed&&this._setupSubscriptions(),this.style.setProperty("--editor-preview-aspect-ratio",isInsideEditDialog(this)?"16 / 10":"auto"),this.style.setProperty("--editor-preview-height",isInsideEditDialog(this)?"auto":"100%")}updated(t){super.updated(t);const e=this.shadowRoot?.querySelector("ha-card");e&&e!==this._observedCardEl&&(this._resizeObserver?.disconnect(),this._observedCardEl=e,this._resizeObserver=new ResizeObserver(t=>{const e=t[0]?.contentRect?.height;e&&this.style.setProperty("--scale-factor",e/400)}),this._resizeObserver.observe(e))}disconnectedCallback(){super.disconnectedCallback(),this._teardownSubscriptions(),this._resizeObserver?.disconnect(),this._resizeObserver=null,this._observedCardEl=null}_setupSubscriptions(){this._itemSubs||(this._itemSubs=new Map);const t=this._config?.items??[],e=this._config??{},i=new Set,o=t=>t.replace(/_([a-z])/g,(t,e)=>e.toUpperCase()),n={},r=new Set(["zone_alignment","items"]);for(const t of Object.keys(DEFAULT_CONFIG)){if(r.has(t))continue;const i="card"+o(t).replace(/^./,t=>t.toUpperCase());n[i]=e[t]??DEFAULT_CONFIG[t]}n.cardDimmerOpacity=Math.round(1e3*this._computeDimmerOpacity())/10,t.forEach((t,e)=>{if(!("template"in t))return;const o=`item-${e}`;i.add(o);const{text:r,fullyLiteral:a}=substituteCardVariables(t.template??"",n),s=this._itemSubs.get(o);if(s&&s.substituted===r)return;if(s?.unsub&&this._unsubscribeOne(s.unsub),a)return this._itemValues={...this._itemValues,[o]:r},void this._itemSubs.set(o,{substituted:r,unsub:null});const l=this._hass.connection.subscribeMessage(t=>{this._itemValues={...this._itemValues,[o]:t.result}},{type:"render_template",template:r});this._itemSubs.set(o,{substituted:r,unsub:l})});for(const[t,e]of[...this._itemSubs.entries()])if(!i.has(t)){e.unsub&&this._unsubscribeOne(e.unsub),this._itemSubs.delete(t);const{[t]:i,...o}=this._itemValues;this._itemValues=o}this._subscribed=!0}_unsubscribeOne(t){Promise.resolve(t).then(t=>{"function"==typeof t&&t()}).catch(()=>{})}_teardownSubscriptions(){if(this._itemSubs){for(const t of this._itemSubs.values())t.unsub&&this._unsubscribeOne(t.unsub);this._itemSubs.clear()}this._subscribed=!1}_handleAction(t,e="tap"){this._hass&&handleAction(this,this._hass,t,e)}_onPointerDown(t){t.currentTarget.setPointerCapture(t.pointerId),this._touchStartX=t.clientX,this._touchStartY=t.clientY,this._holdFired=!1,this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=setTimeout(()=>{this._holdFired=!0,this._handleAction(this._config,"hold")},500)}_onPointerUp(t){if(null===this._touchStartX)return;const e=t.clientX-this._touchStartX,i=t.clientY-this._touchStartY;this._touchStartX=null,this._touchStartY=null,this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null);const o=Math.abs(e)>=40&&Math.abs(e)>=Math.abs(i),n=Math.abs(i)>=40&&Math.abs(i)>Math.abs(e);if(o)return void(this._holdFired||this._handleAction(this._config,e<0?"swipe_left":"swipe_right"));if(n)return void(this._holdFired||this._handleAction(this._config,i<0?"swipe_up":"swipe_down"));if(this._holdFired)return;const r=Date.now();if(r-this._lastTapTime<250)return this._lastTapTime=0,this._pendingTapTimer&&(clearTimeout(this._pendingTapTimer),this._pendingTapTimer=null),void this._handleAction(this._config,"double_tap");this._lastTapTime=r,this._pendingTapTimer&&clearTimeout(this._pendingTapTimer),this._pendingTapTimer=setTimeout(()=>{this._pendingTapTimer=null,this._handleAction(this._config,"tap")},250)}_onPointerCancel(){this._touchStartX=null,this._touchStartY=null,this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null)}_onPointerMove(t){if(null===this._touchStartX||!this._holdTimer)return;const e=t.clientX-this._touchStartX,i=t.clientY-this._touchStartY;(Math.abs(e)>=40||Math.abs(i)>=40)&&(clearTimeout(this._holdTimer),this._holdTimer=null)}_computeDimmerOpacity(){const t=this._config,e=t.dimmer_entity??"";if(!e)return 0;const i=this._hass?.states?.[e],o=i?parseFloat(i.state):0;if(isNaN(o))return 0;const n=t.dimmer_lux_min??DEFAULT_CONFIG.dimmer_lux_min,r=t.dimmer_lux_max??DEFAULT_CONFIG.dimmer_lux_max,a=(t.dimmer_opacity_min??DEFAULT_CONFIG.dimmer_opacity_min)/100,s=(t.dimmer_opacity_max??DEFAULT_CONFIG.dimmer_opacity_max)/100,l=t.dimmer_aggressiveness??DEFAULT_CONFIG.dimmer_aggressiveness,c=Math.pow(10,(l-50)/50);if(r<=n)return s;const d=Math.max(0,Math.min(1,(o-n)/(r-n)));return s+(a-s)*Math.pow(d,.33*c)}_itemStyleMap(t){const e=t=>""!==t&&null!=t?`calc(${t}px * var(--scale-factor, 1))`:void 0,i=t=>""!==t&&null!=t?`${t}`:void 0,o=_FONT_OPTION_BY_VALUE.get(t.font_family);return{color:t.font_color||void 0,"font-family":(o?o.family:t.font_family)||void 0,"font-style":o?.italic?"italic":void 0,"font-size":(n=t.font_size,""!==n&&null!=n?`calc(${n}em * var(--scale-factor, 1))`:void 0),"font-weight":i(t.font_weight),"line-height":i(t.line_height),"border-radius":e(t.border_radius),"background-color":t.background_color||void 0,"padding-top":e(t.padding_vertical),"padding-bottom":e(t.padding_vertical),"padding-left":e(t.padding_horizontal),"padding-right":e(t.padding_horizontal),"margin-top":e(t.margin_top),"margin-bottom":e(t.margin_bottom),"text-shadow":t.text_shadow_color&&""!==t.text_shadow_offset_x&&""!==t.text_shadow_offset_y?Array(Math.max(1,Number(t.text_shadow_layers??2)||1)).fill(`${e(t.text_shadow_offset_x??0)} ${e(t.text_shadow_offset_y??0)} ${e(t.text_shadow_blur??0)} ${t.text_shadow_color}`).join(", "):void 0,"-webkit-text-stroke-width":t.text_shadow_color?e(t.text_shadow_stroke_width??0):void 0,"-webkit-text-stroke-color":t.text_shadow_color||void 0};var n}_renderItem(t){if(!1===t.show)return html``;if(ensureFontLoaded(t.font_family),"template"in t){const e=`item-${this._config.items.indexOf(t)}`,i=this._itemValues[e]??"",o=t.tap_action&&"none"!==t.tap_action.action;return html`
        <span
          class="overlay-template-item${o?" clickable":""}"
          style=${styleMap(this._itemStyleMap(t))}
          @click=${o?()=>this._handleAction(t):void 0}
        >${i}</span>
      `}if("entity"in t){const e=this._hass?.states?.[t.entity];if(!e)return html`
          <span class="overlay-entity-missing" title="Entity not found: ${t.entity}">!</span>
        `;const i={...t,entity:t.entity},o=t.show_state?t.attribute?`${t.prefix??""}${e.attributes?.[t.attribute]??""}${t.suffix??""}`:this._hass?.formatEntityState?this._hass.formatEntityState(e):e.state:"";return html`
        <div
          class="overlay-entity-item"
          style=${styleMap(this._itemStyleMap(t))}
          title="${e.attributes.friendly_name??t.entity}: ${e.state}"
          @click=${t=>{t.stopPropagation(),this._handleAction(i)}}
        >
          <ha-state-icon
            .hass=${this._hass}
            .stateObj=${e}
            .icon=${t.icon||void 0}
          ></ha-state-icon>
          ${t.show_state?html`<span class="entity-state-label">${o}</span>`:""}
        </div>
      `}return html``}_renderZoneItems(t,e){const i=(this._config?.items??[]).filter(i=>(i.horizontal??"center")===e&&(i.vertical??"middle")===t);if(0===i.length)return html``;const o=`${t}-${e}`,n=this._config?.zone_alignment?.[o]??DEFAULT_ZONE_ALIGNMENT[o]??e,r=this._config?.zone_offset_x?.[o]??DEFAULT_ZONE_OFFSET_X[o]??0,a=this._config?.zone_offset_y?.[o]??DEFAULT_ZONE_OFFSET_Y[o]??0;return html`
      <div
        class="overlay-zone overlay-zone-align-${n}"
        style="transform: translate(calc(${r}px * var(--scale-factor, 1)), calc(${-a}px * var(--scale-factor, 1)));"
      >
        ${i.map(t=>this._renderItem(t))}
      </div>
    `}_renderZoneGrid(){const t=["top","middle","bottom"].map(t=>{const e=["left","center","right"].map(e=>html`<div class="overlay-cell">${this._renderZoneItems(t,e)}</div>`);return html`<div class="overlay-row">${e}</div>`});return html`<div class="overlay-grid">${t}</div>`}static styles=css`
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
  `;render(){if(!this._config)return html``;const t=this._config;return html`
      <ha-card>
        <div
          class="tile-container"
          style=${styleMap({"background-color":t.background_color||void 0})}
          @pointerdown=${t=>this._onPointerDown(t)}
          @pointermove=${t=>this._onPointerMove(t)}
          @pointerup=${t=>this._onPointerUp(t)}
          @pointercancel=${()=>this._onPointerCancel()}
        >
          ${this._renderZoneGrid()}

          ${t.dimmer_enabled&&t.dimmer_entity?html`
            <div class="dimmer-overlay" style="
              background-color: ${t.dimmer_color??DEFAULT_CONFIG.dimmer_color};
              opacity: ${this._computeDimmerOpacity()};
            "></div>
          `:""}
        </div>
      </ha-card>
    `}}customElements.define("chrono-tile-card",ChronoTileCard),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-tile-card",name:"Chrono Tile Card",description:"A 9-zone grid of templated or entity-driven tiles, with an ambient-light dimmer overlay.",preview:!0});