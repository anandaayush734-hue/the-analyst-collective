(function () {
  "use strict";

  var DATA = null;
  var app = document.getElementById("app");

  // Main navigation (the selection menu). Industrials subsectors sit right after their parent.
  var NAV = [
    { href: "#/", label: "Front Page", match: "front" },
    { href: "#/section/industrials", label: "Industrials Intelligence", match: "industrials" },
    { href: "#/sub/automobiles", label: "Automobiles", match: "automobiles" },
    { href: "#/sub/ev", label: "Electric Vehicles", match: "ev" },
    { href: "#/sub/general-industrials", label: "General Industrials", match: "general-industrials" },
    { href: "#/sub/aerospace-defence", label: "Aerospace & Defence", match: "aerospace-defence" },
    { href: "#/section/ib-deals", label: "Investment Banking & Deals", match: "ib-deals" },
    { href: "#/section/markets", label: "Markets & Economy", match: "markets" },
    { href: "#/section/regulatory", label: "Regulatory Radar", match: "regulatory" },
    { href: "#/section/india", label: "India", match: "india" },
    { href: "#/section/global", label: "Global Affairs", match: "global" },
    { href: "#/section/tech-ai", label: "Technology & AI", match: "tech-ai" },
    { href: "#/section/analysts-corner", label: "Analyst's Corner", match: "analysts-corner" },
    { href: "#/archive", label: "Archives", match: "archive" }
  ];

  // ---------- helpers ----------
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmtDate(iso, long) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", long
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : { day: "numeric", month: "short", year: "numeric" });
  }

  function findSection(key) {
    return DATA.sections.concat(DATA.subsections).filter(function (s) { return s.key === key; })[0] || null;
  }
  function labelFor(key) { var s = findSection(key); return s ? s.label : key; }

  function allArticles() {
    var out = [];
    DATA.editions.forEach(function (ed) {
      ed.articles.forEach(function (a) { out.push(Object.assign({ editionDate: ed.date }, a)); });
    });
    return out;
  }
  function sortByRank(list) { return list.slice().sort(function (a, b) { return (a.rank || 99) - (b.rank || 99); }); }
  function findArticle(id) { return allArticles().filter(function (a) { return a.id === id; })[0] || null; }
  function latestEdition() { return DATA.editions[0]; }
  function articleLink(a) { return "#/article/" + encodeURIComponent(a.id); }
  function sectionOf(a) { return a.subsection || a.section; }

  // ---------- reusable pieces ----------
  function card(a) {
    return '<article class="card">' +
      '<p class="kicker">' + esc(labelFor(sectionOf(a))) + '</p>' +
      '<h3><a href="' + articleLink(a) + '">' + esc(a.headline) + '</a></h3>' +
      '<p class="meta"><span class="badge">' + esc(a.status) + '</span>' + esc(fmtDate(a.publishedAt)) + '</p>' +
      '<p class="deck">' + esc(a.deck) + '</p>' +
    '</article>';
  }

  function rankItem(a) {
    return '<li><p class="kicker">' + esc(labelFor(sectionOf(a))) + '</p>' +
      '<h3><a href="' + articleLink(a) + '">' + esc(a.headline) + '</a></h3>' +
      '<p class="meta">' + esc(a.status) + ' · ' + esc(fmtDate(a.publishedAt)) + '</p></li>';
  }

  function list(items) {
    return '<ul>' + (items || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>';
  }

  // The brief shown at the top of each industry page.
  function briefBlock(sec) {
    var b = sec && sec.brief;
    if (!b) return "";
    var cols = "";
    if (b.covers) cols += '<div><h4>What it covers</h4>' + list(b.covers) + '</div>';
    if (b.metrics) cols += '<div><h4>What analysts track</h4>' + list(b.metrics) + '</div>';
    if (b.players) cols += '<div><h4>Selected listed companies</h4>' + list(b.players) + '</div>';
    return '<section class="brief" aria-label="Sector brief">' +
      '<p class="eyebrow">Sector brief</p>' +
      '<p class="summary" style="margin-top:6px">' + esc(b.summary) + '</p>' +
      (cols ? '<div class="brief-grid">' + cols + '</div>' : '') +
      (b.ibAngle ? '<p style="margin-top:16px"><strong>Investment banking angle:</strong> ' + esc(b.ibAngle) + '</p>' : '') +
      '<p class="fine">Company lists are examples, not recommendations, and are not exhaustive.</p>' +
    '</section>';
  }

  function industryTiles() {
    return '<div class="grid four">' + DATA.subsections.map(function (s) {
      var count = allArticles().filter(function (a) { return a.subsection === s.key; }).length;
      return '<a class="card tile" href="#/sub/' + s.key + '">' +
        '<p class="kicker">Industrials</p><h3>' + esc(s.label) + '</h3>' +
        '<p>' + esc(s.brief ? s.brief.teaser : "") + '</p>' +
        '<span class="more">Open brief and stories (' + count + ') →</span></a>';
    }).join("") + '</div>';
  }

  // ---------- views ----------
  function viewFront(editionDate) {
    var ed = editionDate ? DATA.editions.filter(function (e) { return e.date === editionDate; })[0] : latestEdition();
    if (!ed) return viewNotFound();
    var ranked = sortByRank(ed.articles).slice(0, 10);
    var lead = ranked[0], rest = ranked.slice(1);
    var html = '<div class="page-head"><p class="eyebrow">' + (editionDate ? "Archived edition · " : "Today's edition · ") + esc(fmtDate(ed.date, true)) + '</p></div>';

    if (!lead) return html + '<p class="empty">No stories in this edition.</p>';

    html += '<div class="lead-grid">' +
      '<article class="lead">' +
        '<p class="kicker">' + esc(labelFor(sectionOf(lead))) + '</p>' +
        '<h2><a href="' + articleLink(lead) + '">' + esc(lead.headline) + '</a></h2>' +
        '<p class="deck">' + esc(lead.deck) + '</p>' +
        '<p class="meta"><span class="badge">' + esc(lead.status) + '</span>' + esc(fmtDate(lead.publishedAt)) + '</p>' +
        '<p class="summary">' + esc(lead.whatHappened) + '</p>' +
        '<p style="margin-top:12px"><a href="' + articleLink(lead) + '">Read the full analysis →</a></p>' +
      '</article>' +
      '<aside><p class="eyebrow" style="margin-bottom:12px">Top stories</p>' +
        (rest.length ? '<ol class="rank-list">' + rest.map(rankItem).join("") + '</ol>' : '<p class="empty">More stories soon.</p>') +
      '</aside></div>';

    html += '<h2 class="section-title">Industrials Intelligence <a href="#/section/industrials">Open section</a></h2>' + industryTiles();

    html += '<h2 class="section-title">Sector updates</h2>';
    var any = false;
    DATA.sections.forEach(function (sec) {
      var items = ed.articles.filter(function (a) { return a.section === sec.key; });
      if (!items.length) return;
      any = true;
      html += '<h3 style="font-size:20px;margin:22px 0 10px"><a href="#/section/' + sec.key + '" style="text-decoration:none">' + esc(sec.label) + '</a></h3>' +
        '<div class="grid two">' + items.slice(0, 2).map(card).join("") + '</div>';
    });
    if (!any) html += '<p class="empty">No sector updates in this edition.</p>';
    return html;
  }

  function uniqueOpts(articles, field) {
    var set = {};
    articles.forEach(function (a) {
      var v = a[field];
      (Array.isArray(v) ? v : [v]).forEach(function (x) { if (x) set[x] = true; });
    });
    return Object.keys(set).sort().map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join("");
  }

  function viewBrowse(opts) {
    var articles = allArticles();
    if (opts.filterKey === "section") articles = articles.filter(function (a) { return a.section === opts.filterValue; });
    if (opts.filterKey === "sub") articles = articles.filter(function (a) { return a.subsection === opts.filterValue; });

    var sec = opts.filterValue ? findSection(opts.filterValue) : null;
    var html = '<div class="page-head"><p class="eyebrow">' + esc(opts.kicker) + '</p><h1>' + esc(opts.title) + '</h1></div>';
    html += briefBlock(sec);
    if (opts.filterValue === "industrials") html += industryTiles() + '<h2 class="section-title">All Industrials stories</h2>';

    html += '<div class="controls" role="search">' +
      '<div><label for="f-q">Search</label><input id="f-q" type="search" placeholder="Headline, company, topic…"></div>' +
      '<div><label for="f-date">Date</label><select id="f-date"><option value="">All dates</option>' +
        DATA.editions.map(function (e) { return '<option value="' + esc(e.date) + '">' + esc(fmtDate(e.date)) + '</option>'; }).join("") + '</select></div>' +
      '<div><label for="f-geo">Geography</label><select id="f-geo"><option value="">All</option>' + uniqueOpts(articles, "geography") + '</select></div>' +
      '<div><label for="f-co">Company</label><select id="f-co"><option value="">All</option>' + uniqueOpts(articles, "companies") + '</select></div>' +
      '<div><label for="f-topic">Topic</label><select id="f-topic"><option value="">All</option>' + uniqueOpts(articles, "topics") + '</select></div>' +
    '</div><p class="meta" id="result-count"></p><div id="results" class="grid two" style="margin-top:12px"></div>';

    app.innerHTML = html;
    window.scrollTo(0, 0);

    var state = { q: "", date: "", geo: "", co: "", topic: "" };
    function apply() {
      var q = state.q.toLowerCase();
      var rows = articles.filter(function (a) {
        if (state.date && a.editionDate !== state.date) return false;
        if (state.geo && a.geography !== state.geo) return false;
        if (state.co && (a.companies || []).indexOf(state.co) === -1) return false;
        if (state.topic && (a.topics || []).indexOf(state.topic) === -1) return false;
        if (q) {
          var hay = [a.headline, a.deck, a.whatHappened, (a.companies || []).join(" "), (a.topics || []).join(" ")].join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
      document.getElementById("result-count").textContent = rows.length + " stor" + (rows.length === 1 ? "y" : "ies");
      document.getElementById("results").innerHTML = rows.length ? rows.map(card).join("") : '<p class="empty">No stories match these filters yet.</p>';
    }
    [["f-q", "q", "input"], ["f-date", "date"], ["f-geo", "geo"], ["f-co", "co"], ["f-topic", "topic"]].forEach(function (b) {
      document.getElementById(b[0]).addEventListener(b[2] || "change", function (e) { state[b[1]] = e.target.value; apply(); });
    });
    apply();
  }

  function viewArticle(id) {
    var a = findArticle(id);
    if (!a) return viewNotFound();
    var html = '<div class="article"><a class="back" href="#/">← Front page</a>' +
      '<p class="kicker">' + esc(labelFor(sectionOf(a))) + '</p>' +
      '<h1>' + esc(a.headline) + '</h1><p class="deck">' + esc(a.deck) + '</p>' +
      '<p class="meta"><span class="badge">' + esc(a.status) + '</span>Published ' + esc(fmtDate(a.publishedAt)) +
        (a.eventDate ? ' · Event date ' + esc(fmtDate(a.eventDate)) : '') + '</p>' +
      '<div class="pill-row">' + (a.companies || []).concat(a.topics || []).map(function (c) { return '<span class="pill">' + esc(c) + '</span>'; }).join("") + '</div>';
    function sec(title, body) { return body ? '<section><h2>' + title + '</h2>' + body + '</section>' : ''; }
    html += sec("What happened", a.whatHappened ? '<p>' + esc(a.whatHappened) + '</p>' : '');
    html += sec("Key facts", a.keyFacts && a.keyFacts.length ? list(a.keyFacts) : '');
    html += sec("Why it matters", a.whyItMatters ? '<p>' + esc(a.whyItMatters) + '</p>' : '');
    html += sec("Investment banking angle", a.ibAngle ? '<p>' + esc(a.ibAngle) + '</p>' : '');
    html += sec("Sector implications", a.sectorImplications ? '<p>' + esc(a.sectorImplications) + '</p>' : '');
    if (a.source && a.source.url) {
      html += sec("Source", '<div class="sourcebox">' + esc(a.source.name) + '<br><a href="' + esc(a.source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.source.url) + '</a></div>');
    }
    return html + '</div>';
  }

  function viewArchive() {
    return '<div class="page-head"><p class="eyebrow">Archive</p><h1>Past editions</h1></div>' +
      '<ul class="archive-list">' + DATA.editions.map(function (ed) {
        return '<li><a href="#/edition/' + esc(ed.date) + '">' + esc(fmtDate(ed.date, true)) + '</a><span class="meta">' + ed.articles.length + ' stories</span></li>';
      }).join("") + '</ul>';
  }

  function viewNotFound() {
    return '<div class="page-head"><h1>Page not found</h1></div><p>This page does not exist. <a href="#/">Return to the front page</a>.</p>';
  }

  // ---------- router ----------
  function route() {
    var parts = window.location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    var head = parts[0] || "";
    setActiveNav(head, parts);

    if (head === "section" || head === "sub") {
      var s = findSection(parts[1]);
      if (s && (head === "section" ? DATA.sections : DATA.subsections).indexOf(s) !== -1) {
        viewBrowse({ title: s.label, kicker: head === "sub" ? "Industrials Intelligence" : "Section", filterKey: head, filterValue: s.key });
        return;
      }
    }
    var html;
    if (head === "" || head === "front") html = viewFront(null);
    else if (head === "edition") html = viewFront(parts[1]);
    else if (head === "article") html = viewArticle(parts[1]);
    else if (head === "archive") html = viewArchive();
    else html = viewNotFound();
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function setActiveNav(head, parts) {
    var key = (head === "section" || head === "sub") ? parts[1] : (head === "archive" ? "archive" : "front");
    document.querySelectorAll("#navlist a").forEach(function (a) {
      var on = a.getAttribute("data-match") === key;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  // ---------- colour mode ----------
  function setupMode() {
    var root = document.documentElement, btn = document.getElementById("mode");
    function current() {
      var t = root.getAttribute("data-theme");
      if (t) return t;
      return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "burgundy" : "paper";
    }
    function paint() { btn.setAttribute("aria-pressed", current() === "burgundy" ? "true" : "false"); }
    btn.addEventListener("click", function () {
      var next = current() === "burgundy" ? "paper" : "burgundy";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("tac-mode", next); } catch (e) {}
      paint();
    });
    paint();
  }

  // ---------- custom cursor: dot + ring ----------
  function setupCursor() {
    if (!window.matchMedia || !matchMedia("(pointer: fine)").matches) return;
    var dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "cur-dot"; ring.className = "cur-ring";
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.documentElement.classList.add("has-cursor");
    var mx = -100, my = -100, rx = -100, ry = -100;
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      dot.style.opacity = ring.style.opacity = 1;
    });
    document.addEventListener("mouseleave", function () { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener("mousedown", function () { ring.classList.add("down"); });
    document.addEventListener("mouseup", function () { ring.classList.remove("down"); });
    document.addEventListener("mouseover", function (e) {
      ring.classList.toggle("hover", !!(e.target.closest && e.target.closest("a,button,select,input,label")));
    });
    (function loop() {
      var k = still ? 1 : 0.18;
      rx += (mx - rx) * k; ry += (my - ry) * k;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();
  }

  // ---------- welcome popup (once per browser session) ----------
  function setupModal() {
    var modal = document.getElementById("modal");
    var seen = false;
    try { seen = sessionStorage.getItem("tac-welcome") === "1"; } catch (e) {}
    function close() {
      modal.hidden = true;
      try { sessionStorage.setItem("tac-welcome", "1"); } catch (e) {}
    }
    var ed = latestEdition();
    if (ed) {
      document.getElementById("m-date").textContent = "Today's edition · " + fmtDate(ed.date, true);
      document.getElementById("m-list").innerHTML = sortByRank(ed.articles).slice(0, 3).map(function (a) {
        return '<li><a href="' + articleLink(a) + '">' + esc(a.headline) + '</a></li>';
      }).join("");
    }
    modal.addEventListener("click", function (e) {
      if (e.target === modal || (e.target.closest && e.target.closest("a, #m-x, #m-skip"))) close();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
    if (!seen && ed) modal.hidden = false;
  }

  function buildChrome() {
    document.getElementById("navlist").innerHTML = NAV.map(function (n) {
      return '<li><a href="' + n.href + '" data-match="' + n.match + '">' + esc(n.label) + '</a></li>';
    }).join("");
    document.getElementById("notice").textContent = DATA.masthead.notice || "";
    document.getElementById("tagline").textContent = DATA.masthead.tagline || "";
    document.getElementById("dateline").textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    document.title = DATA.masthead.name;
  }

  // ---------- start ----------
  setupMode();
  setupCursor();

  fetch("data/editions.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("Could not load data/editions.json (HTTP " + r.status + ")");
      return r.json();
    })
    .then(function (json) {
      DATA = json;
      DATA.editions.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      buildChrome();
      route();
      setupModal();
      window.addEventListener("hashchange", route);
    })
    .catch(function (err) {
      app.innerHTML = '<p class="empty">The newspaper could not load its stories. ' + esc(err.message) +
        '. If you just edited data/editions.json, check it for a missing comma or quote.</p>';
    });
})();
