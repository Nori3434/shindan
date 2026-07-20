// 診断ロジック — 純粋関数。DOM 依存なし（Node のテストからも import できる）
// 仕様: ../diagnosis-matrix.md §2。報酬額は順位決定のいかなる段階でも参照しない（誠実設計）。

import { COMPANIES, EXCLUSION_REASONS, TIEBREAK_PAIRS } from "./data.js";

/**
 * @param {{q1: string, q2: string, q3: string, age25?: boolean}} answers
 * @returns {{winners: string[], ranked: {id: string, score: number}[], excluded: {id: string, reason: string}[]}}
 */
export function diagnose(answers) {
  const { q1, q2, q3, age25 = false } = answers;

  // 1) 除外ゲート（§2-1）: base が null のルートは候補集合から物理的に外す
  const excluded = [];
  const candidates = [];
  for (const [id, c] of Object.entries(COMPANIES)) {
    if (c.base[q1] == null) {
      excluded.push({
        id,
        reason: EXCLUSION_REASONS[q1]?.[id] ?? "この回答では候補対象外",
      });
    } else {
      candidates.push(id);
    }
  }

  // 2) 加点（§2-2）: 基礎点 + 経済圏 + 重視点（US ルートの COST は為替基準に置き換え）
  const scored = candidates.map((id) => {
    const c = COMPANIES[id];
    let score = c.base[q1] + (c.econ[q2] ?? 0);
    if (q1 === "US" && q3 === "COST") {
      score += c.usCost; // 置き換え: 国内株手数料基準の pref.COST は加算しない
    } else {
      score += c.pref[q3] ?? 0;
    }
    return { id, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // 3) 同点タイブレーク（§2-3）: 報酬は使わない
  const top = scored[0].score;
  let leaders = scored.filter((s) => s.score === top).map((s) => s.id);

  if (leaders.length > 1) {
    // 3-1) Q1 商品フィット基礎点が高い方
    const maxBase = Math.max(...leaders.map((id) => COMPANIES[id].base[q1]));
    leaders = leaders.filter((id) => COMPANIES[id].base[q1] === maxBase);
  }
  if (leaders.length > 1) {
    // 3-2) マトリクスで明文化された優先ペアのみ適用
    for (const [hi, lo] of TIEBREAK_PAIRS[q1] ?? []) {
      if (leaders.includes(hi) && leaders.includes(lo)) {
        leaders = leaders.filter((id) => id !== lo);
      }
    }
  }
  if (leaders.length > 1 && age25 && leaders.includes("MATSUI")) {
    // 3-3) 25歳以下（国内株の手数料無料）→ 松井を優遇
    leaders = ["MATSUI"];
  }
  // 3-4) なお同点なら両論併記（leaders をそのまま返す）

  return { winners: leaders, ranked: scored, excluded };
}
