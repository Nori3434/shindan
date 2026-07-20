// UI 配線 — 質問フロー・結果描画。ロジックは logic.js、データ/文言は data.js に分離。
import { QUESTIONS, COMPANIES, COMPLIANCE, hasAffiliateLink } from "./data.js";
import { diagnose } from "./logic.js";

const stage = document.getElementById("stage");
const progress = document.getElementById("progress");
const STEPS = ["q1", "q2", "q3"];
const state = { q1: null, q2: null, q3: null, age25: false, step: 0 };

const CTA_LABEL = {
  official: "広告ではありません",
  "a8-pending": "",
  "a8-active": "PR",
};

function renderProgress() {
  progress.innerHTML = STEPS.map(
    (_, i) => `<span class="dot${i < state.step ? " done" : ""}"></span>`,
  ).join("");
}

function renderQuestion() {
  const key = STEPS[state.step];
  const q = QUESTIONS[key];
  const ageRow =
    key === "q3"
      ? `<label class="age-row"><input type="checkbox" id="age25" ${state.age25 ? "checked" : ""}>
         25歳以下ですか？（任意 — 同点のときの判定にだけ使います）</label>`
      : "";
  stage.innerHTML = `
    <h2 class="q-title">Q${state.step + 1}. ${q.title}</h2>
    <div class="options">
      ${q.options
        .map(
          (o) => `<button class="opt" data-value="${o.value}">${o.label}
            ${o.note ? `<span class="note">${o.note}</span>` : ""}</button>`,
        )
        .join("")}
    </div>
    ${ageRow}
    ${state.step > 0 ? `<button class="back" id="back">← ひとつ前に戻る</button>` : ""}
  `;
  stage.querySelectorAll(".opt").forEach((btn) =>
    btn.addEventListener("click", () => {
      const age = stage.querySelector("#age25");
      if (age) state.age25 = age.checked;
      state[key] = btn.dataset.value;
      state.step += 1;
      state.step < STEPS.length ? render() : renderResult();
    }),
  );
  stage.querySelector("#back")?.addEventListener("click", () => {
    state.step -= 1;
    render();
  });
}

// rel も実態に合わせる。素の公式URLに sponsored を付けると
// バッジ「広告ではありません」と矛盾する。
function ctaRel(c) {
  return c.cta.type === "a8-active" ? "nofollow sponsored" : "nofollow";
}

function winnerCard(id) {
  const c = COMPANIES[id];
  const badge = CTA_LABEL[c.cta.type];
  return `
    <article class="winner-card">
      <h2>${c.name}${badge ? `<span class="badge">${badge}</span>` : ""}</h2>
      <p class="fit">向いている人: ${c.fit}</p>
      <p class="unfit">向いていない可能性: ${c.unfit}</p>
      <a class="cta" href="${c.cta.url}" rel="${ctaRel(c)}">${c.cta.label}</a>
      <p class="cta-note">最新の手数料・条件は必ず公式サイトでご確認ください</p>
    </article>`;
}

function renderResult() {
  renderProgress();
  const { winners, ranked, excluded } = diagnose(state);
  const tie = winners.length > 1;
  const othersRows = ranked
    .filter((r) => !winners.includes(r.id))
    .map(
      (r) =>
        `<tr><td>${COMPANIES[r.id].name}</td><td>${COMPANIES[r.id].fit}</td><td class="score">適合度 ${r.score}</td></tr>`,
    )
    .join("");
  stage.innerHTML = `
    <p class="result-label">あなたの回答に合う可能性が高いのは —</p>
    ${tie ? `<p class="tie-note">2社が同水準でした。どちらもあなたの回答に合っています。違いを見比べて選んでください。</p>` : ""}
    ${winners.map(winnerCard).join("")}
    ${
      othersRows
        ? `<section class="others"><h3>そのほかの候補（適合度順）</h3><table>${othersRows}</table></section>`
        : ""
    }
    ${
      excluded.length
        ? `<section class="excluded"><h3>今回の回答で候補から外した会社</h3>
           <ul>${excluded.map((e) => `<li>${e.reason}</li>`).join("")}</ul></section>`
        : ""
    }
    <button class="restart" id="restart">最初からやり直す</button>
  `;
  stage.querySelector("#restart").addEventListener("click", () => {
    Object.assign(state, {
      q1: null,
      q2: null,
      q3: null,
      age25: false,
      step: 0,
    });
    render();
  });
  postHeight();
}

// PR 表示は実態に合わせる。アフィリエイトリンクが 1 本も無いのに「広告を含む」と
// 出したままにすると、表示と中身が食い違う（data.js で type を戻し忘れた場合の保険）。
function renderPrLabel() {
  const el = document.getElementById("pr-label");
  if (!el) return;
  const hasAd = hasAffiliateLink(COMPANIES);
  el.textContent = hasAd ? `PR — ${COMPLIANCE.prHeader}` : "";
  el.hidden = !hasAd;
}

function renderCompliance() {
  document.getElementById("compliance").innerHTML = [
    COMPLIANCE.author,
    COMPLIANCE.neutrality,
    COMPLIANCE.nisaNote,
    COMPLIANCE.disclaimer,
  ]
    .map((t) => `<p>${t}</p>`)
    .join("");
}

// WP の iframe 埋め込み用: 高さを親ページへ通知（親側は message を受けて iframe.height を更新）
function postHeight() {
  if (window.parent !== window) {
    window.parent.postMessage(
      { type: "shindan-height", height: document.documentElement.scrollHeight },
      "*",
    );
  }
}

function render() {
  renderProgress();
  renderQuestion();
  postHeight();
}

renderPrLabel();
renderCompliance();
render();
window.addEventListener("load", postHeight);
