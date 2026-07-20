// 診断ロジックの不変条件テスト + マトリクス §4 誠実性監査の実行版
// 実行: node test/run-tests.mjs （app/ ディレクトリから）
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { diagnose } from "../logic.js";
import { COMPANIES, hasAffiliateLink } from "../data.js";

const __dir = dirname(fileURLToPath(import.meta.url));
let pass = 0;
let fail = 0;
const errors = [];

function assert(cond, msg) {
  if (cond) pass += 1;
  else {
    fail += 1;
    errors.push(msg);
  }
}

const Q1 = ["FUND", "US", "MINI", "ALL"];
const Q2 = ["RAKUTEN", "PONTA", "DOCOMO", "V", "NONE"];
const Q3 = ["COST", "SUPPORT", "TOOL"];

// ---- 不変条件（全120パターン）----
const ties3plus = [];
for (const q1 of Q1)
  for (const q2 of Q2)
    for (const q3 of Q3)
      for (const age25 of [false, true]) {
        const key = `${q1}/${q2}/${q3}/age25=${age25}`;
        const r = diagnose({ q1, q2, q3, age25 });
        assert(r.winners.length >= 1, `${key}: 行き止まり（winner なし）`);
        assert(!(["FUND", "MINI", "ALL"].includes(q1) && r.winners.includes("DMM")),
          `${key}: DMM が除外ルートで勝っている`);
        assert(!(["FUND", "MINI", "ALL"].includes(q1) && r.ranked.some((x) => x.id === "DMM")),
          `${key}: DMM が除外ルートの候補に残っている`);
        assert(!(q1 === "MINI" && r.ranked.some((x) => x.id === "MATSUI")),
          `${key}: 松井が MINI ルートの候補に残っている`);
        if (r.winners.length >= 3) ties3plus.push(key);
      }

// ---- マトリクス §4 監査行の再現（タイブレーク後の winners で判定）----
const audits = [
  { in: { q1: "FUND", q2: "NONE", q3: "COST" }, expect: ["SBI", "RAKUTEN"], row: "#1" },
  { in: { q1: "FUND", q2: "RAKUTEN", q3: "COST" }, expect: ["RAKUTEN"], row: "#2" },
  { in: { q1: "FUND", q2: "V", q3: "COST" }, expect: ["SBI"], row: "#3" },
  { in: { q1: "FUND", q2: "DOCOMO", q3: "TOOL" }, expect: ["MONEX"], row: "#4" },
  { in: { q1: "FUND", q2: "PONTA", q3: "SUPPORT" }, expect: ["AU"], row: "#5" },
  { in: { q1: "US", q2: "NONE", q3: "TOOL" }, expect: ["MONEX"], row: "#6" },
  { in: { q1: "US", q2: "NONE", q3: "COST" }, expect: ["MONEX"], row: "#7 (置き換え規則+タイブレーク2)" },
  { in: { q1: "US", q2: "NONE", q3: "SUPPORT" }, expect: ["MATSUI"], row: "#8" },
  { in: { q1: "MINI", q2: "NONE", q3: "TOOL" }, expect: ["RAKUTEN"], row: "#10" },
  { in: { q1: "MINI", q2: "PONTA", q3: "COST" }, expect: ["AU"], row: "#11(COST)" },
  { in: { q1: "MINI", q2: "PONTA", q3: "SUPPORT" }, expect: ["AU"], row: "#11(SUPPORT)" },
  { in: { q1: "ALL", q2: "NONE", q3: "COST" }, expect: ["SBI", "RAKUTEN"], row: "#12" },
  { in: { q1: "ALL", q2: "NONE", q3: "SUPPORT" }, expect: ["MATSUI", "AU"], row: "#13" },
];
for (const a of audits) {
  const r = diagnose(a.in);
  const got = [...r.winners].sort().join(",");
  const want = [...a.expect].sort().join(",");
  assert(got === want, `監査${a.row} ${a.in.q1}/${a.in.q2}/${a.in.q3}: 期待 [${want}] 実際 [${got}]`);
}

// ---- 25歳以下タイブレーク: ALL/NONE/SUPPORT は 松井/AU 同点 → age25 で松井単独 ----
{
  const r = diagnose({ q1: "ALL", q2: "NONE", q3: "SUPPORT", age25: true });
  assert(r.winners.length === 1 && r.winners[0] === "MATSUI",
    `age25 タイブレーク: 期待 [MATSUI] 実際 [${r.winners.join(",")}]`);
}

// ---- PR 表示の出し分け: 実態と表示が食い違わないこと ----
// 2026-07-20: index.html に PR 文面が直書きされており、アフィリエイトリンクが
// 1本も無い状態でも「本ページには広告を含みます」と表示されていた（実害・公開直前に発見）。
{
  assert(hasAffiliateLink({ a: { cta: { type: "a8-active" } } }) === true,
    "a8-active が居るのに PR 表示が出ない");
  assert(hasAffiliateLink({ a: { cta: { type: "official" } },
                            b: { cta: { type: "a8-pending" } } }) === false,
    "アフィリリンクが無いのに PR 表示が出てしまう");
  assert(hasAffiliateLink(COMPANIES) === Object.values(COMPANIES)
    .some((c) => c.cta.type === "a8-active"),
    "現行データに対する hasAffiliateLink の判定が COMPANIES と一致しない");

  // 静的検査: PR 文面を index.html に直書きしない（実態と乖離する原因だったため）
  const html = readFileSync(join(__dir, "..", "index.html"), "utf8");
  assert(!/本ページには広告/.test(html),
    "index.html に PR 文面が直書きされている（app.js から実態に応じて入れること）");
}

// ---- 報酬非参照の静的検査: logic.js が cta/報酬フィールドに触れていない ----
{
  const src = readFileSync(join(__dir, "..", "logic.js"), "utf8")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  assert(!/\bcta\b|\ba8\b|報酬/i.test(src), "logic.js が報酬関連フィールドを参照している（誠実設計違反）");
}

console.log(`PASS: ${pass} / FAIL: ${fail}`);
if (ties3plus.length) console.log(`3社以上の同点 (${ties3plus.length}件):`, ties3plus.slice(0, 10).join(" | "));
if (errors.length) {
  console.log("FAILURES:");
  for (const e of errors) console.log(" -", e);
  process.exit(1);
}
