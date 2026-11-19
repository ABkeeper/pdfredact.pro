/* pdfredact.pro — one product switcher for the fixed top bar of every guide.
   Usage in a page:  <div class="site-switch" data-site-switch><a href="../">pdfredact.pro</a></div>
                     <script src="../assets/site-switcher.js" defer></script>
   The link inside is the fallback without JavaScript. To add a product, add one entry to PRODUCTS. */
(function () {
  var PRODUCTS = [
    { id: "redact", name: "PDF Redact & Extract Pro", mark: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h8l4 4v14H6z" stroke="white" stroke-width="1.8"/><path d="M14 3v5h5" stroke="white" stroke-width="1.8"/><rect x="8.3" y="12" width="7.4" height="5.8" rx="1.2" stroke="white" stroke-width="1.6"/><path d="M10 12v-1.1a2 2 0 0 1 4 0V12" stroke="white" stroke-width="1.6"/></svg>',
      markBg: "linear-gradient(145deg,#ef4444,#b91c1c)", color: "#c62828",
      page: "", guide: "help.html", match: function (p) { return p.indexOf("/fieldsmith/") < 0; } },
    { id: "fieldsmith", name: "Fieldsmith", sub: "PDF Form Field Editor", icon: "fieldsmith/assets/icon-64.png", color: "#0F6E56",
      page: "fieldsmith/", guide: "fieldsmith/help.html", match: function (p) { return p.indexOf("/fieldsmith/") >= 0; } }
  ];
  var HOME = "";                      // the site's home page, relative to the site root

  var me = document.currentScript || document.querySelector('script[src*="site-switcher.js"]');
  var root = me ? me.src.replace(/assets\/site-switcher\.js.*$/, "") : "/";
  var path = location.pathname.replace(/\\/g, "/");
  var isGuide = /help\.html$/i.test(path);

  var css = ""
    + ".site-switch{position:relative;margin-left:auto;flex:0 0 auto;font-family:inherit}"
    + ".ss-btn{display:flex;align-items:center;gap:9px;height:40px;padding:4px 12px 4px 6px;border:1px solid #e1e4e8;border-radius:11px;background:#fff;color:#22262b;cursor:pointer;font:inherit;text-decoration:none}"
    + ".ss-btn:hover,.site-switch.open .ss-btn{border-color:#c4c9cf;box-shadow:0 4px 14px rgba(15,23,42,.10)}"
    + ".ss-ic{width:28px;height:28px;border-radius:7px;object-fit:contain;flex:0 0 auto}"
    + ".ss-mark{display:grid;place-items:center;border-radius:8px}.ss-mark svg{width:62%;height:62%}"
    + ".ss-txt{display:flex;flex-direction:column;line-height:1.15;text-align:left}"
    + ".ss-txt small{font-size:10.5px;color:#6b7280;font-weight:600}.ss-txt b{font-size:13px}"
    + ".ss-car{font-size:11px;color:#6b7280;margin-left:2px}"
    + ".ss-menu{position:absolute;right:0;top:calc(100% + 8px);width:340px;background:#fff;border:1px solid #e1e4e8;border-radius:14px;box-shadow:0 18px 44px rgba(15,23,42,.18);padding:8px;display:none;z-index:200}"
    + ".site-switch.open .ss-menu{display:block}"
    + ".ss-head{font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#9aa0a8;padding:6px 10px 4px}"
    + ".ss-prod{display:flex;gap:11px;align-items:center;padding:9px 10px;border-radius:10px}"
    + ".ss-prod.cur{background:#f5f7f9}"
    + ".ss-prod .ss-ic{width:32px;height:32px}"
    + ".ss-pt{flex:1;min-width:0}.ss-pt b{display:block;font-size:14px;color:#22262b}.ss-pt span{font-size:11.5px;color:#6b7280}"
    + ".ss-links{display:flex;gap:6px;margin-top:5px}"
    + ".ss-links a{font-size:12px;font-weight:700;text-decoration:none;padding:3px 9px;border-radius:999px;border:1px solid #e1e4e8;color:#374151}"
    + ".ss-links a:hover{border-color:currentColor}"
    + ".ss-links a.here{color:#fff!important;border-color:transparent}"
    + ".ss-home{display:block;margin-top:6px;border-top:1px solid #eef0f2;padding:10px 10px 6px;font-size:13px;font-weight:700;color:#374151;text-decoration:none}"
    + ".ss-home:hover{color:#111}"
    + "@media(max-width:1100px){.ss-txt small{display:none}}"
    + "@media(max-width:900px){.ss-txt{display:none}.ss-btn{padding:4px 8px 4px 5px}}"
    + "@media(max-width:420px){.ss-menu{position:fixed;left:8px;right:8px;top:62px;width:auto}}"
    + "@media print{.site-switch{display:none}}";

  function href(x) {             // opened from disk (file://) a folder link shows a listing: point at its index.html
    return root + x + (location.protocol === "file:" && (x === "" || /\/$/.test(x)) ? "index.html" : "");
  }
  function icon(p) {             // drawn in the page (no picture file needed) or a picture from the site
    return p.mark ? '<span class="ss-ic ss-mark" style="background:' + p.markBg + '">' + p.mark + '</span>'
                  : '<img class="ss-ic" src="' + root + p.icon + '" alt="">';
  }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function build(box) {
    var cur = PRODUCTS.filter(function (p) { return p.match(path); })[0] || PRODUCTS[0];
    box.innerHTML = "";
    var btn = el("button", { type: "button", "class": "ss-btn", "aria-haspopup": "true", "aria-expanded": "false",
                             title: "pdfredact.pro — all products and guides" },
      icon(PRODUCTS[0]) +
      '<span class="ss-txt"><small>pdfredact.pro &middot; home</small><b>All products</b></span><span class="ss-car">&#9662;</span>');
    var menu = el("div", { "class": "ss-menu", role: "menu" });
    var h = '<div class="ss-head">Our products</div>';
    PRODUCTS.forEach(function (p) {
      var onPage = p === cur && !isGuide, onGuide = p === cur && isGuide;
      h += '<div class="ss-prod' + (p === cur ? " cur" : "") + '">' + icon(p) +
           '<div class="ss-pt"><b style="color:' + p.color + '">' + esc(p.name) + '</b>' + (p.sub ? '<span>' + esc(p.sub) + '</span>' : "") +
           '<div class="ss-links">' +
           '<a role="menuitem" href="' + href(p.page) + '"' + (onPage ? ' class="here" style="background:' + p.color + '"' : ' style="color:' + p.color + '"') + '>Product page</a>' +
           '<a role="menuitem" href="' + href(p.guide) + '"' + (onGuide ? ' class="here" style="background:' + p.color + '"' : ' style="color:' + p.color + '"') + '>User Guide</a>' +
           '</div></div></div>';
    });
    h += '<a class="ss-home" role="menuitem" href="' + href(HOME) + '">&larr; pdfredact.pro home page</a>';
    menu.innerHTML = h;
    box.appendChild(btn);
    box.appendChild(menu);

    function setOpen(o) { box.classList.toggle("open", o); btn.setAttribute("aria-expanded", o ? "true" : "false"); }
    btn.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!box.classList.contains("open")); });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  function init() {
    var style = el("style", {}, css);
    document.head.appendChild(style);
    Array.prototype.forEach.call(document.querySelectorAll("[data-site-switch]"), build);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
