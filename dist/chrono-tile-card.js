import{LitElement,html,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";import{styleMap}from"https://unpkg.com/lit@2.0.0/directives/style-map.js?module";import{unsafeHTML}from"https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module";import{repeat}from"https://unpkg.com/lit@2.0.0/directives/repeat.js?module";const CARD_VERSION="1.0.7",mdiDragHorizontalVariant="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z";console.info("%c CHRONO-%cTILE%c-CARD %c v1.0.7 ","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 0 2px 4px; border-radius: 3px 0 0 3px;","background-color: #101010; color: #4676d3; font-weight: bold; padding: 2px 0;","background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 4px 2px 0;","background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");const DEFAULT_ITEM={_id:"",show:!0,horizontal:"center",vertical:"middle",icon:"",show_state:!1,font_color:"",font_family:"DSEG14 Modern",font_size:1.2,font_weight:600,line_height:1.2,border_radius:50,background_color:"",padding_top:10,padding_bottom:10,padding_left:10,padding_right:10,text_shadow_color:"",text_shadow_blur:0,text_shadow_offset_x:0,text_shadow_offset_y:0,text_shadow_stroke_width:0,text_shadow_layers:2},DEFAULT_ENTITY_ITEM={...DEFAULT_ITEM,entity:""},DEFAULT_TEMPLATE_ITEM={...DEFAULT_ITEM,template:""},DEFAULT_ZONE_ALIGNMENT={"top-left":"left","top-center":"center","top-right":"right","middle-left":"left","middle-center":"center","middle-right":"right","bottom-left":"left","bottom-center":"center","bottom-right":"right"},REFERENCE_HEIGHT_PX=400,EDITOR_PREVIEW_ASPECT_RATIO="16 / 10";function isInsideEditDialog(e){let t=e;for(;t;){if("HA-DIALOG"===t.tagName)return!0;t=t.parentElement||t.getRootNode()?.host}return!1}const HOLD_MS=500,DOUBLE_TAP_MS=250,SWIPE_THRESHOLD=40,DEFAULT_CONFIG={letterbox_color:"#000000",dimmer_enabled:!1,dimmer_entity:"",dimmer_lux_min:0,dimmer_lux_max:40,dimmer_min_opacity:0,dimmer_max_opacity:80,dimmer_color:"#000000",dimmer_aggressiveness:50,zone_alignment:{...DEFAULT_ZONE_ALIGNMENT},items:[]},NUMERIC_ITEM_KEYS=new Set(["font_size","font_weight","line_height","border_radius","padding_top","padding_bottom","padding_left","padding_right","text_shadow_blur","text_shadow_offset_x","text_shadow_offset_y","text_shadow_stroke_width"]),VERTICAL_OPTIONS=[{label:"Top",value:"top"},{label:"Middle",value:"middle"},{label:"Bottom",value:"bottom"}],HORIZONTAL_OPTIONS=[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"}],ZONE_ALIGNMENT_OPTIONS=[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"}],FONT_OPTIONS=[{label:"Theme default",value:"",slug:""},{label:"DSEG14 Modern",value:"DSEG14 Modern",slug:"dseg14-modern"},{label:"DSEG7 Modern",value:"DSEG7 Modern",slug:"dseg7-modern"},{label:"DSEG14 Classic",value:"DSEG14 Classic",slug:"dseg14-classic"},{label:"DSEG7 Classic",value:"DSEG7 Classic",slug:"dseg7-classic"},{label:"DSEG14 Modern Mini",value:"DSEG14 Modern Mini",slug:"dseg14-modern-mini"},{label:"DSEG7 Modern Mini",value:"DSEG7 Modern Mini",slug:"dseg7-modern-mini"},{label:"Roboto",value:"Roboto",slug:"roboto"},{label:"Open Sans",value:"Open Sans",slug:"open-sans"},{label:"Montserrat",value:"Montserrat",slug:"montserrat"},{label:"Poppins",value:"Poppins",slug:"poppins"},{label:"Inter",value:"Inter",slug:"inter"},{label:"Oswald",value:"Oswald",slug:"oswald"},{label:"Rajdhani",value:"Rajdhani",slug:"rajdhani"},{label:"Orbitron",value:"Orbitron",slug:"orbitron"},{label:"Share Tech Mono",value:"Share Tech Mono",slug:"share-tech-mono"},{label:"VT323",value:"VT323",slug:"vt323"},{label:"Press Start 2P",value:"Press Start 2P",slug:"press-start-2p"}],_FONT_SLUG_BY_FAMILY=new Map(FONT_OPTIONS.filter(e=>e.slug).map(e=>[e.value,e.slug])),_injectedFonts=new Set;function ensureFontLoaded(e){if(!e||_injectedFonts.has(e))return;const t=_FONT_SLUG_BY_FAMILY.get(e);if(!t)return;_injectedFonts.add(e);const i=document.createElement("link");i.rel="stylesheet",i.href=`https://cdn.jsdelivr.net/npm/@fontsource/${t}/400.css`,document.head.appendChild(i)}const SHOW_ITEM_POSITION_BADGES=!1,VERTICAL_BADGE_COLORS={top:"#ac00ac",middle:"#c77c00",bottom:"#0600ff"},HORIZONTAL_BADGE_COLORS={left:"#bb9e00",center:"#10a800",right:"#00a896"},GROUP_DIVIDER_COLOR="#009ac7",_GROUP_DEFS=[{vertical:"top",horizontal:"left",label:"Top · Left"},{vertical:"top",horizontal:"center",label:"Top · Center"},{vertical:"top",horizontal:"right",label:"Top · Right"},{vertical:"middle",horizontal:"left",label:"Middle · Left"},{vertical:"middle",horizontal:"center",label:"Middle · Center"},{vertical:"middle",horizontal:"right",label:"Middle · Right"},{vertical:"bottom",horizontal:"left",label:"Bottom · Left"},{vertical:"bottom",horizontal:"center",label:"Bottom · Center"},{vertical:"bottom",horizontal:"right",label:"Bottom · Right"}],_GROUP_ORDER=_GROUP_DEFS.map(e=>`${e.vertical}-${e.horizontal}`);function sortItems(e){const t=e=>`${e.vertical??"middle"}-${e.horizontal??"center"}`;return[...e].sort((e,i)=>_GROUP_ORDER.indexOf(t(e))-_GROUP_ORDER.indexOf(t(i)))}function generateId(e=[]){const t=new Set(e.map(e=>e._id));let i;do{i=Math.random().toString(16).slice(2,10)}while(t.has(i));return i}function migrateConfig(e){let t=!1;if(e.items?.some(e=>!e._id)){const i=[];for(const t of e.items)i.push(t._id?t:{...t,_id:generateId(e.items.concat(i))});e={...e,items:i},t=!0}const i=e.zone_alignment??{};return Object.keys(DEFAULT_ZONE_ALIGNMENT).some(e=>!(e in i))&&(e={...e,zone_alignment:{...DEFAULT_ZONE_ALIGNMENT,...i}},t=!0),{config:e,migrated:t}}function fireEvent(e,t,i={},o={}){const n=new Event(t,{bubbles:o.bubbles??!0,cancelable:Boolean(o.cancelable),composed:o.composed??!0});return n.detail=i,e.dispatchEvent(n),n}function navigate(e,t={}){t.replace?history.replaceState(null,"",e):history.pushState(null,"",e),fireEvent(window,"location-changed",{replace:t.replace??!1})}function toggleEntity(e,t){t&&e.callService("homeassistant","toggle",{entity_id:t})}function handleAction(e,t,i,o){let n;switch("double_tap"===o&&i.double_tap_action?n=i.double_tap_action:"hold"===o&&i.hold_action?n=i.hold_action:"tap"===o&&i.tap_action?n=i.tap_action:"swipe_up"===o&&i.swipe_up_action?n=i.swipe_up_action:"swipe_down"===o&&i.swipe_down_action?n=i.swipe_down_action:"swipe_left"===o&&i.swipe_left_action?n=i.swipe_left_action:"swipe_right"===o&&i.swipe_right_action&&(n=i.swipe_right_action),n||(n={action:"none"}),n.action){case"none":default:break;case"more-info":fireEvent(e,"hass-more-info",{entityId:n.entity??i.entity});break;case"navigate":n.navigation_path&&navigate(n.navigation_path,{replace:n.navigation_replace});break;case"url":n.url_path&&window.open(n.url_path,"_blank");break;case"toggle":toggleEntity(t,i.entity);break;case"perform-action":case"call-service":{const e=n.perform_action??n.service;if(!e)break;const[i,o]=e.split(".",2);if(!i||!o)break;t.callService(i,o,n.data??n.service_data,n.target);break}case"fire-dom-event":fireEvent(e,"ll-custom",n)}}const _TEMPLATE_EXPR_RE=/\{\{(.*?)\}\}/gs,_IDENTIFIER_RE=/[A-Za-z_][A-Za-z0-9_]*/g;function _jinjaLiteral(e){if(null==e)return"''";const t=String(e);return""===t?"''":/^-?\d+(\.\d+)?$/.test(t)||"true"===t||"false"===t?t:`'${t.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}function substituteCardVariables(e,t){const i=String(e??"");if(!i.includes("{{")||!t)return{text:i,fullyLiteral:!i.includes("{{")};let o=!0;const n=[];i.replace(_TEMPLATE_EXPR_RE,(e,i)=>{const r=i.trim(),a=/^[A-Za-z_][A-Za-z0-9_]*$/.test(r)&&Object.prototype.hasOwnProperty.call(t,r);return a||(o=!1),n.push({inner:i,isCardField:a,field:a?r:null}),e});let r=0;if(o){return{text:i.replace(_TEMPLATE_EXPR_RE,()=>{const{field:e}=n[r++],i=t[e];return null==i?"":String(i)}),fullyLiteral:!0}}return{text:i.replace(_TEMPLATE_EXPR_RE,(e,i)=>`{{${i.replace(_IDENTIFIER_RE,e=>Object.prototype.hasOwnProperty.call(t,e)?_jinjaLiteral(t[e]):e)}}}`),fullyLiteral:!1}}function ctParseNumber(e){const t=String(e).replace(",",".");if("-"===t||"-0"===t||t.endsWith("."))return null;if(""===t)return"";const i=parseFloat(t);return isNaN(i)||String(i)!==t?null:i}function ctTextField(e,t,i,o={}){return html`
    <div class="text-field">
      <label>${unsafeHTML(e)}</label>
      <chrono-ct-textfield
        .value=${String(t??"")}
        type=${o.type??"text"}
        step=${o.step??""}
        min=${o.min??""}
        max=${o.max??""}
        @input=${i}
      ></chrono-ct-textfield>
    </div>
  `}function ctToggleField(e,t,i,o="",n=!1){return html`
    <div class="toggle-field ${o}">
      ${n?html`<label class="toggle-field-spacer" aria-hidden="true">&nbsp;</label>`:""}
      <div class="toggle-field-row">
        <label>${unsafeHTML(e)}</label>
        <ha-switch .checked=${t} @change=${i}></ha-switch>
      </div>
    </div>
  `}function toSwatchHex(e){const t=String(e??"").trim();return/^#[0-9a-fA-F]{3}$/.test(t)||/^#[0-9a-fA-F]{6}$/.test(t)?t:/^#[0-9a-fA-F]{8}$/.test(t)?t.slice(0,7):"#000000"}function ctColorPicker(e,t,i){const o=toSwatchHex(t);return html`
    <div class="text-field">
      <label>${unsafeHTML(e)}</label>
      <div class="color-picker-row">
        <input type="color" .value=${o} @input=${i}>
        <chrono-ct-textfield
          .value=${String(t??"")}
          @input=${i}
        ></chrono-ct-textfield>
      </div>
    </div>
  `}function ctSelectField(e,t,i,o){return html`
    <div class="text-field">
      ${e?html`<label>${unsafeHTML(e)}</label>`:""}
      <chrono-ct-select
        .value=${t??""}
        .options=${i}
        @change=${o}
      ></chrono-ct-select>
    </div>
  `}function ctButtonPicker(e,t,i,o,n="",r=""){return html`
    <div class="button-picker-field ${r}" style=${"end"===n?"justify-self:end":""}>
      <label>${unsafeHTML(e)}</label>
      <chrono-ct-button-toggle-group
        .value=${t}
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
        .value=${live(this.value??"")}
        type=${this.type??"text"}
        step=${this.step??""}
        min=${this.min??""}
        max=${this.max??""}
        placeholder=${this.placeholder??""}
        @input=${e=>{this.value=e.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}
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
        @input=${e=>{this.value=e.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}
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
  `;render(){const e=this.options??[];return html`${e.map((t,i)=>{const o=1===e.length,n=0===i,r=i===e.length-1,a=[t.value===this.value?"active":"",o?"only":n?"first":r?"last":""].filter(Boolean).join(" ");return html`
        <button class="${a}" @click=${()=>this._select(t.value)}>${t.label}</button>
      `})}`}_select(e){this.value=e,this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}focus(){this.shadowRoot?.querySelector("button")?.focus()}}customElements.define("chrono-ct-button-toggle-group",CtButtonToggleGroup);class CtSelect extends LitElement{static properties={value:{type:String},options:{type:Array},_open:{state:!0},_cursor:{state:!0}};static styles=css`
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
  `;constructor(){super(),this.value="",this.options=[],this._open=!1,this._cursor=-1,this._onOutsideClick=this._onOutsideClick.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onOutsideClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onOutsideClick)}_onOutsideClick(e){this.shadowRoot.contains(e.composedPath()[0])||e.composedPath()[0]===this||(this._open=!1,this._cursor=-1)}_select(e){this.value=e,this._open=!1,this._cursor=-1,this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}_handleKeyDown(e){const t=this.options??[];this._open?"ArrowDown"===e.key?(this._cursor=Math.min(this._cursor+1,t.length-1),e.preventDefault()):"ArrowUp"===e.key?(this._cursor=Math.max(this._cursor-1,0),e.preventDefault()):"Enter"===e.key?(this._cursor>=0&&this._cursor<t.length&&this._select(t[this._cursor].value),e.preventDefault()):"Escape"===e.key&&(this._open=!1,this._cursor=-1,e.preventDefault()):"ArrowDown"!==e.key&&"ArrowUp"!==e.key||(this._open=!0,this._cursor=0,e.preventDefault())}render(){const e=this.options??[];return html`
      <div class="combobox ${this._open?"combobox-open":""}">
        <input
          class="combobox-input"
          .value=${live(this.value??"")}
          @input=${e=>{this.dispatchEvent(new CustomEvent("change",{detail:{value:e.target.value},bubbles:!0,composed:!0}))}}
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
          ${e.map((e,t)=>html`
            <div
              class="combobox-option
                     ${e.value===this.value?"combobox-option-selected":""}
                     ${t===this._cursor?"combobox-option-cursor":""}"
              @mousedown=${t=>{t.preventDefault(),this._select(e.value)}}
            >${e.label}</div>
          `)}
        </div>
      `:""}
    `}focus(){this.shadowRoot?.querySelector(".combobox-input")?.focus()}}customElements.define("chrono-ct-select",CtSelect);class ChronoTileCardEditor extends LitElement{static properties={hass:{attribute:!1},_config:{state:!0},_expandedItemId:{state:!0},_removedItem:{state:!0}};setConfig(e){const{config:t,migrated:i}=migrateConfig(e);this._config=t,i&&this._fireConfig()}_fireConfig(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_valueChanged(e,t){if(!this._config)return;this._clearUndo();const i=t.target.value??t.detail?.value;this._config={...this._config,[e]:i},this._fireConfig()}_numericValueChanged(e,t){if(!this._config)return;this._clearUndo();const i=ctParseNumber(t.target.value??t.detail?.value);null!==i&&(this._config={...this._config,[e]:i},this._fireConfig())}_toggleChanged(e,t){if(!this._config)return;this._clearUndo();const i=t.target.checked;this._config={...this._config,[e]:i},this._fireConfig()}_zoneAlignmentChanged(e,t){if(!this._config)return;this._clearUndo();const i=t.target.value??t.detail?.value,o={...this._config.zone_alignment??DEFAULT_ZONE_ALIGNMENT,[e]:i};this._config={...this._config,zone_alignment:o},this._fireConfig()}_itemChanged(e,t,i){if(!this._config)return;this._clearUndo();const o=i.target.value??i.detail?.value;let n;if(NUMERIC_ITEM_KEYS.has(t)){const e=ctParseNumber(o);if(null===e)return;n=e}else n=o;let r=[...this._config.items??[]];r[e]={...r[e],[t]:n},"horizontal"!==t&&"vertical"!==t||(r=sortItems(r)),this._config={...this._config,items:r},this._fireConfig()}_itemToggled(e,t,i){if(!this._config)return;this._clearUndo();const o=i.target.checked,n=[...this._config.items??[]];n[e]={...n[e],[t]:o},this._config={...this._config,items:n},this._fireConfig()}_addItem(e){const t=this._config.items??[];let i="";if("entity"===e){const e=this.hass?.states??{};i=Object.keys(e).find(e=>e.startsWith("light."))??Object.keys(e)[0]??""}else i="{{ now().strftime('%H:%M') }}";const o="entity"===e?{...DEFAULT_ENTITY_ITEM,_id:generateId(t),entity:i}:{...DEFAULT_TEMPLATE_ITEM,_id:generateId(t),template:i},n=sortItems([...t,o]);this._expandedItemId=o._id,this._removedItem=null,this._config={...this._config,items:n},this._fireConfig(),this.updateComplete.then(async()=>{const e=this.shadowRoot?.querySelector(`[data-item-id="${o._id}"]`);e&&(await e.updateComplete,e.scrollIntoView({behavior:"smooth",block:"nearest"}),e.querySelector("chrono-ct-textfield")?.focus())})}_removeItem(e){const t=[...this._config.items??[]];this._removedItem={item:t[e],index:e},this._config={...this._config,items:t.filter((t,i)=>i!==e)},this._fireConfig()}_undoRemove(){if(!this._removedItem)return;const{item:e,index:t}=this._removedItem,i=[...this._config.items??[]];i.splice(t,0,e),this._removedItem=null,this._config={...this._config,items:i},this._fireConfig()}_clearUndo(){this._removedItem&&(this._removedItem=null)}_buildRows(e){const t=[];let i=0;for(const o of _GROUP_DEFS)t.push({type:"divider",group:o,key:`divider-${o.vertical}-${o.horizontal}`}),e.forEach((e,n)=>{(e.vertical??"middle")===o.vertical&&(e.horizontal??"center")===o.horizontal&&(this._removedItem&&i===this._removedItem.index&&t.push({type:"undo",key:"undo-remove"}),t.push({type:"item",item:e,itemIndex:n,key:e._id}),i++)});return this._removedItem&&i===this._removedItem.index&&t.push({type:"undo",key:"undo-remove"}),t}_itemMoved(e){e.stopPropagation(),this._clearUndo();const{oldIndex:t,newIndex:i}=e.detail,o=[...this._config.items??[]],n=this._buildRows(o);if(!n[t]||"item"!==n[t].type)return;n.splice(i,0,n.splice(t,1)[0]);let r=_GROUP_DEFS[0];const a=[];for(const e of n)"divider"!==e.type?a.push({...e.item,vertical:r.vertical,horizontal:r.horizontal}):r=e.group;this._config={...this._config,items:a},this._fireConfig()}_verticalOptions=VERTICAL_OPTIONS;_horizontalOptions=HORIZONTAL_OPTIONS;_fontFamilyOptions=FONT_OPTIONS;_zoneAlignmentOptions=ZONE_ALIGNMENT_OPTIONS;_renderZonesPanel(){const e=this._config?.zone_alignment??DEFAULT_ZONE_ALIGNMENT;return html`
      <ha-expansion-panel header="Zones configuration" outlined .expanded=${!1}>
        <p class="zone-modes-hint">
          Alignment controls how multiple items stacked in the same zone align
          relative to each other — independent from which screen position the
          zone itself occupies.
        </p>
        ${["top","middle","bottom"].map(t=>{const i=_GROUP_DEFS.filter(e=>e.vertical===t);return html`
            <div class="zone-band">
              <div class="zone-band-grid">
                <div class="zone-band-name">${t}</div>
                ${i.map(e=>html`<div class="zone-band-colheader">${e.horizontal[0].toUpperCase()}${e.horizontal.slice(1)}</div>`)}

                <div class="zone-band-rowlabel">Alignment</div>
                ${i.map(t=>{const i=`${t.vertical}-${t.horizontal}`;return ctSelectField("",e[i]??t.horizontal,this._zoneAlignmentOptions,e=>this._zoneAlignmentChanged(i,e))})}
              </div>
            </div>
          `})}
      </ha-expansion-panel>
    `}_renderItemsPanel(){const e=this._config?.items??[],t=this._buildRows(e);return html`
      <ha-expansion-panel header="Items configuration" outlined>

        <ha-sortable handle-selector=".handle" @item-moved=${e=>this._itemMoved(e)}>
          <div class="items-list">
            ${repeat(t,e=>e.key,e=>{if("divider"===e.type)return html`
                  <div class="group-divider">
                    <span class="group-divider-label" style="color:${"#009ac7"}">${e.group.label}</span>
                    <div class="group-divider-line" style="background:${"#009ac7"}"></div>
                  </div>
                `;if("undo"===e.type)return html`
                  <div class="remove-item-row">
                    <button class="remove-item-btn" @click=${()=>this._undoRemove()}>
                      Undo remove
                    </button>
                  </div>
                `;const t=e.item,i=e.itemIndex,o="entity"in t,n=o?"Entity":"Template",r=o?"entity":"template",a=o?t.entity||`Entity ${i+1}`:t.template?t.template.length>30?t.template.slice(0,30)+"…":t.template:`Template ${i+1}`;return html`
                <ha-expansion-panel
                  outlined
                  data-item-id="${t._id}"
                  .expanded=${this._expandedItemId===t._id}
                  @expanded-changed=${e=>{this._expandedItemId=e.detail.value?t._id:null}}
                >

                  <div slot="header" class="item-header-slot">
                    <div class="item-header-content${!1===t.show?" item-hidden":""}">
                      ${""}
                      <span class="item-type-badge ${r}">${n}</span>
                      <span>${a}</span>
                    </div>
                    <button
                      class="item-visibility-btn"
                      title="${!1===t.show?"Show item":"Hide item"}"
                      @click=${e=>{e.stopPropagation(),this._itemToggled(i,"show",{target:{checked:!1===t.show}})}}
                    >
                      <ha-icon .icon=${!1===t.show?"mdi:eye-off-outline":"mdi:eye-outline"}></ha-icon>
                    </button>
                  </div>

                  <div class="handle" slot="leading-icon">
                    <ha-svg-icon .path=${mdiDragHorizontalVariant}></ha-svg-icon>
                  </div>

                  <!-- Position: vertical (top/middle/bottom) and horizontal (left/center/right) -->
                  <div class="item-position-row">
                    ${ctButtonPicker("",t.vertical??"middle",this._verticalOptions,e=>this._itemChanged(i,"vertical",e))}
                    ${ctButtonPicker("",t.horizontal??"center",this._horizontalOptions,e=>this._itemChanged(i,"horizontal",e))}
                  </div>

                  <!-- Entity ID or Template string -->
                  <div class="item-content-row">
                    ${o?ctTextField("Entity ID",t.entity??"",e=>this._itemChanged(i,"entity",e)):ctTextField('Template\n<i>supports Jinja2, e.g. {{ states("sensor.temp") }}</i>',t.template??"",e=>this._itemChanged(i,"template",e))}
                  </div>

                  <!-- Entity-only: icon override -->
                  ${o?html`
                    <div class="item-content-row">
                      ${ctTextField("Icon",t.icon??"",e=>this._itemChanged(i,"icon",e))}
                    </div>
                  `:""}

                  <!-- Entity-only: show state toggle -->
                  ${o?html`
                    <div class="item-toggles-row">
                      ${ctToggleField("Show state",t.show_state??!1,e=>this._itemToggled(i,"show_state",e))}
                    </div>
                  `:""}

                  <!-- Font family: combo-box, Google Fonts + DSEG, loaded on demand via Fontsource -->
                  <div class="item-content-row">
                    ${ctSelectField("Font family",t.font_family??"",this._fontFamilyOptions,e=>this._itemChanged(i,"font_family",e))}
                  </div>

                  <!-- Typography: font color, size, weight, line height, border radius -->
                  <div class="item-typography">
                    ${ctColorPicker("Font color",t.font_color??"",e=>this._itemChanged(i,"font_color",e))}
                    ${ctTextField("Font size (em)",t.font_size??"",e=>this._itemChanged(i,"font_size",e),{type:"number",step:"0.1",min:"0"})}
                    ${ctTextField("Font weight",t.font_weight??"",e=>this._itemChanged(i,"font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
                    ${ctTextField("Line height",t.line_height??"",e=>this._itemChanged(i,"line_height",e),{type:"number",step:"0.1",min:"0"})}
                    ${ctTextField("Border\nradius (px)",t.border_radius??"",e=>this._itemChanged(i,"border_radius",e),{type:"number",step:"1",min:"0"})}
                  </div>

                  <!-- Background color and padding -->
                  <div class="item-bg-color-padding">
                    ${ctColorPicker("Background color",t.background_color??"",e=>this._itemChanged(i,"background_color",e))}
                    ${ctTextField("Padding\ntop (px)",t.padding_top??"",e=>this._itemChanged(i,"padding_top",e),{type:"number",step:"1",min:"0"})}
                    ${ctTextField("Padding\nbottom (px)",t.padding_bottom??"",e=>this._itemChanged(i,"padding_bottom",e),{type:"number",step:"1",min:"0"})}
                    ${ctTextField("Padding\nleft (px)",t.padding_left??"",e=>this._itemChanged(i,"padding_left",e),{type:"number",step:"1",min:"0"})}
                    ${ctTextField("Padding\nright (px)",t.padding_right??"",e=>this._itemChanged(i,"padding_right",e),{type:"number",step:"1",min:"0"})}
                  </div>

                  <!-- Text shadow / stroke: color, blur, x/y offset, stroke width -->
                  <div class="item-text-shadow">
                    ${ctColorPicker("Shadow color",t.text_shadow_color??"",e=>this._itemChanged(i,"text_shadow_color",e))}
                    ${ctTextField("Shadow\nblur (px)",t.text_shadow_blur??"",e=>this._itemChanged(i,"text_shadow_blur",e),{type:"number",step:"1",min:"0"})}
                    ${ctTextField("Shadow\noffset X (px)",t.text_shadow_offset_x??"",e=>this._itemChanged(i,"text_shadow_offset_x",e),{type:"number",step:"1"})}
                    ${ctTextField("Shadow\noffset Y (px)",t.text_shadow_offset_y??"",e=>this._itemChanged(i,"text_shadow_offset_y",e),{type:"number",step:"1"})}
                    ${ctTextField("Stroke\nwidth (px)",t.text_shadow_stroke_width??"",e=>this._itemChanged(i,"text_shadow_stroke_width",e),{type:"number",step:"1",min:"0"})}
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

  `;render(){if(!this._config)return html``;const e=this._config;return html`

      <!-- ── Card configuration ──────────────────────────────────────────────── -->

      <ha-expansion-panel header="Card configuration" outlined .expanded=${!1}>

        <!-- Background color -->
        <div class="card-row-1">
          ${ctColorPicker("Background color",e.letterbox_color??"#000000",e=>this._valueChanged("letterbox_color",e))}
        </div>

        <!-- Dimmer -->
        <div class="card-row">
          ${ctToggleField("Ambient dimmer",e.dimmer_enabled??!1,e=>this._toggleChanged("dimmer_enabled",e),"",!0)}
        </div>
        ${e.dimmer_enabled?html`
        <div class="card-row-1">
          <ha-entity-picker
            label="Ambient lux sensor"
            .hass=${this.hass}
            .value=${e.dimmer_entity??""}
            allow-custom-entity
            @value-changed=${e=>this._valueChanged("dimmer_entity",e)}
          ></ha-entity-picker>
        </div>
        <div class="card-row">
          ${ctTextField("Lux min",e.dimmer_lux_min??0,e=>this._numericValueChanged("dimmer_lux_min",e),{type:"number",step:"1",min:"0"})}
          ${ctTextField("Lux max",e.dimmer_lux_max??40,e=>this._numericValueChanged("dimmer_lux_max",e),{type:"number",step:"1",min:"0"})}
        </div>
        <div class="card-row">
          ${ctTextField("Max opacity (%)",e.dimmer_max_opacity??80,e=>this._numericValueChanged("dimmer_max_opacity",e),{type:"number",step:"1",min:"0",max:"100"})}
          ${ctTextField("Min opacity (%)",e.dimmer_min_opacity??0,e=>this._numericValueChanged("dimmer_min_opacity",e),{type:"number",step:"1",min:"0",max:"100"})}
        </div>
        <div class="card-row-1">
          <div class="slider-field">
            <label class="slider-label">Aggressiveness: ${e.dimmer_aggressiveness??DEFAULT_CONFIG.dimmer_aggressiveness}%</label>
            <input type="range" min="1" max="100" step="1"
              .value=${String(e.dimmer_aggressiveness??DEFAULT_CONFIG.dimmer_aggressiveness)}
              @change=${e=>this._numericValueChanged("dimmer_aggressiveness",e)}
            />
          </div>
        </div>
        `:""}

      </ha-expansion-panel>

      <!-- ── Zones panel ──────────────────────────────────────────────────────── -->

      ${this._renderZonesPanel()}

      <!-- ── Items panel ──────────────────────────────────────────────────────── -->

      ${this._renderItemsPanel()}

    `}}customElements.define("chrono-tile-card-editor",ChronoTileCardEditor);class ChronoTileCard extends LitElement{static properties={_config:{attribute:!1},_itemValues:{state:!0}};static getCardSize(){return 3}static getConfigElement(){return document.createElement("chrono-tile-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG,items:[{...DEFAULT_TEMPLATE_ITEM,_id:generateId([]),show:!0,horizontal:"center",vertical:"middle",icon:"",show_state:!1,font_color:"#888888",font_size:15,font_weight:400,line_height:1.2,border_radius:50,background_color:"",padding_top:10,padding_bottom:10,padding_left:10,padding_right:10,text_shadow_color:"",text_shadow_blur:0,text_shadow_offset_x:0,text_shadow_offset_y:0,text_shadow_stroke_width:0,text_shadow_layers:2,template:"{{ now().strftime('%H:%M') }}"}]}}constructor(){super(),this._config=null,this._hass=null,this._itemValues={},this._itemSubs=new Map,this._subscribed=!1,this._holdTimer=null,this._holdFired=!1,this._lastTapTime=0,this._pendingTapTimer=null,this._touchStartX=null,this._touchStartY=null,this._resizeObserver=null}set hass(e){const t=this._hass;this._hass=e,this._config&&this._setupSubscriptions(),this._hassShouldRender(t,e)&&this.requestUpdate()}get hass(){return this._hass}_hassShouldRender(e,t){if(!e||!t)return!0;const i=this._config;if(!i)return!0;if(e.locale!==t.locale||e.formatEntityState!==t.formatEntityState)return!0;const o=new Set;i.dimmer_entity&&o.add(i.dimmer_entity);for(const e of i.items??[])e.entity&&o.add(e.entity);for(const i of o)if(e.states?.[i]!==t.states?.[i])return!0;return!1}setConfig(e){({config:e}=migrateConfig(e)),this._config=e,this._hass&&this._setupSubscriptions()}connectedCallback(){super.connectedCallback(),this._hass&&this._config&&!this._subscribed&&this._setupSubscriptions(),this.style.setProperty("--editor-preview-aspect-ratio",isInsideEditDialog(this)?"16 / 10":"auto"),this.style.setProperty("--editor-preview-height",isInsideEditDialog(this)?"auto":"100%")}firstUpdated(e){super.firstUpdated(e);const t=this.shadowRoot?.querySelector("ha-card");t&&(this._resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect?.height;t&&this.style.setProperty("--scale-factor",t/400)}),this._resizeObserver.observe(t))}disconnectedCallback(){super.disconnectedCallback(),this._teardownSubscriptions(),this._resizeObserver?.disconnect()}_setupSubscriptions(){this._itemSubs||(this._itemSubs=new Map);const e=this._config?.items??[],t=this._config??{},i=new Set,o=e=>e.replace(/_([a-z])/g,(e,t)=>t.toUpperCase()),n={},r=new Set(["zone_alignment","items"]);for(const e of Object.keys(DEFAULT_CONFIG)){if(r.has(e))continue;const i="card"+o(e).replace(/^./,e=>e.toUpperCase());n[i]=t[e]??DEFAULT_CONFIG[e]}n.cardDimmerOpacity=Math.round(1e3*this._computeDimmerOpacity())/10,e.forEach((e,t)=>{if(!("template"in e))return;const o=`item-${t}`;i.add(o);const{text:r,fullyLiteral:a}=substituteCardVariables(e.template??"",n),s=this._itemSubs.get(o);if(s&&s.substituted===r)return;if(s?.unsub&&this._unsubscribeOne(s.unsub),a)return this._itemValues={...this._itemValues,[o]:r},void this._itemSubs.set(o,{substituted:r,unsub:null});const l=this._hass.connection.subscribeMessage(e=>{this._itemValues={...this._itemValues,[o]:e.result}},{type:"render_template",template:r});this._itemSubs.set(o,{substituted:r,unsub:l})});for(const[e,t]of[...this._itemSubs.entries()])if(!i.has(e)){t.unsub&&this._unsubscribeOne(t.unsub),this._itemSubs.delete(e);const{[e]:i,...o}=this._itemValues;this._itemValues=o}this._subscribed=!0}_unsubscribeOne(e){Promise.resolve(e).then(e=>{"function"==typeof e&&e()}).catch(()=>{})}_teardownSubscriptions(){if(this._itemSubs){for(const e of this._itemSubs.values())e.unsub&&this._unsubscribeOne(e.unsub);this._itemSubs.clear()}this._subscribed=!1}_handleAction(e,t="tap"){this._hass&&handleAction(this,this._hass,e,t)}_onPointerDown(e){e.currentTarget.setPointerCapture(e.pointerId),this._touchStartX=e.clientX,this._touchStartY=e.clientY,this._holdFired=!1,this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=setTimeout(()=>{this._holdFired=!0,this._handleAction(this._config,"hold")},500)}_onPointerUp(e){if(null===this._touchStartX)return;const t=e.clientX-this._touchStartX,i=e.clientY-this._touchStartY;this._touchStartX=null,this._touchStartY=null,this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null);const o=Math.abs(t)>=40&&Math.abs(t)>=Math.abs(i),n=Math.abs(i)>=40&&Math.abs(i)>Math.abs(t);if(o)return void(this._holdFired||this._handleAction(this._config,t<0?"swipe_left":"swipe_right"));if(n)return void(this._holdFired||this._handleAction(this._config,i<0?"swipe_up":"swipe_down"));if(this._holdFired)return;const r=Date.now();if(r-this._lastTapTime<250)return this._lastTapTime=0,this._pendingTapTimer&&(clearTimeout(this._pendingTapTimer),this._pendingTapTimer=null),void this._handleAction(this._config,"double_tap");this._lastTapTime=r,this._pendingTapTimer&&clearTimeout(this._pendingTapTimer),this._pendingTapTimer=setTimeout(()=>{this._pendingTapTimer=null,this._handleAction(this._config,"tap")},250)}_onPointerCancel(){this._touchStartX=null,this._touchStartY=null,this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null)}_onPointerMove(e){if(null===this._touchStartX||!this._holdTimer)return;const t=e.clientX-this._touchStartX,i=e.clientY-this._touchStartY;(Math.abs(t)>=40||Math.abs(i)>=40)&&(clearTimeout(this._holdTimer),this._holdTimer=null)}_computeDimmerOpacity(){const e=this._config,t=e.dimmer_entity??"";if(!t)return 0;const i=this._hass?.states?.[t],o=i?parseFloat(i.state):0;if(isNaN(o))return 0;const n=e.dimmer_lux_min??DEFAULT_CONFIG.dimmer_lux_min,r=e.dimmer_lux_max??DEFAULT_CONFIG.dimmer_lux_max,a=(e.dimmer_min_opacity??DEFAULT_CONFIG.dimmer_min_opacity)/100,s=(e.dimmer_max_opacity??DEFAULT_CONFIG.dimmer_max_opacity)/100,l=e.dimmer_aggressiveness??DEFAULT_CONFIG.dimmer_aggressiveness,d=Math.pow(10,(l-50)/50);if(r<=n)return s;const c=Math.max(0,Math.min(1,(o-n)/(r-n)));return s+(a-s)*Math.pow(c,.33*d)}_itemStyleMap(e){const t=e=>""!==e&&null!=e?`calc(${e}px * var(--scale-factor, 1))`:void 0,i=e=>""!==e&&null!=e?`${e}`:void 0;return{color:e.font_color||void 0,"font-family":e.font_family||void 0,"font-size":(o=e.font_size,""!==o&&null!=o?`calc(${o}em * var(--scale-factor, 1))`:void 0),"font-weight":i(e.font_weight),"line-height":i(e.line_height),"border-radius":t(e.border_radius),"background-color":e.background_color||void 0,"padding-top":t(e.padding_top),"padding-bottom":t(e.padding_bottom),"padding-left":t(e.padding_left),"padding-right":t(e.padding_right),"text-shadow":e.text_shadow_color?Array(Math.max(1,Number(e.text_shadow_layers??2)||1)).fill(`${t(e.text_shadow_offset_x??0)} ${t(e.text_shadow_offset_y??0)} ${t(e.text_shadow_blur??0)} ${e.text_shadow_color}`).join(", "):void 0,"-webkit-text-stroke-width":e.text_shadow_color?t(e.text_shadow_stroke_width??0):void 0,"-webkit-text-stroke-color":e.text_shadow_color||void 0};var o}_renderItem(e){if(!1===e.show)return html``;if(ensureFontLoaded(e.font_family),"template"in e){const t=`item-${this._config.items.indexOf(e)}`,i=this._itemValues[t]??"",o=e.tap_action&&"none"!==e.tap_action.action;return html`
        <span
          class="overlay-template-item${o?" clickable":""}"
          style=${styleMap(this._itemStyleMap(e))}
          @click=${o?()=>this._handleAction(e):void 0}
        >${i}</span>
      `}if("entity"in e){const t=this._hass?.states?.[e.entity];if(!t)return html`
          <span class="overlay-entity-missing" title="Entity not found: ${e.entity}">!</span>
        `;const i={...e,entity:e.entity},o=e.show_state?this._hass?.formatEntityState?this._hass.formatEntityState(t):t.state:"";return html`
        <div
          class="overlay-entity-item"
          style=${styleMap(this._itemStyleMap(e))}
          title="${t.attributes.friendly_name??e.entity}: ${t.state}"
          @click=${e=>{e.stopPropagation(),this._handleAction(i)}}
        >
          <ha-state-icon
            .hass=${this._hass}
            .stateObj=${t}
            .icon=${e.icon||void 0}
          ></ha-state-icon>
          ${e.show_state?html`<span class="entity-state-label">${o}</span>`:""}
        </div>
      `}return html``}_renderZoneItems(e,t){const i=(this._config?.items??[]).filter(i=>(i.horizontal??"center")===t&&(i.vertical??"middle")===e);if(0===i.length)return html``;const o=`${e}-${t}`,n=this._config?.zone_alignment?.[o]??DEFAULT_ZONE_ALIGNMENT[o]??t;return html`
      <div class="overlay-zone overlay-zone-align-${n}">
        ${i.map(e=>this._renderItem(e))}
      </div>
    `}_renderZoneGrid(){const e=["top","middle","bottom"].map(e=>{const t=["left","center","right"].map(t=>html`<div class="overlay-cell">${this._renderZoneItems(e,t)}</div>`);return html`<div class="overlay-row">${t}</div>`});return html`<div class="overlay-grid">${e}</div>`}static styles=css`
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
  `;render(){if(!this._config)return html``;const e=this._config;return html`
      <ha-card>
        <div
          class="tile-container"
          style=${styleMap({"background-color":e.letterbox_color||void 0})}
          @pointerdown=${e=>this._onPointerDown(e)}
          @pointermove=${e=>this._onPointerMove(e)}
          @pointerup=${e=>this._onPointerUp(e)}
          @pointercancel=${()=>this._onPointerCancel()}
        >
          ${this._renderZoneGrid()}

          ${e.dimmer_enabled&&e.dimmer_entity?html`
            <div class="dimmer-overlay" style="
              background-color: ${e.dimmer_color??DEFAULT_CONFIG.dimmer_color};
              opacity: ${this._computeDimmerOpacity()};
            "></div>
          `:""}
        </div>
      </ha-card>
    `}}customElements.define("chrono-tile-card",ChronoTileCard),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-tile-card",name:"Chrono Tile Card",description:"A 9-zone grid of templated or entity-driven tiles, with an ambient-light dimmer overlay.",preview:!0});