/**
 * Visitor consent for analytics and advertising (docs/consent.md).
 *
 * CONSENT_MODE is the one switch counsel decides:
 * - "opt-out" (the US norm): analytics and ads run until the visitor opts
 *   out. The banner is a notice with a link to the choices page.
 * - "opt-in": nothing runs until the visitor accepts.
 * Either way, a Global Privacy Control signal from the browser always turns
 * advertising off, and a saved choice always wins over the default.
 */
export const CONSENT_MODE: "opt-out" | "opt-in" = "opt-out";

export const CONSENT_COOKIE = "oaan_consent";
export const PRIVACY_CHOICES_PATH = "/legal/privacy-choices";

export type ConsentChoices = { analytics: boolean; ads: boolean };

/** What the boot script exposes as window.oaanConsent. */
export type ConsentApi = {
  mode: "opt-out" | "opt-in";
  gpc: boolean;
  saved: boolean;
  current: ConsentChoices;
  update: (choices: ConsentChoices) => void;
};

export function getConsentApi(): ConsentApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { oaanConsent?: ConsentApi }).oaanConsent;
}

/** Fired on window whenever the visitor saves a choice. */
export const CONSENT_EVENT = "oaan-consent";

/**
 * Runs before any other site code (root layout, beforeInteractive). It sets
 * Google Consent Mode defaults, then loads Tag Manager only if the visitor's
 * choices allow analytics or ads, so an opted-out visitor's browser never
 * contacts Google. Plain ES5 on purpose: it runs before the app's own code.
 */
export function consentBootScript(gtmId: string | undefined): string {
  return `(function(){
var MODE=${JSON.stringify(CONSENT_MODE)},GTM=${JSON.stringify(gtmId ?? "")},COOKIE=${JSON.stringify(CONSENT_COOKIE)};
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
function read(){try{var m=document.cookie.match(new RegExp("(?:^|; )"+COOKIE+"=([^;]*)"));return m?JSON.parse(decodeURIComponent(m[1])):null;}catch(e){return null;}}
function state(a,d){var g=function(b){return b?"granted":"denied";};return{analytics_storage:g(a),ad_storage:g(d),ad_user_data:g(d),ad_personalization:g(d)};}
function expire(name){var h=location.hostname,p=h.split(".");var ds=["",h,"."+h];if(p.length>2){ds.push("."+p.slice(-2).join("."));}for(var i=0;i<ds.length;i++){document.cookie=name+"=; path=/; max-age=0"+(ds[i]?"; domain="+ds[i]:"");}}
var gpc=navigator.globalPrivacyControl===true;
var saved=read();
var base=MODE!=="opt-in";
var analytics=saved?!!saved.analytics:base;
var ads=(saved?!!saved.ads:base)&&!gpc;
gtag("consent","default",state(analytics,ads));
var loaded=false;
function loadGtm(){if(loaded||!GTM)return;loaded=true;window.dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtm.js?id="+GTM;document.head.appendChild(s);}
if(analytics||ads){loadGtm();}
window.oaanConsent={mode:MODE,gpc:gpc,saved:!!saved,current:{analytics:analytics,ads:ads},
update:function(c){var a=!!c.analytics,d=!!c.ads&&!gpc;this.current={analytics:a,ads:d};this.saved=true;
document.cookie=COOKIE+"="+encodeURIComponent(JSON.stringify({analytics:a,ads:d,v:1}))+"; path=/; max-age=31536000; SameSite=Lax";
gtag("consent","update",state(a,d));
if(!a){var names=document.cookie.split("; ");for(var i=0;i<names.length;i++){var n=names[i].split("=")[0];if(n.indexOf("_ga")===0||n==="oaan_attr"){expire(n);}}}
if(a||d){loadGtm();}
try{window.dispatchEvent(new Event(${JSON.stringify(CONSENT_EVENT)}));}catch(e){}}};
})();`;
}
