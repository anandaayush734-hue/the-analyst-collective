(function () {
  "use strict";

  var DATA = null;
  var app = document.getElementById("app");

  // Static navigation: Front Page, the four Industrials subsectors, then the rest.
  var NAV = [
    { href: "#/", label: "Front Page", match: "front" },
    { href: "#/section/industrials", label: "Industrials Intelligence", match: "industrials" },
    { href: "#/sub/automobiles", label: "Automobiles", match: "automobiles", indent: true },
    { href: "#/sub/ev", label: "Electric Vehicles", match: "ev", indent: true },
    { href: "#/sub/general-industrials", label: "General Industrials", match: "general-industrials", indent: true },
    { href: "#/sub/aerospace-defence", label: "Aerospace & Defence", match: "aerospace-defence", indent: true },
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

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function labelFor(key) {
    var found = DATA.sections.concat(DATA.subsections).filter(function (s) { return s.key === key; })[0];
    return found ? found.label : key;
  }

  // Flatten every article, newest edition first, with its edition date attached.
  function allArticles() {
    var out = [];
    DATA.editions.forEach(function (ed) {
      ed.articles.forEach(function (a) {
        out.push(Object.assign({ editionDate: ed.date }, a));
      });
    });
    return out;
  }

  function sortByRank(list) {
    return list.slice().sort(function (a, b) { return (a.rank || 99) - (b.rank || 99); });
  }

  function findArticle(id) {
    return allArticles().filter(function (a) { return a.id === id; })[0] || null;
  }

  function latestEdition() {
    return DATA.editions[0];
  }

  function articleLink(a) {
    return "#/article/" + encodeURIComponent(a.id);
  }

  function sectionOf(a) {
    return a.subsection || a.section;
  }

  // ---------- rendering pieces ----------
  function card(a) {
    return (
      '<article class="card">' +
        '<p class="kicker">' + esc(labelFor(sectionOf(a))) + '</p>' +
        '<h3><a class="headline" href="' + articleLink(a) + '">' + esc(a.headline) + '</a></h3>' +
        '<p class="meta"><span class="badge status">' + esc(a.status) + '</span>' + esc(fmtDate(a.publishedAt)) + '</p>' +
        '<p>' + esc(a.deck) + '</p>' +
      '</article>'
    );
  }

  function rankItem(a) {
    return (
      '<li>' +
        '<p class="kicker">' + esc(labelFor(sectionOf(a))) + '</p>' +
        '<h3><a class="headline" href="' + articleLink(a) + '">' + esc(a.headline) + '</a></h3>' +
        '<p class="meta">' + esc(a.status) + ' · ' + esc(fmtDate(a.publishedAt)) + '</p>' +
      '</li>'
    );
  }

  function emptyState(msg) {
    return '<p class="empty">' + esc(msg) + '</p>';
  }

  // ---------- views ----------
  function viewFront(editionDate) {
    var ed = editionDate
      ? DATA.editions.filter(function (e) { return e.date === editionDate; })[0]
      : latestEdition();
    if (!ed) return viewNotFound();

    var top = sortByRank(ed.articles).slice(0, 10);
    var html = '';
    html += '<p class="meta">Edition of ' + esc(fmtDate(ed.date)) + '</p>';

    if (!top.length) {
      html += emptyState("No stories in this edition.");
    } else {
      html += '<h2>Top stories of the day</h2>';
      html += '<ol class="rank-list">' + top.map(rankItem).join("") + '</ol>';
    }

    html += '<h2>Sector updates</h2>';
    DATA.sections.forEach(function (sec) {
      var items = ed.articles.filter(function (a) { return a.section === sec.key; });
      if (!items.length) return;
      html += '<h3 style="margin-top:18px"><a href="#/section/' + sec.key + '" style="color:var(--ink)">' + esc(sec.label) + '</a></h3>';
      html += '<div class="grid two">' + items.slice(0, 2).map(card).join("") + '</div>';
    });

    return html;
  }

  function viewBrowse(opts) {
    // opts: { title, kicker, filterKey, filterValue }
    var articles = allArticles();
    if (opts.filterKey === "section") {
      articles = articles.filter(function (a) { return a.section === opts.filterValue; });
    } else if (opts.filterKey === "sub") {
      articles = articles.filter(function (a) { return a.subsection === opts.filterValue; });
    }

    var html = '';
    html += '<p class="kicker">' + esc(opts.kicker || "Browse") + '</p>';
    html += '<h1>' + esc(opts.title) + '</h1>';
    html += '<div class="controls" role="search">' +
      '<div><label for="f-q">Search</label><input id="f-q" type="search" placeholder="Headline, company, topic…"></div>' +
      '<div><label for="f-date">Date</label><select id="f-date"><option value="">All dates</option>' +
        DATA.editions.map(function (e) { return '<option value="' + esc(e.date) + '">' + esc(fmtDate(e.date)) + '</option>'; }).join("") +
      '</select></div>' +
      '<div><label for="f-geo">Geography</label><select id="f-geo"><option value="">All</option>' + uniqueOpts(articles, "geography") + '</select></div>' +
      '<div><label for="f-co">Company</label><select id="f-co"><option value="">All</option>' + uniqueOpts(articles, "companies") + '</select></div>' +
      '<div><label for="f-topic">Topic</label><select id="f-topic"><option value="">All</option>' + uniqueOpts(articles, "topics") + '</select></div>' +
    '</div>';
    html += '<p class="meta" id="result-count"></p>';
    html += '<div id="results" class="grid two"></div>';

    app.innerHTML = html;

    var state = { q: "", date: "", geo: "", co: "", topic: "" };
    function apply() {
      var q = state.q.toLowerCase();
      var list = articles.filter(function (a) {
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
      document.getElementById("result-count").textContent = list.length + " article" + (list.length === 1 ? "" : "s") + " found";
      document.getElementById("results").innerHTML = list.length ? list.map(card).join("") : emptyState("No articles match these filters.");
    }

    var bind = function (id, key, evt) {
      document.getElementById(id).addEventListener(evt || "change", function (e) {
        state[key] = e.target.value;
        apply();
      });
    };
    bind("f-q", "q", "input");
    bind("f-date", "date");
    bind("f-geo", "geo");
    bind("f-co", "co");
    bind("f-topic", "topic");
    apply();
    return null; // rendered directly
  }

  function uniqueOpts(articles, field) {
    var set = {};
    articles.forEach(function (a) {
      var v = a[field];
      (Array.isArray(v) ? v : [v]).forEach(function (x) { if (x) set[x] = true; });
    });
    return Object.keys(set).sort().map(function (x) {
      return '<option value="' + esc(x) + '">' + esc(x) + '</option>';
    }).join("");
  }

  function viewArticle(id) {
    var a = findArticle(id);
    if (!a) return viewNotFound();
    var facts = (a.keyFacts || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join("");
    var html = '';
    html += '<div class="article">';
    html += '<a class="back" href="#/">← Back to front page</a>';
    html += '<p class="kicker">' + esc(labelFor(sectionOf(a))) + '</p>';
    html += '<h1>' + esc(a.headline) + '</h1>';
    html += '<p class="deck">' + esc(a.deck) + '</p>';
    html += '<p class="meta"><span class="badge status">' + esc(a.status) + '</span>' +
      'Published ' + esc(fmtDate(a.publishedAt)) + ' · Event date ' + esc(fmtDate(a.eventDate)) + '</p>';
    html += '<div class="pill-row">' +
      (a.companies || []).map(function (c) { return '<span class="pill">' + esc(c) + '</span>'; }).join("") +
      (a.topics || []).map(function (t) { return '<span class="pill">' + esc(t) + '</span>'; }).join("") +
      '</div>';

    html += '<section><h2>What happened</h2><p>' + esc(a.whatHappened) + '</p></section>';
    html += '<section><h2>Key facts</h2><ul>' + facts + '</ul></section>';
    html += '<section><h2>Why it matters</h2><p>' + esc(a.whyItMatters) + '</p></section>';
    html += '<section><h2>Investment banking angle</h2><p>' + esc(a.ibAngle) + '</p></section>';
    html += '<section><h2>Sector implications</h2><p>' + esc(a.sectorImplications) + '</p></section>';
    html += '<section><h2>Source</h2><div class="sourcebox">' +
      esc(a.source.name) + ': <a href="' + esc(a.source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.source.url) + '</a>' +
      '<br>Always check the original filing or announcement before relying on a figure.</div></section>';
    html += '</div>';
    return html;
  }

  function viewArchive() {
    var html = '<p class="kicker">Archive</p><h1>Past editions</h1>';
    html += '<p class="meta">Each edition is saved by date. Choose a date to open that day\'s front page.</p>';
    html += '<ul class="rank-list">';
    DATA.editions.forEach(function (ed) {
      html += '<li><h3><a class="headline" href="#/edition/' + esc(ed.date) + '">' + esc(fmtDate(ed.date)) + '</a></h3>' +
        '<p class="meta">' + ed.articles.length + ' stories</p></li>';
    });
    html += '</ul>';
    return html;
  }

  function viewNotFound() {
    return '<h1>Page not found</h1><p>This page does not exist. <a href="#/">Return to the front page</a>.</p>';
  }

  // ---------- router ----------
  function route() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").map(decodeURIComponent);
    var head = parts[0] || "";
    var html = null;

    setActiveNav(head, parts);

    if (head === "" || head === "front") {
      html = viewFront(null);
    } else if (head === "edition") {
      html = viewFront(parts[1]);
    } else if (head === "article") {
      html = viewArticle(parts[1]);
    } else if (head === "archive") {
      html = viewArchive();
    } else if (head === "section") {
      var sec = DATA.sections.filter(function (s) { return s.key === parts[1]; })[0];
      if (!sec) { html = viewNotFound(); }
      else { viewBrowse({ title: sec.label, kicker: "Section", filterKey: "section", filterValue: sec.key }); return; }
    } else if (head === "sub") {
      var sub = DATA.subsections.filter(function (s) { return s.key === parts[1]; })[0];
      if (!sub) { html = viewNotFound(); }
      else { viewBrowse({ title: sub.label, kicker: "Industrials Intelligence", filterKey: "sub", filterValue: sub.key }); return; }
    } else if (head === "browse") {
      viewBrowse({ title: "All coverage", kicker: "Browse", filterKey: "", filterValue: "" });
      return;
    } else {
      html = viewNotFound();
    }

    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function setActiveNav(head, parts) {
    var current = head === "" ? "front" : head;
    var key = head === "section" || head === "sub" ? parts[1] : current;
    if (head === "edition" || head === "article") key = "front";
    document.querySelectorAll("#navlist a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-match") === key);
    });
  }

  function buildChrome() {
    var list = document.getElementById("navlist");
    list.innerHTML = NAV.map(function (n) {
      return '<li><a href="' + n.href + '" data-match="' + n.match + '">' + esc(n.label) + '</a></li>';
    }).join("");

    document.getElementById("notice").textContent = DATA.masthead.notice;
    document.getElementById("tagline").textContent = DATA.masthead.tagline;
    var today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    document.getElementById("dateline").textContent = today;
    document.title = DATA.masthead.name;
  }

  // ---------- start ----------
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
      window.addEventListener("hashchange", route);
    })
    .catch(function (err) {
      app.innerHTML = '<p class="empty">The newspaper could not load its content. ' + esc(err.message) + '</p>';
    });
})();

