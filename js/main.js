import { t, setLang, getLang, tScenario, chapterText } from "./i18n.js";
import { loadProfile, saveProfile, listSaves, writeSave, deleteSave, createSavePayload, defaultProfile } from "./storage.js";
import { getAllScenarios, getScenario } from "./data/scenarios.js";
import { getSceneImage } from "./assets/sceneArt.js";
import {
  initBattle,
  getMissionText,
  serializeBattle,
  deserializeBattle,
} from "./game/battle.js";
import {
  initCommanderState,
  refreshCommanderTurn,
  issueCommandOrder,
  getOrderChoices,
  getReportFeed,
  getBattleLog,
  tickFieldReports,
} from "./game/commander.js";
import { UNIT_TYPES } from "./game/units.js";
import { getTerrainAt } from "./game/terrain.js";
import { getDialogues } from "./data/dialogues.js";
import { getUnitSpriteHTML, getFactionLabel, getFactionFlag } from "./assets/unitSprites.js";
import { applyMapBackground } from "./assets/mapBackgrounds.js";
import { computeMapTilePx } from "./assets/mapTileSize.js";
import { getPortraitUrl } from "./assets/portraitArt.js";
import { getDocument, getDocumentArtUrl } from "./assets/documentArt.js";
import { getSceneAsset, getMapAsset } from "./data/imageAssets.js";
import { MAP_TO_GEO } from "./data/geoMaps.js";
import { TITLE_SLIDES, preloadTitleSlides } from "./assets/titleArt.js";

const app = document.getElementById("app");
let profile = loadProfile();
let battleState = null;
let currentScreen = "title";
let pendingScenarioId = null;
let dialogueIndex = 0;
let reportPulseTimer = null;
let titleSlideTimer = null;

function $(sel) {
  return app.querySelector(sel);
}

function showToast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}

function render() {
  setLang(profile.lang || getLang());
  app.innerHTML = buildScreens();
  bindEvents();
  if (currentScreen === "briefing") updateBriefingMission();
  if (currentScreen === "dialogue") bindDialogueEvents();
  if (currentScreen === "battle" && battleState) {
    renderBattleGrid();
    renderCommanderPanel();
    bindOrderChoices();
    startReportPulse();
  } else {
    stopReportPulse();
  }
  if (currentScreen === "title") initTitleScreenEffects();
  else stopTitleSlide();
}

function buildTitleScreen() {
  const slides = TITLE_SLIDES.map(
    (src, i) =>
      `<div class="title-slide${i === 0 ? " active" : ""}" style="background-image:url('${src}')" role="img" aria-hidden="${i !== 0}"></div>`
  ).join("");
  const lang = getLang();
  return `
    <div class="screen title-screen ${currentScreen === "title" ? "active" : ""}" id="screen-title">
      <div class="title-cinema" aria-hidden="true">
        <div class="title-slides">${slides}</div>
        <div class="title-gradient"></div>
        <div class="title-grain"></div>
        <div class="title-scanlines"></div>
      </div>
      <header class="title-brand-block">
        <p class="title-edition">${t("titleEdition")}</p>
        <h1 class="title-logo">${t("gameTitle")}</h1>
        <p class="title-sub">${t("gameSub")}</p>
        <p class="title-tagline">${t("titleTagline")}</p>
      </header>
      <div class="title-layout">
        <div class="title-menu-panel">
          <p class="title-menu-hint">${t("titlePressStart")}</p>
          <button class="menu-btn primary title-btn-start" data-action="campaign">${t("campaign")}</button>
          <button class="menu-btn" data-action="continue">${t("continueGame")}</button>
          <button class="menu-btn" data-action="upgrades">${t("upgrades")}</button>
          <button class="menu-btn" data-action="saves">${t("saves")}</button>
          <button class="menu-btn" data-action="quick-save">${t("save")}</button>
          <button class="menu-btn title-btn-muted" data-action="new-game">${lang === "ko" ? "새 게임 (초기화)" : "New Game (Reset)"}</button>
          <div class="lang-row title-lang-row">
            <button class="lang-btn ${lang === "ko" ? "active" : ""}" data-lang="ko">한국어</button>
            <button class="lang-btn ${lang === "en" ? "active" : ""}" data-lang="en">English</button>
          </div>
        </div>
      </div>
      <footer class="title-footer">
        <span class="title-footer-badge">KW</span>
        <span>${lang === "ko" ? "오프라인 브라우저 전략 · PWA" : "Offline browser tactics · PWA"}</span>
      </footer>
    </div>`;
}

function buildScreens() {
  return `
    ${buildTitleScreen()}

    <div class="screen ${currentScreen === "campaign" ? "active" : ""}" id="screen-campaign">
      <div class="top-bar">
        <button class="icon-btn" data-action="back-title">←</button>
        <h2>${t("campaignMap")}</h2>
        <span class="gold-display-inline">🎖 ${profile.gold}</span>
      </div>
      <div class="campaign-scroll">${buildCampaignList()}</div>
    </div>

    <div class="screen ${currentScreen === "dialogue" ? "active" : ""}" id="screen-dialogue">
      ${currentScreen === "dialogue" ? buildDialogue() : ""}
    </div>

    <div class="screen ${currentScreen === "briefing" ? "active" : ""}" id="screen-briefing">
      ${currentScreen === "briefing" ? buildBriefing() : ""}
    </div>

    <div class="screen ${currentScreen === "battle" ? "active" : ""}" id="screen-battle">
      ${buildBattleHud()}
      <div class="battle-layout commander-layout-v2">
        <div class="commander-battle-row">
          <div class="battle-map-frame commander-map-frame">
            <div class="map-title-bar" id="map-title-bar"></div>
            <div class="battle-grid-wrap">
              <div class="map-stage" id="map-stage">
                <div id="battle-grid"></div>
              </div>
            </div>
          </div>
          <aside class="order-rail" id="order-choices" aria-label="${t("mapOrders")}"></aside>
        </div>
        <div class="situation-report-panel">
          <div class="report-panel-header">
            <span class="report-panel-title">${t("situationReport")}</span>
            <span class="report-panel-hint">${t("reportStreaming")}</span>
          </div>
          <div class="situation-report-feed" id="situation-report"></div>
        </div>
      </div>
    </div>

    <div class="screen ${currentScreen === "upgrades" ? "active" : ""}" id="screen-upgrades">
      <div class="top-bar">
        <button class="icon-btn" data-action="back-title">←</button>
        <h2>${t("upgrades")}</h2>
      </div>
      <div class="gold-display">${t("gold")}: <strong>${profile.gold}</strong></div>
      <div class="upgrade-grid">${buildUpgrades()}</div>
    </div>

    <div class="screen ${currentScreen === "saves" ? "active" : ""}" id="screen-saves">
      <div class="top-bar">
        <button class="icon-btn" data-action="back-title">←</button>
        <h2>${t("saves")}</h2>
      </div>
      <div class="save-list">${buildSaveList()}</div>
    </div>

    <div class="modal-overlay" id="modal-save">
      <div class="modal">
        <h3>${t("saveGame")}</h3>
        <label>${t("saveMemo")}</label>
        <textarea id="save-memo" placeholder="${t("saveMemoPlaceholder")}"></textarea>
        <div class="modal-actions">
          <button data-action="save-cancel">${t("cancel")}</button>
          <button class="primary" data-action="save-confirm">${t("confirm")}</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="modal-result">
      <div class="modal">
        <h3 id="result-title"></h3>
        <div class="result-stars" id="result-stars"></div>
        <p id="result-msg"></p>
        <div class="modal-actions">
          <button data-action="result-retry">${t("retry")}</button>
          <button class="primary" data-action="result-next">${t("nextScenario")}</button>
        </div>
      </div>
    </div>
  `;
}

function buildCampaignList() {
  let html = "";
  for (let ch = 1; ch <= 6; ch++) {
    const ct = chapterText(ch - 1);
    html += `<div class="chapter-block">
      <div class="chapter-title">${t("chapter", ch)}: ${ct.title} (${ct.years})</div>
      <div class="chapter-summary">${ct.summary}</div>`;
    const scenarios = getAllScenarios().filter((s) => s.chapter === ch);
    for (const s of scenarios) {
      const locked = s.id > profile.unlockedScenario;
      const stars = profile.stars[s.id] || 0;
      const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
      html += `<div class="scenario-card ${locked ? "locked" : ""}" data-scenario="${s.id}">
        <div class="scenario-num">${s.id}</div>
        <div class="scenario-info">
          <h3>${tScenario(s.id, "title")}</h3>
          <span>${locked ? t("locked") : starStr}</span>
        </div>
        <div class="stars">${locked ? "🔒" : ""}</div>
      </div>`;
    }
    html += `</div>`;
  }
  return html;
}

function buildDialogue() {
  const lines = getDialogues(pendingScenarioId);
  if (!lines.length) return "";
  const entry = lines[dialogueIndex] || lines[lines.length - 1];
  const lang = getLang();
  const sc = getScenario(pendingScenarioId);
  const sceneImg = sc ? getSceneImage(sc.scene) : "";
  const sceneBg = sceneImg ? `url('${sceneImg}')` : "none";
  const progress = `${dialogueIndex + 1} / ${lines.length}`;
  const nextLabel = dialogueIndex >= lines.length - 1 ? t("toBriefing") : t("dialogueNext");

  let body = "";
  if (entry.type === "narrator") {
    const text = lang === "en" ? entry.en : entry.ko;
    body = `
      <div class="dialogue-narrator">
        <span class="narrator-tag">${t("narrator")}</span>
        <p class="dialogue-text">${text}</p>
      </div>`;
  } else if (entry.type === "document") {
    const doc = getDocument(entry.docId);
    const art = getDocumentArtUrl();
    if (doc) {
      const paper = lang === "en" ? doc.paperEn : doc.paperKo;
      const date = lang === "en" ? doc.dateEn : doc.dateKo;
      const headline = lang === "en" ? doc.headlineEn : doc.headlineKo;
      const bodyText = lang === "en" ? doc.bodyEn : doc.bodyKo;
      body = `
        <div class="document-card anim-doc-in">
          ${art ? `<img class="document-art" src="${art}" alt="" />` : ""}
          <div class="document-meta">
            <span class="document-paper">${paper}</span>
            <span class="document-date">${date}</span>
          </div>
          <h3 class="document-headline">${headline}</h3>
          <p class="document-body">${bodyText}</p>
          <p class="document-note">${t("documentNote")}</p>
        </div>`;
    }
  } else {
    const name = lang === "en" ? entry.nameEn : entry.nameKo;
    const text = lang === "en" ? entry.en : entry.ko;
    const portrait = getPortraitUrl(entry.id, entry.faction);
    body = `
      <div class="dialogue-speaker-row">
        <img class="dialogue-portrait-img" src="${portrait}" alt="" />
        <div class="dialogue-box faction-border-${entry.faction || "rok"}">
          <div class="dialogue-speaker">${name}</div>
          <p class="dialogue-text">${text}</p>
        </div>
      </div>`;
  }

  return `
    <div class="top-bar">
      <button class="icon-btn" data-action="back-campaign">←</button>
      <h2>${t("storyScene")} · ${tScenario(pendingScenarioId, "title")}</h2>
    </div>
    <div class="dialogue-stage" style="background-image:${sceneBg}">
      <div class="dialogue-stage-vignette"></div>
      <div class="dialogue-body">${body}</div>
      <div class="dialogue-progress">${progress}</div>
    </div>
    <div class="briefing-actions">
      <button class="menu-btn" data-action="dialogue-skip">${t("dialogueSkip")}</button>
      <button class="menu-btn primary" data-action="dialogue-next">${nextLabel}</button>
    </div>
  `;
}

function bindDialogueEvents() {
  /* handled via data-action */
}

function advanceDialogue() {
  const lines = getDialogues(pendingScenarioId);
  if (dialogueIndex < lines.length - 1) {
    dialogueIndex += 1;
    currentScreen = "dialogue";
    render();
  } else {
    currentScreen = "briefing";
    render();
  }
}

function skipDialogue() {
  currentScreen = "briefing";
  render();
}

function preloadScenarioAssets(id) {
  const sc = getScenario(id);
  if (!sc) return;
  [getSceneAsset(sc.scene), getMapAsset(MAP_TO_GEO[sc.map])].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function startScenarioFlow(id) {
  pendingScenarioId = id;
  dialogueIndex = 0;
  preloadScenarioAssets(id);
  const lines = getDialogues(id);
  currentScreen = lines.length ? "dialogue" : "briefing";
  render();
}

function buildBriefing() {
  const id = pendingScenarioId;
  const sc = getScenario(id);
  if (!sc) return "";
  const sceneImg = getSceneImage(sc.scene);
  const bgUrl = sceneImg ? `url('${sceneImg}')` : "none";
  return `
    <div class="top-bar">
      <button class="icon-btn" data-action="back-campaign">←</button>
      <h2>${id}. ${tScenario(id, "title")}</h2>
    </div>
    <div class="briefing-body">
      <div class="briefing-scene" style="background-image:${bgUrl}">
        <span class="briefing-scene-label">${t("location")}: ${tScenario(id, "location")}</span>
      </div>
      <p class="briefing-text">${tScenario(id, "story")}</p>
      <p class="briefing-chars"><strong>${t("characters")}:</strong> ${tScenario(id, "chars")}</p>
      <div class="mission-box" id="briefing-mission"></div>
    </div>
    <div class="briefing-actions">
      <button class="menu-btn" data-action="dialogue-replay">${t("storyScene")}</button>
      <button class="menu-btn" data-action="back-campaign">${t("back")}</button>
      <button class="menu-btn primary" data-action="start-battle">${t("startBattle")}</button>
    </div>
  `;
}

function buildBattleHud() {
  if (!battleState) return "";
  const mapName = battleState.map?.displayName || "";
  const c = battleState.commander || {};
  return `
    <div class="top-bar">
      <button class="icon-btn" data-action="back-campaign">←</button>
      <h2>#${battleState.scenarioId} ${tScenario(battleState.scenarioId, "title")}</h2>
      <button class="icon-btn" data-action="open-save">💾</button>
    </div>
    <div class="battle-hud">
      <div class="hud-item">${t("commandPost")}</div>
      <div class="hud-item">${t("tacticalMap")}: <span>${mapName}</span></div>
      <div class="hud-item">${t("turn")}: <span>${battleState.turn}/${battleState.turnLimit}</span></div>
      <div class="hud-item">${t("supplies")}: <span>${Math.round(c.supplies ?? 0)}%</span></div>
      <div class="hud-item">${t("morale")}: <span>${Math.round(c.morale ?? 0)}%</span></div>
      <div class="hud-item">${t("mission")}: <span id="mission-text">${getMissionText(battleState)}</span></div>
    </div>
  `;
}

function buildUpgrades() {
  const types = ["infantry", "tank", "artillery"];
  return types
    .map((type) => {
      const u = profile.upgrades[type];
      const base = UNIT_TYPES[type];
      const cost = (u.atk + u.hp + u.mov + 1) * 40;
      return `<div class="upgrade-card">
        <h4>${t(type)}</h4>
        <div class="upgrade-stat">${t("atk")}: ${base.atk + u.atk * 2} (+${u.atk})</div>
        <div class="upgrade-stat">${t("hp")}: ${base.hp + u.hp * 5} (+${u.hp})</div>
        <div class="upgrade-stat">${t("mov")}: ${base.mov + u.mov} (+${u.mov})</div>
        <button data-upgrade="${type}" ${profile.gold < cost ? "disabled" : ""}>${t("upgrade")} (${cost})</button>
      </div>`;
    })
    .join("");
}

function buildSaveList() {
  const saves = listSaves();
  if (!saves.length) return `<p class="empty-msg">${t("noSaves")}</p>`;
  return saves
    .map(
      (s) => `
    <div class="save-item" data-save-id="${s.id}">
      <h4>${new Date(s.timestamp).toLocaleString()}</h4>
      <div class="meta">${t("campaign")} #${s.profile?.currentScenario || s.battle?.scenarioId || "?"} · 🎖 ${s.profile?.gold ?? 0}</div>
      <div class="memo">${s.memo || "—"}</div>
      <button class="menu-btn" style="margin-top:0.5rem;width:100%" data-delete-save="${s.id}">${t("delete")}</button>
    </div>`
    )
    .join("");
}

function renderCombatFxLayer(stage, fxList, tilePx) {
  if (!stage) return;
  let layer = stage.querySelector(".combat-fx-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "combat-fx-layer";
    layer.setAttribute("aria-hidden", "true");
    stage.appendChild(layer);
  }
  layer.innerHTML = "";
  const half = tilePx / 2;
  const hits = fxList.filter((f) => f.kind === "hit" || f.kind === "shell" || f.kind === "air");
  const toRender = fxList.length > 36 ? [...fxList.slice(-28), ...hits.slice(-8)] : fxList;
  if (hits.length >= 4) stage.classList.add("combat-barrage");
  else stage.classList.remove("combat-barrage");

  for (const fx of toRender) {
    const tx = fx.tx ?? fx.x;
    const ty = fx.ty ?? fx.y;
    if (tx == null || ty == null) continue;
    const cx = tx * tilePx + half;
    const cy = ty * tilePx + half;

    if (fx.kind === "hit" && fx.fx != null && fx.fy != null) {
      const tracer = document.createElement("div");
      tracer.className = `combat-tracer tracer-${fx.side || "ally"}`;
      const x1 = fx.fx * tilePx + half;
      const y1 = fx.fy * tilePx + half;
      const len = Math.hypot(cx - x1, cy - y1) || 1;
      const ang = (Math.atan2(cy - y1, cx - x1) * 180) / Math.PI;
      tracer.style.left = `${x1}px`;
      tracer.style.top = `${y1}px`;
      tracer.style.width = `${len}px`;
      tracer.style.transform = `rotate(${ang}deg)`;
      layer.appendChild(tracer);

      const muzzle = document.createElement("div");
      muzzle.className = "combat-muzzle";
      muzzle.style.left = `${x1}px`;
      muzzle.style.top = `${y1}px`;
      layer.appendChild(muzzle);
    }

    if (fx.kind === "shell" || fx.kind === "air") {
      const boom = document.createElement("div");
      boom.className = fx.kind === "air" ? "combat-airburst" : "combat-explosion";
      boom.style.left = `${cx}px`;
      boom.style.top = `${cy}px`;
      layer.appendChild(boom);
    }

    if (fx.kind === "hit" || fx.kind === "shell" || fx.kind === "air") {
      const flash = document.createElement("div");
      flash.className = "combat-flash";
      flash.style.left = `${cx}px`;
      flash.style.top = `${cy}px`;
      layer.appendChild(flash);

      const smoke = document.createElement("div");
      smoke.className = "combat-smoke";
      smoke.style.left = `${cx}px`;
      smoke.style.top = `${cy}px`;
      layer.appendChild(smoke);

      const spark = document.createElement("div");
      spark.className = "combat-spark";
      spark.style.left = `${cx}px`;
      spark.style.top = `${cy}px`;
      layer.appendChild(spark);
    }

    if (fx.dmg > 0) {
      const dmg = document.createElement("div");
      dmg.className = `combat-dmg ${fx.side === "enemy" ? "dmg-enemy" : "dmg-ally"}`;
      dmg.textContent = `-${fx.dmg}`;
      dmg.style.left = `${cx}px`;
      dmg.style.top = `${cy - 6}px`;
      layer.appendChild(dmg);
    }

    if (fx.kind === "death") {
      const skull = document.createElement("div");
      skull.className = "combat-death-puff";
      skull.style.left = `${cx}px`;
      skull.style.top = `${cy}px`;
      layer.appendChild(skull);
    }
  }

  if (hits.length) {
    stage.classList.remove("battle-shake");
    void stage.offsetWidth;
    stage.classList.add("battle-shake");
    window.setTimeout(() => stage.classList.remove("battle-shake"), 480);
  }
}

function renderBattleGrid() {
  const grid = document.getElementById("battle-grid");
  const mapStage = document.getElementById("map-stage");
  const mapTitle = document.getElementById("map-title-bar");
  if (!grid || !battleState) return;
  const { map, units } = battleState;
  const lang = getLang();
  const liveUnits = units.filter((u) => u.hp > 0);
  const tilePx = computeMapTilePx(map.cols, map.rows, liveUnits.length);
  const wrap = document.querySelector(".battle-grid-wrap");
  if (wrap) wrap.classList.toggle("battle-dense", liveUnits.length > 22);
  grid.style.gridTemplateColumns = `repeat(${map.cols}, ${tilePx}px)`;
  grid.style.gridTemplateRows = `repeat(${map.rows}, ${tilePx}px)`;
  grid.innerHTML = "";
  if (mapStage) {
    mapStage.style.width = `${map.cols * tilePx}px`;
    mapStage.style.height = `${map.rows * tilePx}px`;
    applyMapBackground(mapStage, map.geoKey);
  }
  if (mapTitle) mapTitle.textContent = `🗺 ${map.displayName || ""}`;

  const recentMoves = battleState.commander?.recentMoves || [];
  const combatFx = battleState.commander?.combatFx || [];
  const hitTiles = new Set(combatFx.map((f) => `${f.tx},${f.ty}`));
  const fireTiles = new Set(combatFx.filter((f) => f.fx != null).map((f) => `${f.fx},${f.fy}`));
  const objectives = map.objectives || [];
  const esc = map.escape;

  for (let y = 0; y < map.rows; y++) {
    for (let x = 0; x < map.cols; x++) {
      const terr = getTerrainAt(map, x, y);
      const tile = document.createElement("div");
      tile.className = `tile ${terr}`;
      tile.dataset.x = x;
      tile.dataset.y = y;

      const mapLabel = (map.labels || []).find((l) => l.x === x && l.y === y);
      if (mapLabel) {
        tile.dataset.landmark = mapLabel.text;
        tile.title = mapLabel.text;
      }

      const isObjective = objectives.some((o) => o.x === x && o.y === y);
      if (isObjective) {
        tile.classList.add("objective", "mission-objective");
        const flag = document.createElement("div");
        flag.className = "mission-red-flag";
        flag.setAttribute(
          "aria-label",
          lang === "ko" ? "작전 목표 — 붉은 깃발 점령지" : "Mission objective — red flag"
        );
        flag.title = lang === "ko" ? "작전 목표 (점령)" : "Capture objective";
        flag.innerHTML = '<span class="flag-pole"></span><span class="flag-cloth"></span>';
        tile.appendChild(flag);
      }
      if (esc && x >= esc.x && x < esc.x + esc.w && y >= esc.y && y < esc.y + esc.h) {
        tile.classList.add("escape-zone");
        const escFlag = document.createElement("div");
        escFlag.className = "mission-escape-flag";
        escFlag.title = lang === "en" ? "Escape zone" : "탈출 구역";
        escFlag.innerHTML = '<span class="flag-pole"></span><span class="flag-cloth esc"></span>';
        tile.appendChild(escFlag);
        tile.title = escFlag.title;
      }

      const key = `${x},${y}`;
      if (hitTiles.has(key)) tile.classList.add("tile-hit");
      if (fireTiles.has(key)) tile.classList.add("tile-firing");

      const here = units.filter((u) => u.hp > 0 && u.x === x && u.y === y);
      if (here.length > 1) tile.classList.add("tile-stacked");
      here.forEach((unit, stackIdx) => {
        const el = document.createElement("div");
        el.className = `unit ${unit.side} ${unit.type} faction-${unit.faction}`;
        if (unit.civ) el.classList.add("civ");
        const moved = recentMoves.some((m) => m.id === unit.id && m.to.x === x && m.to.y === y);
        if (moved) el.classList.add("unit-animated");
        const hitHere = combatFx.some(
          (f) => f.tx === x && f.ty === y && (f.kind === "hit" || f.kind === "shell" || f.kind === "air")
        );
        if (hitHere) el.classList.add("unit-hit");
        if (here.length > 1) {
          el.classList.add("unit-stacked");
          const off = stackIdx * 4;
          el.style.transform = `translate(${off}px, ${-off}px)`;
        }
        const hpPct = (unit.hp / unit.maxHp) * 100;
        const tag = unit.civ ? (lang === "en" ? "Civ" : "민") : getFactionLabel(unit.faction, lang);
        const flag = getFactionFlag(unit.faction);
        el.innerHTML = `${getUnitSpriteHTML(unit)}
          <span class="unit-faction-tag"><span class="unit-flag" aria-hidden="true">${flag}</span>${tag}</span>
          <div class="unit-hp"><div class="unit-hp-fill" style="width:${hpPct}%"></div></div>`;
        el.title = `${unit.label} HP ${unit.hp}/${unit.maxHp}`;
        tile.appendChild(el);
      });

      grid.appendChild(tile);
    }
  }

  renderCombatFxLayer(mapStage, combatFx, tilePx);

  const mt = document.getElementById("mission-text");
  if (mt) mt.textContent = getMissionText(battleState);
}

function renderCommanderPanel() {
  const reportEl = document.getElementById("situation-report");
  const choicesEl = document.getElementById("order-choices");
  if (!battleState || !reportEl || !choicesEl) return;
  const lang = getLang();
  const feed = getReportFeed(battleState);
  const prevCount = parseInt(reportEl.dataset.count || "0", 10);
  const newCount = Math.max(0, feed.length - prevCount);

  reportEl.innerHTML = feed
    .map((entry, i) => {
      const isNew = newCount > 0 && i >= feed.length - newCount;
      const cls = `report-line${entry.urgent ? " report-urgent" : ""}${isNew ? " report-new" : ""}`;
      return `<p class="${cls}"><span class="report-time">${entry.at}</span> ${entry.text}</p>`;
    })
    .join("");
  reportEl.dataset.count = String(feed.length);
  reportEl.scrollTop = reportEl.scrollHeight;

  const disabled = !!battleState.result;
  const choices = getOrderChoices(battleState);
  choicesEl.innerHTML = `
    <div class="order-rail-title">${t("mapOrders")}</div>
    <div class="order-rail-buttons">
      ${choices
        .map((o) => {
          const short = getOrderShortLabel(o.id, lang);
          const tip = lang === "en" ? `${o.en}\n${o.descEn}` : `${o.ko}\n${o.descKo}`;
          return `<button type="button" class="order-circle-btn" data-order-id="${o.id}" ${disabled ? "disabled" : ""} title="${tip.replace(/"/g, "&quot;")}">
            <span class="order-circle-text">${short}</span>
          </button>`;
        })
        .join("")}
    </div>`;
}

const ORDER_SHORT_KO = {
  full_assault: "돌격",
  hold_line: "방어",
  artillery_prep: "포격",
  recon_push: "정찰",
  flank_march: "우회",
  supply_priority: "보급",
  air_request: "공군",
  tactical_withdraw: "후퇴",
  dig_in: "참호",
  commit_reserve: "예비",
  smoke_screen: "연막",
  rear_guard: "경계",
};

const ORDER_SHORT_EN = {
  full_assault: "ATK",
  hold_line: "HLD",
  artillery_prep: "SHT",
  recon_push: "RCN",
  flank_march: "FLK",
  supply_priority: "SUP",
  air_request: "AIR",
  tactical_withdraw: "RTD",
  dig_in: "DIG",
  commit_reserve: "RSV",
  smoke_screen: "SMK",
  rear_guard: "GRD",
};

function getOrderShortLabel(orderId, lang) {
  const map = lang === "en" ? ORDER_SHORT_EN : ORDER_SHORT_KO;
  return map[orderId] || "?";
}

function startReportPulse() {
  stopReportPulse();
  reportPulseTimer = setInterval(() => {
    if (!battleState || battleState.result || currentScreen !== "battle") {
      stopReportPulse();
      return;
    }
    battleState = tickFieldReports(battleState);
    renderCommanderPanel();
    bindOrderChoices();
  }, 11000);
}

function initTitleScreenEffects() {
  stopTitleSlide();
  const slides = document.querySelectorAll(".title-slide");
  if (!slides.length) return;
  let i = 0;
  titleSlideTimer = setInterval(() => {
    slides[i].classList.remove("active");
    slides[i].setAttribute("aria-hidden", "true");
    i = (i + 1) % slides.length;
    slides[i].classList.add("active");
    slides[i].setAttribute("aria-hidden", "false");
  }, 7000);
}

function stopTitleSlide() {
  if (titleSlideTimer) {
    clearInterval(titleSlideTimer);
    titleSlideTimer = null;
  }
}

function stopReportPulse() {
  if (reportPulseTimer) {
    clearInterval(reportPulseTimer);
    reportPulseTimer = null;
  }
}

function bindOrderChoices() {
  document.querySelectorAll("[data-order-id]").forEach((btn) => {
    btn.onclick = () => {
      if (!battleState || battleState.result) return;
      battleState = issueCommandOrder(battleState, btn.dataset.orderId);
      afterBattleAction();
    };
  });
}

function bindEvents() {
  app.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.onclick = () => {
      profile.lang = btn.dataset.lang;
      setLang(profile.lang);
      saveProfile(profile);
      render();
    };
  });

  app.querySelectorAll("[data-action]").forEach((btn) => {
    btn.onclick = () => handleAction(btn.dataset.action);
  });

  app.querySelectorAll("[data-scenario]").forEach((card) => {
    card.onclick = () => startScenarioFlow(parseInt(card.dataset.scenario, 10));
  });

  app.querySelectorAll("[data-upgrade]").forEach((btn) => {
    btn.onclick = () => doUpgrade(btn.dataset.upgrade);
  });

  app.querySelectorAll(".save-item").forEach((item) => {
    item.onclick = (e) => {
      if (e.target.closest("[data-delete-save]")) return;
      loadSaveSlot(item.dataset.saveId);
    };
  });

  app.querySelectorAll("[data-delete-save]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      deleteSave(btn.dataset.deleteSave);
      showToast(t("deleted"));
      render();
    };
  });

}

function updateBriefingMission() {
  const el = document.getElementById("briefing-mission");
  if (!el || !pendingScenarioId) return;
  const sc = getScenario(pendingScenarioId);
  const tmp = initBattle(pendingScenarioId, profile);
  if (tmp) initCommanderState(tmp);
  el.textContent = `${t("mission")}: ${getMissionText(tmp)} | ${t("turnLimit", sc.turnLimit)} | ${t("commanderModeBrief")}`;
}

function handleAction(action) {
  switch (action) {
    case "campaign":
      currentScreen = "campaign";
      render();
      break;
    case "continue": {
      const saves = listSaves();
      if (saves.length) loadSaveSlot(saves[0].id);
      else showToast(t("noSaves"));
      break;
    }
    case "upgrades":
      currentScreen = "upgrades";
      render();
      break;
    case "saves":
      currentScreen = "saves";
      render();
      break;
    case "quick-save":
      render();
      setTimeout(() => document.getElementById("modal-save")?.classList.add("show"), 0);
      break;
    case "new-game":
      if (confirm(getLang() === "ko" ? "진행도를 초기화하시겠습니까?" : "Reset all progress?")) {
        profile = defaultProfile();
        profile.lang = getLang();
        battleState = null;
        saveProfile(profile);
        currentScreen = "title";
        render();
      }
      break;
    case "back-title":
      currentScreen = "title";
      battleState = null;
      render();
      break;
    case "back-campaign":
      stopReportPulse();
      currentScreen = "campaign";
      battleState = null;
      dialogueIndex = 0;
      render();
      break;
    case "dialogue-next":
      advanceDialogue();
      break;
    case "dialogue-skip":
      skipDialogue();
      break;
    case "dialogue-replay":
      dialogueIndex = 0;
      currentScreen = getDialogues(pendingScenarioId).length ? "dialogue" : "briefing";
      render();
      break;
    case "start-battle":
      battleState = initBattle(pendingScenarioId, profile);
      initCommanderState(battleState);
      profile.currentScenario = pendingScenarioId;
      saveProfile(profile);
      currentScreen = "battle";
      render();
      break;
    case "open-save":
      document.getElementById("modal-save")?.classList.add("show");
      break;
    case "save-cancel":
      document.getElementById("modal-save")?.classList.remove("show");
      break;
    case "save-confirm": {
      const memo = document.getElementById("save-memo")?.value || "";
      const payload = createSavePayload(profile, battleState ? serializeBattle(battleState) : null, memo);
      writeSave(payload);
      document.getElementById("modal-save")?.classList.remove("show");
      showToast(t("saved"));
      break;
    }
    case "result-retry":
      document.getElementById("modal-result")?.classList.remove("show");
      battleState = initBattle(pendingScenarioId || battleState.scenarioId, profile);
      initCommanderState(battleState);
      render();
      break;
    case "result-next":
      document.getElementById("modal-result")?.classList.remove("show");
      currentScreen = "campaign";
      battleState = null;
      render();
      break;
  }
}

function afterBattleAction() {
  renderBattleGrid();
  renderCommanderPanel();
  bindOrderChoices();
  if (battleState?.result) showResultModal();
}

function showResultModal() {
  const modal = document.getElementById("modal-result");
  const title = document.getElementById("result-title");
  const stars = document.getElementById("result-stars");
  const msg = document.getElementById("result-msg");
  if (!modal) return;

  if (battleState.result === "victory") {
    title.textContent = t("victory");
    stars.textContent = "★".repeat(battleState.starsEarned) + "☆".repeat(3 - battleState.starsEarned);
    const prev = profile.stars[battleState.scenarioId] || 0;
    if (battleState.starsEarned > prev) profile.stars[battleState.scenarioId] = battleState.starsEarned;
    profile.gold += 30 + battleState.starsEarned * 15;
    if (battleState.scenarioId >= profile.unlockedScenario && battleState.scenarioId < 30) {
      profile.unlockedScenario = battleState.scenarioId + 1;
    }
    msg.textContent = t("missionComplete");
  } else {
    title.textContent = t("defeat");
    stars.textContent = "";
    msg.textContent = "";
  }
  saveProfile(profile);
  modal.classList.add("show");
}

function doUpgrade(type) {
  const u = profile.upgrades[type];
  const cost = (u.atk + u.hp + u.mov + 1) * 40;
  if (profile.gold < cost) return;
  const stats = ["atk", "hp", "mov"];
  const pick = stats[Math.floor(Math.random() * stats.length)];
  u[pick] += 1;
  profile.gold -= cost;
  saveProfile(profile);
  render();
}

function loadSaveSlot(id) {
  const saves = listSaves();
  const slot = saves.find((s) => s.id === id);
  if (!slot) return;
  profile = slot.profile;
  saveProfile(profile);
  if (slot.battle) {
    battleState = deserializeBattle(slot.battle);
    if (!battleState.commander) initCommanderState(battleState);
    else if (!battleState.commander.reportFeed?.length) {
      battleState.commander.reportFeed = [];
      refreshCommanderTurn(battleState, true);
    }
    pendingScenarioId = battleState.scenarioId;
    currentScreen = "battle";
  } else {
    currentScreen = "campaign";
  }
  showToast(t("loaded"));
  render();
}

function init() {
  preloadTitleSlides();
  setLang(profile.lang || getLang());
  render();
}

init();
