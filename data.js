// 証券口座診断 — 会社データ・採点表
// 出典: ../diagnosis-matrix.md（2026-07-14）。数値・判定はマトリクスが正、変更はマトリクス側を先に更新すること。
// CTA URL は全社とも「素の公式サイトURL」（2026-07-20 時点で到達確認済み）。
// アフィリエイトリンクは 1本も含まないため cta.type は全社 "official"（バッジ = 広告ではありません）。
// A8 の提携が承認された会社が出たら、その会社だけ url をアフィリリンクに、
// type を "a8-active"（バッジ = PR）に変えること。type を変えずに url だけ差し替えると
// 広告リンクが「広告ではありません」と表示され、ステマ規制上まずい状態になる。

export const ROUTES = ["FUND", "US", "MINI", "ALL"];

export const QUESTIONS = {
  q1: {
    title: "投資で、まず何をやってみたいですか？",
    options: [
      {
        value: "FUND",
        label: "投資信託で、毎月コツコツ積み立てたい",
        note: "いちばん定番・ほったらかしOK",
      },
      {
        value: "US",
        label: "アメリカの有名企業の株を買ってみたい",
        note: "Apple・Amazon など",
      },
      {
        value: "MINI",
        label: "日本の会社の株を、少額で1株ずつ買ってみたい",
        note: "数百〜数千円から",
      },
      {
        value: "ALL",
        label: "まだ決めていない／いろいろ試してみたい",
        note: "",
      },
    ],
  },
  q2: {
    title: "ふだん、よく使っているサービスはどれですか？",
    options: [
      {
        value: "RAKUTEN",
        label: "楽天",
        note: "楽天市場・楽天カードをよく使う",
      },
      {
        value: "PONTA",
        label: "au／UQ・Ponta",
        note: "au PAY や Ponta ポイントを貯めている",
      },
      {
        value: "DOCOMO",
        label: "ドコモ・dポイント",
        note: "d払い・dカードを使う",
      },
      { value: "V", label: "三井住友カード・Vポイント・Olive", note: "" },
      {
        value: "NONE",
        label: "とくにこだわりはない",
        note: "上のどれも当てはまらない",
      },
    ],
  },
  q3: {
    title: "証券口座を選ぶとき、いちばん大事にしたいことは？",
    options: [
      {
        value: "COST",
        label: "とにかく手数料を安く・コストを抑えたい",
        note: "",
      },
      {
        value: "SUPPORT",
        label: "困ったときに相談できる安心感・大手の信頼",
        note: "",
      },
      {
        value: "TOOL",
        label: "アプリの使いやすさ・情報や分析ツールの豊富さ",
        note: "",
      },
    ],
  },
};

export const COMPANIES = {
  SBI: {
    name: "SBI証券",
    // マトリクス §2-2(a) Q1商品フィット基礎点
    base: { FUND: 3, US: 2, MINI: 2, ALL: 3 },
    // §2-2(b) 経済圏加点
    econ: { RAKUTEN: 0, PONTA: 1, DOCOMO: 1, V: 2, NONE: 0 },
    // §2-2(c) 重視点加点（通常ルート）
    pref: { COST: 1, SUPPORT: 0, TOOL: 1 },
    // §2-2(c)※ USルートでは COST を為替基準に置き換え（円貨0銭=+1）
    usCost: 0,
    fit: "商品を最も幅広く1社で揃えたい人、三井住友カード/Vポイントを使う人、IPOにも挑戦したい人",
    unfit:
      "アプリが商品別に分かれる点や、電子交付・外貨決済など初期設定の手間を避けたい人",
    cta: { type: "official", label: "公式サイトで詳細を見る", url: "https://www.sbisec.co.jp/" },
  },
  RAKUTEN: {
    name: "楽天証券",
    base: { FUND: 3, US: 2, MINI: 3, ALL: 3 },
    econ: { RAKUTEN: 2, PONTA: 0, DOCOMO: 0, V: 0, NONE: 0 },
    pref: { COST: 1, SUPPORT: 0, TOOL: 2 },
    usCost: 0,
    fit: "楽天のサービスをよく使う人、1株をリアルタイムで機動的に売買したい人、日経を無料で読みたい人",
    unfit:
      "楽天サービスを使わず、手数料無料コースの仕組み（SOR注文への同意）に抵抗がある人",
    cta: { type: "official", label: "公式サイトで詳細を見る", url: "https://www.rakuten-sec.co.jp/" },
  },
  MONEX: {
    name: "マネックス証券",
    base: { FUND: 2, US: 3, MINI: 2, ALL: 2 },
    econ: { RAKUTEN: 0, PONTA: 0, DOCOMO: 2, V: 0, NONE: 0 },
    pref: { COST: 0, SUPPORT: 0, TOOL: 2 },
    usCost: 1, // 円貨決済でも為替0銭
    fit: "米国株を本気でやりたい人（分析ツール・円貨で為替手数料0銭）、ドコモ/dポイント圏の人",
    unfit:
      "国内株の売買が多い人（国内株手数料が有料）、投資信託の品揃えを最重視する人",
    cta: { type: "official", label: "公式サイトで詳細を見る", url: "https://www.monex.co.jp/" },
  },
  MATSUI: {
    name: "松井証券",
    base: { FUND: 2, US: 3, MINI: null, ALL: 2 }, // MINI: 単元未満株の買付不可 → ゲート除外
    econ: { RAKUTEN: 0, PONTA: 0, DOCOMO: 0, V: 0, NONE: 0 },
    pref: { COST: 1, SUPPORT: 2, TOOL: 0 },
    usCost: 1, // 円貨・外貨とも為替0銭
    fit: "電話などで相談したい安心重視の初心者、1日50万円以下の少額国内取引の人、25歳以下の人",
    unfit: "1株ずつ買い増したい人（買付非対応）、1日50万円を超える取引が多い人",
    cta: { type: "official", label: "公式サイトで詳細を見る", url: "https://www.matsui.co.jp/" },
  },
  AU: {
    name: "三菱UFJ eスマート証券",
    base: { FUND: 2, US: 1, MINI: 2, ALL: 2 },
    econ: { RAKUTEN: 0, PONTA: 2, DOCOMO: 0, V: 0, NONE: 0 },
    pref: { COST: 1, SUPPORT: 2, TOOL: 0 },
    usCost: 0, // 片道20銭（0銭ではない）
    fit: "au/Pontaを使う人、メガバンク系の信頼・サポートを重視する人、1株から始めたい人",
    unfit:
      "米国株を幅広く売買したい人（取扱銘柄が少なめ）、au/Ponta圏を使わない人",
    cta: { type: "official", label: "公式サイトで詳細を見る", url: "https://kabu.com/" },
  },
  DMM: {
    name: "DMM 株",
    base: { FUND: null, US: 2, MINI: null, ALL: null }, // 投信ゼロ → FUND/ALL 除外、単元未満株買付不可 → MINI 除外
    econ: { RAKUTEN: 0, PONTA: 0, DOCOMO: 0, V: 0, NONE: 0 },
    pref: { COST: 0, SUPPORT: 0, TOOL: 1 },
    usCost: 0,
    fit: "投資信託は使わず、米国株・国内株をシンプルなアプリで完結したい人、IPOの完全平等抽選を狙う人",
    unfit:
      "つみたてNISA・投資信託で積み立てたい人、1株から少額分散したい人（いずれも非対応）",
    cta: { type: "official", label: "公式サイトで詳細を見る", url: "https://kabu.dmm.com/" },
  },
};

// マトリクス §2-1 除外ゲートの理由文（結果画面で正直に表示する）
export const EXCLUSION_REASONS = {
  FUND: {
    DMM: "DMM 株は投資信託を取り扱っていないため、投信積立の候補から外しました",
  },
  MINI: {
    MATSUI:
      "松井証券は単元未満株（1株）の買付に対応していないため、候補から外しました",
    DMM: "DMM 株は単元未満株（1株）の買付に対応していないため、候補から外しました",
  },
  ALL: {
    DMM: "DMM 株は投資信託を取り扱っておらず、幅広く試す用途に向かないため候補から外しました",
  },
  US: {},
};

// §2-3 タイブレーク2: マトリクスで明文化された優先ペアのみ（それ以外の同点は両論併記）
// 現時点で定義済み: US ルートで マネックス > 松井（商品フィット: 銘柄数5,000超+分析ツール）
export const TIEBREAK_PAIRS = { US: [["MONEX", "MATSUI"]] };

// §0 コンプラ文面（下書き転記）
export const COMPLIANCE = {
  prHeader: "本ページには広告（アフィリエイトリンク）を含みます",
  author:
    "この診断は noripon-ai.com が独自に作成したものであり、特定の証券会社が作成・監修したものではありません。",
  neutrality:
    "診断結果は広告報酬の有無で順位を変えていません。あなたの回答にとって事実上もっとも合う会社を、報酬の出ない会社であっても正直に上位に出します。",
  disclaimer:
    "手数料・ポイント還元・取扱商品は各社が頻繁に改定します。口座開設・取引の前に必ず各社公式サイトで最新条件をご確認ください。本ページは情報提供であり投資助言ではありません。",
  nisaNote:
    "NISA口座は1人1社しか持てず、変更は年単位・既存保有分は移管できません。最初の1社選びは慎重に。",
};
