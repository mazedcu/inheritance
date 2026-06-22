import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Canvas group 1: determiner for jawil furud sharers (9 tiles)
const determinerTiles = [
  { key: "children", label: "Children" },
  { key: "son", label: "Son" },
  { key: "sons-son", label: "Son's Son" },
  { key: "sons-sons-son", label: "Son's Son's Son" },
  { key: "real-brother", label: "Real Brother" },
  { key: "paternal-brother", label: "Paternal Brother" },
  { key: "ikhwa", label: "Ikhwa" },
  { key: "father", label: "Father" },
  { key: "fathers-father", label: "Father's Father" },
];

// Canvas group 2: jawil furud (13 tiles)
const jawilFurudTiles = [
  { key: "daughter", label: "Daughter" },
  { key: "sons-daughter", label: "Son's Daughter", className: "daughter-tile" },
  { key: "sons-sons-daughter", label: "Son's Son's Daughter", className: "daughter-tile" },
  { key: "husband", label: "Husband" },
  { key: "wife", label: "Wife" },
  { key: "real-sister", label: "Real Sister" },
  { key: "paternal-sister", label: "Paternal Sister" },
  { key: "mother", label: "Mother" },
  { key: "father", label: "Father" },
  { key: "fathers-father", label: "Father's Father" },
  { key: "fathers-mother", label: "Father's Mother", className: "mother-tile" },
  { key: "mothers-mother", label: "Mother's Mother", className: "mother-tile" },
  { key: "maternal-brother", label: "Maternal Brother" },
  { key: "maternal-sister", label: "Maternal Sister" },
  { key: "all-maternal-sibling", label: "All Maternal Sibling" },
];

// Determiner key -> tiles that vanish when that determiner is selected.
const hideRules = {
  children: ["maternal-brother", "maternal-sister", "all-maternal-sibling"],
  son: [
    "sons-son",
    "sons-sons-son",
    "sons-daughter",
    "sons-sons-daughter",
    "real-brother",
    "paternal-brother",
    "real-sister",
    "paternal-sister",
    "maternal-brother",
    "maternal-sister",
    "all-maternal-sibling",
  ],
  "sons-son": ["sons-sons-son", "real-brother", "paternal-brother", "real-sister", "paternal-sister"],
  "sons-sons-son": ["real-brother", "paternal-brother", "paternal-sister"],
  "real-brother": ["paternal-sister"],
  father: [
    "fathers-father",
    "real-brother",
    "paternal-brother",
    "real-sister",
    "paternal-sister",
    "maternal-brother",
    "maternal-sister",
    "all-maternal-sibling",
  ],
  "fathers-father": ["real-brother", "paternal-brother", "real-sister", "paternal-sister", "maternal-brother", "maternal-sister", "all-maternal-sibling"],
  husband: ["wife"],
  wife: ["husband"],
  mother: ["fathers-mother", "mothers-mother"],
  // The combined tile hides the individual maternal sibling tiles.
  "all-maternal-sibling": ["maternal-brother", "maternal-sister"],
};

// Lookup of every tile by key (for rendering them in the Asaba group).
const tilesByKey = Object.fromEntries(
  [...determinerTiles, ...jawilFurudTiles].map((t) => [t.key, t])
);

// Asaba rules: when ALL listed keys are active, those keys move into the
// Asaba Share canvas (rendered in the listed order).
const asabaRules = [
  { when: ["son", "daughter"], move: ["son", "daughter"] },
  { when: ["sons-son", "sons-daughter"], move: ["sons-son", "sons-daughter"] },
  {
    when: ["sons-sons-son", "sons-sons-daughter"],
    move: ["sons-sons-son", "sons-sons-daughter"],
  },
  { when: ["real-brother", "real-sister"], move: ["real-brother", "real-sister"] },
  {
    when: ["paternal-brother", "paternal-sister"],
    move: ["paternal-brother", "paternal-sister"],
  },
];

// Hover definitions for specific tiles.
const tileDefinitions = {
  children: "Children include: Son, Son's Son, Son's Son's Son, Daughter, Son's Daughter, Son's Son's Daughter, Son's Son's Son's Daughter.",
  ikhwa: "Having 2 or more living siblings irrespective of gender from real, paternal or maternal relationship in any combination.",
  "maternal-brother": "Brother from same mother but different father due to marriage of mother more than once.",
  "maternal-sister": "Sister from same mother but different father due to marriage of mother more than once.",
  "all-maternal-sibling": "Having both maternal brother and maternal sister from same mother but different father due to marriage of mother more than once.",
  "paternal-sister": "Sister from same father but different mother.",
};

// Extended Asaba (ʿaṣaba al-naṣab — agnatic residuaries) hierarchy.
// Ordered from closest to furthest in line. Clicking one makes it the active
// residuary heir.
const extendedAsabaList = [
  { key: "real-brother-son", label: "Real Brother's Son" },
  { key: "paternal-brother-son", label: "Paternal Brother's Son" },
  { key: "real-brother-son-son", label: "Real Brother's Son's Son" },
  { key: "paternal-brother-son-son", label: "Paternal Brother's Son's Son" },
  { key: "real-brother-son-son-son", label: "Real Brother's Son's Son's Son" },
  { key: "paternal-brother-son-son-son", label: "Paternal Brother's Son's Son's Son" },
  { key: "fathers-brother", label: "Father's Brother" },
  { key: "fathers-brother-son", label: "Father's Brother's Son" },
  { key: "fathers-brother-son-son", label: "Father's Brother's Son's Son" },
  { key: "grandfathers-brother", label: "Grandfather's Brother" },
];

// Merge extended asaba into tilesByKey for rendering.
extendedAsabaList.forEach((t) => {
  tilesByKey[t.key] = t;
});

// Follow-up "one / more than one" share questions. Each appears when its tile
// is active and none of its blocker tiles are active. Selecting an option
// reveals the share fraction and hides the other option.
const shareQuestions = {
  daughter: {
    noun: "daughter",
    blockers: ["son"],
    one: "1/2",
    many: "2/3",
  },
  "sons-daughter": {
    noun: "son's daughter",
    blockers: ["son", "sons-son"],
    one: "1/2",
    many: "2/3",
  },
  "sons-sons-daughter": {
    noun: "son's son's daughter",
    blockers: ["son", "sons-son", "sons-sons-son"],
    one: "1/2",
    many: "2/3",
  },
  "real-sister": {
    noun: "real sister",
    // Real brother makes them asaba; children / descendants / father exclude her fixed share.
    blockers: ["real-brother", "children", "son", "sons-son", "father", "fathers-father"],
    one: "1/2",
    many: "2/3",
  },
  "paternal-sister": {
    noun: "paternal sister",
    // Paternal brother -> asaba; children / son / real brother / father exclude.
    blockers: [
      "paternal-brother",
      "children",
      "son",
      "real-brother",
      "father",
      "fathers-father",
    ],
    one: "1/2",
    many: "2/3",
  },
  "maternal-brother": {
    noun: "maternal brother",
    // Excluded by children / son / father / father's father.
    blockers: ["children", "son", "father", "fathers-father"],
    one: "1/6",
    many: "1/3",
  },
  "maternal-sister": {
    noun: "maternal sister",
    // Excluded by children / son / father / father's father.
    blockers: ["children", "son", "father", "fathers-father"],
    one: "1/6",
    many: "1/3",
  },
};

// Keys that are able to relocate (e.g. into the Asaba canvas). These tiles get
// a Framer Motion layoutId so they animate between positions.
const movableKeys = new Set(asabaRules.flatMap((rule) => rule.move));

const moveTransition = { type: "tween", duration: 1.4, ease: "easeInOut" };

// ---- Fraction helpers (for the share calculator) ----
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a) || 1);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const simplify = ({ n, d }) => {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
};
const fracToStr = ({ n, d }) => (d === 1 ? `${n}` : `${n}/${d}`);
// Format a list of fractions with a common denominator.
const commonDenom = (fractions) => {
  if (!fractions || fractions.length === 0) return [];
  const D = fractions.reduce((acc, f) => lcm(acc, f.d), 1);
  return fractions.map((f) => ({ n: f.n * (D / f.d), d: D }));
};
// Parse "a/b" or a whole number into { n, d }; null if invalid.
const parseFrac = (s) => {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  if (t.includes("/")) {
    const [a, b] = t.split("/");
    const n = parseInt(a, 10);
    const d = parseInt(b, 10);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return { n, d };
  }
  const v = Number(t);
  if (!Number.isFinite(v)) return null;
  return { n: v, d: 1 };
};

function Tile({ tile, active, hidden, onClick, groupClass, layoutId, share, tooltip }) {
  const className = `tile ${groupClass} ${active ? "active" : ""} ${
    hidden ? "vanished" : ""
  }`;
  const content = (
    <>
      <span className="tile-label">{tile.label}</span>
      {share && <span className="tile-share">{share}</span>}
    </>
  );

  const inner = (
    <>
      {content}
      {tooltip && <span className="custom-tooltip">{tooltip}</span>}
    </>
  );

  if (layoutId) {
    return (
      <motion.div
        layout="position"
        layoutId={layoutId}
        className={`${className} movable`}
        onClick={onClick}
        animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.85 : 1 }}
        transition={moveTransition}
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <div className={className} onClick={onClick}>
      {inner}
    </div>
  );
}

// An invisible, equal-sized slot left behind when a tile moves away.
function Placeholder({ tile, groupClass }) {
  return (
    <div className={`tile ${groupClass} placeholder`} aria-hidden="true">
      <span className="tile-label">{tile.label}</span>
    </div>
  );
}

// A follow-up question tile that reveals a share fraction when selected.
function QuestionTile({ label, share, selected, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`tile question-tile ${selected ? "answered" : ""}`}
      onClick={onClick}
    >
      <span className="tile-label">{label}</span>
      {share && <span className="tile-share">{share}</span>}
    </motion.div>
  );
}

function CanvasGroup({ id, title, children }) {
  return (
    <div className="canvas-group" id={id}>
      <p className="group-title">{title}</p>
      <div className="tiles">{children}</div>
    </div>
  );
}

export default function App() {
  const [activeKeys, setActiveKeys] = useState([]);
  // Per-tile follow-up answer: { [key]: "one" | "many" }.
  const [choices, setChoices] = useState({});

  // ---- Share calculator state ----
  const [calcOpen, setCalcOpen] = useState(false);
  const [shareInputs, setShareInputs] = useState({}); // { key: "1/6" }
  const [calc, setCalc] = useState(null); // computed total result
  const [asabaInput, setAsabaInput] = useState({ males: "", females: "" });
  const [asabaCalc, setAsabaCalc] = useState(null);
  const [raddCalc, setRaddCalc] = useState(null);
  const [extendedAsabaKey, setExtendedAsabaKey] = useState(null);
  const [showExtendedPanel, setShowExtendedPanel] = useState(false);

  const isOn = (key) => activeKeys.includes(key);

  const toggleKey = (key) => {
    // Special handling for maternal siblings: if one is clicked while the other is active,
    // replace both with the combined "all maternal sibling" tile
    if (key === "maternal-sister" && isOn("maternal-brother")) {
      setActiveKeys((keys) => [
        ...keys.filter((k) => k !== "maternal-brother" && k !== "maternal-sister"),
        "all-maternal-sibling",
      ]);
      setChoices((c) => {
        const next = { ...c };
        delete next["maternal-brother"];
        delete next["maternal-sister"];
        return next;
      });
      return;
    }
    if (key === "maternal-brother" && isOn("maternal-sister")) {
      setActiveKeys((keys) => [
        ...keys.filter((k) => k !== "maternal-brother" && k !== "maternal-sister"),
        "all-maternal-sibling",
      ]);
      setChoices((c) => {
        const next = { ...c };
        delete next["maternal-brother"];
        delete next["maternal-sister"];
        return next;
      });
      return;
    }
    // If clicking all-maternal-sibling, turn it off (no follow-up for this tile)
    if (key === "all-maternal-sibling" && activeKeys.includes(key)) {
      setActiveKeys((keys) => keys.filter((k) => k !== key));
      return;
    }
    // Turning a tile off clears its follow-up answer.
    if (activeKeys.includes(key)) {
      setChoices((c) => {
        const next = { ...c };
        delete next[key];
        return next;
      });
    }
    setActiveKeys((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]
    );
  };

  const chooseShare = (key, choice) =>
    setChoices((c) => ({ ...c, [key]: c[key] === choice ? undefined : choice }));

  // Union of all tiles hidden by the currently-active determiners, plus tiles
  // hidden by "more than one" follow-up answers.
  const choiceHidden = [];
  if (choices.daughter === "many")
    choiceHidden.push("sons-daughter", "sons-sons-daughter");
  if (choices["sons-daughter"] === "many")
    choiceHidden.push("sons-sons-daughter");
  if (choices["real-sister"] === "many") choiceHidden.push("paternal-sister");

  const hidden = [
    ...activeKeys.flatMap((key) => hideRules[key] || []),
    ...choiceHidden,
  ];

  // Grandmother shares (only when Mother is absent).
  // Father's mother: 1/6 if Shafi; if Hanafi/Maliki, 1/6 only when no Father.
  // Mother's mother: 1/6.
  // If both grandmothers earn a share, they split it -> 1/12 each.
  const fmChoice = choices["fathers-mother"]; // "hanafi" | "shafi" | undefined
  let fmShare =
    isOn("fathers-mother") && !isOn("mother")
      ? fmChoice === "shafi"
        ? "1/6"
        : fmChoice === "hanafi"
        ? isOn("father")
          ? null
          : "1/6"
        : null
      : null;
  let mmShare = isOn("mothers-mother") && !isOn("mother") ? "1/6" : null;
  if (fmShare === "1/6" && mmShare === "1/6") {
    fmShare = "1/12";
    mmShare = "1/12";
  }

  // Father's mother prompts a madhab question (only when Mother is absent and
  // no madhab has been chosen yet). Once chosen, the share shows on her tile.
  const showGrandmotherQuestion =
    isOn("fathers-mother") && !isOn("mother") && !fmChoice;

  // Computed share for tiles whose fraction depends on other heirs.
  // Mother: 1/6 if a child / ikhwa, or husband + father; 1/4 if wife + father;
  // otherwise 1/3.
  const computedShare = (key) => {
    if (!isOn(key)) return null;
    if (key === "mother") {
      if (
        isOn("children") ||
        isOn("ikhwa") ||
        (isOn("husband") && isOn("father"))
      )
        return "1/6";
      if (isOn("wife") && isOn("father")) return "1/4";
      return "1/3";
    }
    // Husband: 1/4 with a child, otherwise 1/2.
    if (key === "husband") return isOn("children") ? "1/4" : "1/2";
    // Wife: 1/8 with a child, otherwise 1/4.
    if (key === "wife") return isOn("children") ? "1/8" : "1/4";
    // Father / Father's father: 1/6 with children, otherwise pure asaba.
    if (key === "father" || key === "fathers-father")
      return isOn("children") ? "1/6" : null;
    // Son's daughter with a single daughter: fixed 1/6.
    if (key === "sons-daughter" && choices.daughter === "one") return "1/6";
    // Son's son's daughter with a single (son's) daughter: fixed 1/6.
    if (
      key === "sons-sons-daughter" &&
      (choices.daughter === "one" || choices["sons-daughter"] === "one")
    )
      return "1/6";
    // Paternal sister alongside a real sister: fixed 1/6.
    if (key === "paternal-sister" && isOn("real-sister")) return "1/6";
    // Grandmothers: computed share (Mother's mother always; Father's mother
    // after a madhab is chosen).
    if (key === "mothers-mother") return mmShare;
    if (key === "fathers-mother") return fmShare;
    // All maternal sibling: 1/3 when the combined tile is active
    if (key === "all-maternal-sibling") return isOn(key) ? "1/3" : null;
    return null;
  };

  // Keys that should move into the Asaba Share canvas (in declared order).
  const asabaKeys = asabaRules
    .filter((rule) => rule.when.every((k) => activeKeys.includes(k)))
    .flatMap((rule) => rule.move);

  // Father in the Asaba canvas:
  // - present whenever Father is active and no male descendant excludes him;
  // - with no children he MOVES there (home slot becomes a placeholder);
  // - with children he gets 1/6 AND a COPY appears in Asaba;
  // - any of son / son's son / son's son's son makes the Asaba father vanish.
  const maleDescendant =
    isOn("son") || isOn("sons-son") || isOn("sons-sons-son");
  // Father (and Father's father, when no Father) act as residuary ascendants:
  // present in Asaba unless a male descendant excludes them; they MOVE there
  // with no children, or leave a 1/6 COPY when children are present.
  const ascendantInAsaba = (key) => {
    if (key !== "father" && key !== "fathers-father") return false;
    if (!isOn(key) || maleDescendant) return false;
    if (key === "fathers-father" && isOn("father")) return false;
    return true;
  };
  const ascendantMovesToAsaba = (key) =>
    ascendantInAsaba(key) && !isOn("children");
  // Male descendants (son, son's son, son's son's son) are always Asaba.
  const maleDescendantKeys = ["son", "sons-son", "sons-sons-son"];
  const maleDescendantInAsaba = (key) => maleDescendantKeys.includes(key) && isOn(key);
  // Real brother is always Asaba when active.
  const realBrotherInAsaba = isOn("real-brother");
  const asabaItems = [
    ...asabaKeys,
    ...["father", "fathers-father"].filter(ascendantInAsaba),
    ...(extendedAsabaKey ? [extendedAsabaKey] : []),
    // Add male descendants that aren't already in asabaKeys (pair rules).
    ...maleDescendantKeys.filter((k) => isOn(k) && !asabaKeys.includes(k)),
    // Add real brother if active and not already in asabaKeys.
    ...(realBrotherInAsaba && !asabaKeys.includes("real-brother") ? ["real-brother"] : []),
  ];

  // Children present + Real Sister active (no Real Brother) → Real Sister goes
  // to Asaba as a residuary, but only if there's no existing Asaba already.
  if (
    isOn("children") &&
    isOn("real-sister") &&
    !isOn("real-brother") &&
    asabaItems.length === 0
  ) {
    asabaItems.push("real-sister");
  }

  // ---- Share calculator helpers ----
  // Active Jawil Furud tiles that aren't hidden and haven't physically moved
  // into an Asaba pair. Tiles like Father (1/6 + Asaba copy) are kept.
  const furudSharers = jawilFurudTiles.filter(
    (t) => isOn(t.key) && !hidden.includes(t.key) && !asabaKeys.includes(t.key)
  );

  // Best-known share string for a furud key (used to pre-fill the inputs).
  const knownShare = (key) => {
    const cs = computedShare(key);
    if (cs) return cs;
    const q = shareQuestions[key];
    const c = choices[key];
    if (q && c) return q[c];
    return "";
  };

  const openCalculator = () => {
    const init = {};
    furudSharers.forEach((t) => {
      init[t.key] = knownShare(t.key);
    });
    setShareInputs(init);
    setCalc(null);
    setAsabaCalc(null);
    setRaddCalc(null);
    setAsabaInput({ males: "", females: "" });
    setShowExtendedPanel(false);
    setCalcOpen(true);
  };

  const computeShares = () => {
    const entries = furudSharers.map((t) => ({
      key: t.key,
      label: t.label,
      frac: parseFrac(shareInputs[t.key]),
    }));
    if (entries.length === 0) {
      setCalc({ error: "No Jawil Furud sharers are selected." });
      return;
    }
    if (entries.some((e) => !e.frac)) {
      setCalc({ error: "Please enter every share as a fraction like 1/6." });
      return;
    }
    const D = entries.reduce((acc, e) => lcm(acc, e.frac.d), 1);
    const withNum = entries.map((e) => ({ ...e, num: e.frac.n * (D / e.frac.d) }));
    const totalNum = withNum.reduce((s, e) => s + e.num, 0);
    setAsabaCalc(null);
    setRaddCalc(null);
    if (totalNum === D) {
      setCalc({ status: "exact", D, totalNum, entries: withNum });
    } else if (totalNum < D) {
      setCalc({
        status: "deficit",
        D,
        totalNum,
        entries: withNum,
        totalStr: fracToStr(simplify({ n: totalNum, d: D })),
        remainderStr: fracToStr(simplify({ n: D - totalNum, d: D })),
      });
    } else {
      setCalc({
        status: "awl",
        D,
        totalNum,
        entries: withNum,
        totalStr: fracToStr(simplify({ n: totalNum, d: D })),
      });
    }
  };

  // Asaba-only: no Jawil Furud sharers, entire estate goes to asaba.
  const computeAsabaOnly = () => {
    const M = parseInt(asabaInput.males, 10) || 0;
    const F = parseInt(asabaInput.females, 10) || 0;
    const parts = 2 * M + F;
    if (parts <= 0) {
      setAsabaCalc({ error: "Enter at least one asaba male or female." });
      return;
    }
    // Entire estate = 1.
    const female = simplify({ n: 1, d: parts });
    const male = simplify({ n: 2, d: parts });
    setAsabaCalc({ M, F, parts, female, male });
  };

  const computeAsaba = () => {
    const M = parseInt(asabaInput.males, 10) || 0;
    const F = parseInt(asabaInput.females, 10) || 0;

    // If no asaba sharers at all, apply Radd (الرد):
    // surplus returns to non-spouse Jawil Furud sharers proportionally.
    if (M === 0 && F === 0) {
      const surplus = { n: calc.D - calc.totalNum, d: calc.D };
      // Non-spouse entries only (husband/wife are excluded from Radd).
      const eligible = calc.entries.filter((e) => e.key !== "husband" && e.key !== "wife");
      if (eligible.length === 0) {
        setRaddCalc({ error: "No eligible heirs for Radd (only spouse present)." });
        return;
      }
      const eligibleNum = eligible.reduce((s, e) => s + e.num, 0);
      if (eligibleNum <= 0) {
        setRaddCalc({ error: "No eligible heirs for Radd." });
        return;
      }
      // Each eligible heir gets: surplus × (their numerator / sum of eligible numerators)
      const raddEntries = calc.entries.map((e) => {
        if (e.key === "husband" || e.key === "wife") {
          // Spouse keeps original share unchanged.
          return { ...e, final: e.frac };
        }
        const extra = simplify({
          n: surplus.n * e.num,
          d: surplus.d * eligibleNum,
        });
        // final = original + extra
        const final = simplify({
          n: e.frac.n * extra.d + extra.n * e.frac.d,
          d: e.frac.d * extra.d,
        });
        return { ...e, extra, final };
      });
      setRaddCalc({ entries: raddEntries });
      return;
    }

    const parts = 2 * M + F;
    if (parts <= 0) {
      setAsabaCalc({ error: "Enter at least one asaba male or female." });
      return;
    }
    const R = { n: calc.D - calc.totalNum, d: calc.D }; // remainder fraction
    const female = simplify({ n: R.n, d: R.d * parts });
    const male = simplify({ n: 2 * R.n, d: R.d * parts });
    setAsabaCalc({ M, F, parts, female, male });
  };

  // Extended asaba selected (single heir): remainder goes entirely to them.
  const computeExtendedAsaba = () => {
    if (!extendedAsabaKey || !calc) return;
    const R = { n: calc.D - calc.totalNum, d: calc.D };
    const remainder = simplify(R);
    setAsabaCalc({
      M: 1,
      F: 0,
      parts: 2,
      female: { n: 0, d: 1 },
      male: remainder,
      extendedLabel: tilesByKey[extendedAsabaKey]?.label || extendedAsabaKey,
    });
  };

  // A share question shows when its tile is active and no blocker is active.
  const showQuestion = (key) => {
    const q = shareQuestions[key];
    if (!q || !isOn(key)) return false;
    if (q.blockers.some((b) => isOn(b))) return false;
    // Hidden tiles (e.g. excluded by a "more than one" answer) never prompt.
    if (hidden.includes(key)) return false;
    // Son's daughter with a single daughter takes a fixed 1/6 (no prompt).
    if (key === "sons-daughter" && choices.daughter === "one") return false;
    // Son's son's daughter with a single (son's) daughter -> fixed 1/6.
    if (
      key === "sons-sons-daughter" &&
      (choices.daughter === "one" || choices["sons-daughter"] === "one")
    )
      return false;
    // Paternal sister alongside a real sister takes a fixed 1/6 (no prompt).
    if (key === "paternal-sister" && isOn("real-sister")) return false;
    return true;
  };

  // Build the (filtered) follow-up tiles for a given share question.
  const renderQuestionTiles = (key) => {
    const q = shareQuestions[key];
    const choice = choices[key];
    const tiles = [];
    if (choice !== "many") {
      tiles.push(
        <QuestionTile
          key={`${key}-one`}
          label={`One ${q.noun}?`}
          share={choice === "one" ? q.one : null}
          selected={choice === "one"}
          onClick={() => chooseShare(key, "one")}
        />
      );
    }
    if (choice !== "one") {
      tiles.push(
        <QuestionTile
          key={`${key}-many`}
          label={`More than one ${q.noun}?`}
          share={choice === "many" ? q.many : null}
          selected={choice === "many"}
          onClick={() => chooseShare(key, "many")}
        />
      );
    }
    return tiles;
  };

  // Render a tile in its home group. If it has moved to Asaba, leave an
  // equal-sized empty placeholder so the layout doesn't shift.
  const renderHomeTile = (tile, groupClass) => {
    if (
      asabaKeys.includes(tile.key) ||
      ascendantMovesToAsaba(tile.key) ||
      maleDescendantInAsaba(tile.key)
    ) {
      return (
        <Placeholder key={tile.key} tile={tile} groupClass={groupClass} />
      );
    }
    return (
      <Tile
        key={tile.key}
        tile={tile}
        groupClass={groupClass}
        active={activeKeys.includes(tile.key)}
        hidden={hidden.includes(tile.key)}
        onClick={() => toggleKey(tile.key)}
        layoutId={movableKeys.has(tile.key) ? tile.key : undefined}
        share={computedShare(tile.key)}
        tooltip={tileDefinitions[tile.key]}
      />
    );
  };

  return (
    <div className="page">
      <h1 className="main-title">Inheritance in Islam</h1>

      <div className="explanation-box">
        <p>
          In Islam, a deceased person — be it male or female — their assets
          after deducting modest funeral expenses and loans will be distributed
          to relatives first in fixed shares according to the Quran. They are
          called <strong>Jawil Furud</strong>. But there are <em>determiners</em>
          who, if alive, determine what share the Jawil Furud sharers get.
        </p>
      </div>

      <div className="center-arrow">
        <span className="arrow-down">&#8595;</span>
      </div>

      <p className="determiner-hint">
        Below are the determiners — click them if they are alive.
      </p>

      <CanvasGroup id="determiner-group" title="Determiner for Jawil Furud Sharers">
        {determinerTiles.map((tile) => renderHomeTile(tile, "determiner-tile"))}
      </CanvasGroup>

      <div className="explanation-box">
        <p>
          Now click the <strong>Jawil Furud</strong> relatives who are alive.
          Remember, the relationship is with respect to the <em>deceased person</em>.
          So, <strong>Daughter</strong> means the deceased person’s daughter,
          <strong>Mother</strong> means the deceased person’s mother, and so on.
        </p>
      </div>

      <div className="center-arrow">
        <span className="arrow-down">&#8595;</span>
      </div>

      <CanvasGroup id="jawil-furud-group" title="Jawil Furud">
        <AnimatePresence>
          {jawilFurudTiles.flatMap((tile) => {
            // The combined "all maternal sibling" tile only appears once both
            // maternal siblings have been merged into it.
            if (tile.key === "all-maternal-sibling" && !isOn(tile.key)) {
              return [];
            }
            // A daughter-type tile (with no blocker) vanishes and reveals
            // its "one / more than one" follow-up tiles.
            if (showQuestion(tile.key)) {
              return renderQuestionTiles(tile.key);
            }
            // Father's mother (no Mother) prompts a madhab question. After a
            // choice she collapses back to her tile (showing the share).
            if (tile.key === "fathers-mother" && showGrandmotherQuestion) {
              return [
                <QuestionTile
                  key="fm-hanafi"
                  label="Hanafi & Maliki?"
                  onClick={() => chooseShare("fathers-mother", "hanafi")}
                />,
                <QuestionTile
                  key="fm-shafi"
                  label="Shafi?"
                  onClick={() => chooseShare("fathers-mother", "shafi")}
                />,
              ];
            }
            return [renderHomeTile(tile, tile.className || "furud-tile")];
          })}
        </AnimatePresence>
      </CanvasGroup>

      <div className="explanation-box">
        <p>
          After giving the fixed shares according to the Quran, give the
          remaining share to the <strong>Asaba</strong> (residuaries) present
          below. If both male and female Asaba are present, give them in a{" "}
          <strong>2:1 ratio</strong> (male:female). If the total of Jawil Furud
          shares exceeds 1, reduce each share proportionally — this is called
          the problem of <strong>ʿAwl</strong> (العول). If there is a surplus
          with no Asaba, it returns to the Jawil Furud sharers via{" "}
          <strong>Radd</strong> (الرد). If there is no Jawil Furud or Asaba
          at all, the entire estate goes to <strong>Dhawu al-Arham</strong>{" "}
          (extended family through female links).
        </p>
      </div>

      <div className="center-arrow">
        <span className="arrow-down">&#8595;</span>
      </div>

      <CanvasGroup id="asaba-group" title="Asaba Share">
        {asabaItems.length === 0 && !showExtendedPanel ? (
          <div className="extended-trigger">
            <p className="asaba-empty">No asaba sharers yet.</p>
            <button
              className="action-btn secondary"
              onClick={() => setShowExtendedPanel(true)}
            >
              Populate extended asaba if no asaba is seen here
            </button>
          </div>
        ) : asabaItems.length === 0 && showExtendedPanel ? (
          <div className="extended-column">
            <p className="asaba-empty">Select an extended asaba heir:</p>
            {extendedAsabaList.map((t) => (
              <div
                key={t.key}
                className={`tile extended-tile ${
                  extendedAsabaKey === t.key ? "active" : ""
                }`}
                onClick={() =>
                  setExtendedAsabaKey((k) => (k === t.key ? null : t.key))
                }
              >
                {t.label}
              </div>
            ))}
          </div>
        ) : (
          <div className="asaba-stack">
            {asabaItems.map((key) => (
              <Tile
                key={key}
                tile={tilesByKey[key]}
                groupClass="asaba-tile"
                active
                onClick={() => toggleKey(key)}
                layoutId={movableKeys.has(key) ? key : undefined}
                tooltip={tileDefinitions[key]}
              />
            ))}
          </div>
        )}
      </CanvasGroup>

      <div className="submit-row">
        <button className="action-btn" onClick={openCalculator}>
          Submit
        </button>
      </div>

      {calcOpen && (
        <div className="canvas-group" id="calc-group">
          <p className="group-title">Jawil Furud Share Calculator</p>

          {furudSharers.length === 0 && asabaItems.length === 0 ? (
            <div className="calc-result">
              <p className="calc-msg warn">
                No Jawil Furud or Asaba sharers are present.
              </p>
              <p className="calc-msg">
                The entire estate goes to <strong>Dhawu al-Arham</strong> (extended
                family members through female links), according to the order of
                closeness to the deceased.
              </p>
              <p className="calc-msg ok">Grand total = 1</p>
            </div>
          ) : furudSharers.length === 0 && asabaItems.length > 0 ? (
            <>
              <p className="calc-msg">
                No Jawil Furud sharers. The entire estate goes to the Asaba.
              </p>
              <div className="asaba-input-row">
                <label>
                  Asaba males
                  <input
                    type="number"
                    min="0"
                    value={asabaInput.males}
                    onChange={(e) =>
                      setAsabaInput((a) => ({ ...a, males: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Asaba females
                  <input
                    type="number"
                    min="0"
                    value={asabaInput.females}
                    onChange={(e) =>
                      setAsabaInput((a) => ({ ...a, females: e.target.value }))
                    }
                  />
                </label>
                <button className="action-btn" onClick={computeAsabaOnly}>
                  Submit
                </button>
              </div>

              {asabaCalc?.error && (
                <p className="calc-error">{asabaCalc.error}</p>
              )}

              {asabaCalc && !asabaCalc.error && (
                <div className="calc-result">
                  <p className="calc-msg">
                    {asabaCalc.M === 1 && asabaCalc.F === 0
                      ? "The entire estate goes to the asaba male."
                      : asabaCalc.M === 0 && asabaCalc.F === 1
                      ? "The entire estate goes to the asaba female."
                      : asabaCalc.F === 0
                      ? `The entire estate is shared among ${asabaCalc.M} asaba male${asabaCalc.M > 1 ? "s" : ""} equally.`
                      : asabaCalc.M === 0
                      ? `The entire estate is shared among ${asabaCalc.F} asaba female${asabaCalc.F > 1 ? "s" : ""} equally.`
                      : `The entire estate is shared as 2:1 (male:female):`}
                  </p>
                  <ul>
                    {asabaCalc.M > 0 && (
                      <li>
                        Each asaba male ({asabaCalc.M}):{" "}
                        <strong>{fracToStr(asabaCalc.male)}</strong>
                      </li>
                    )}
                    {asabaCalc.F > 0 && (
                      <li>
                        Each asaba female ({asabaCalc.F}):{" "}
                        <strong>{fracToStr(asabaCalc.female)}</strong>
                      </li>
                    )}
                  </ul>
                  <p className="calc-msg ok">Grand total = 1</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="share-inputs">
                {furudSharers.map((t) => (
                  <div className="share-row" key={t.key}>
                    <span className="share-name">{t.label}</span>
                    <input
                      className="share-input"
                      type="text"
                      placeholder="e.g. 1/6"
                      value={shareInputs[t.key] ?? ""}
                      onChange={(e) =>
                        setShareInputs((s) => ({
                          ...s,
                          [t.key]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <button className="action-btn" onClick={computeShares}>
                Submit
              </button>

              {calc?.error && <p className="calc-error">{calc.error}</p>}

              {calc?.status === "exact" && (() => {
                const common = commonDenom(calc.entries.map((e) => e.frac));
                return (
                  <div className="calc-result">
                    <p className="calc-msg ok">
                      Total = 1. Please give these shares to the Jawil Furud
                      sharers accordingly:
                    </p>
                    <ul>
                      {calc.entries.map((e, i) => (
                        <li key={e.key}>
                          {e.label}: <strong>{fracToStr(common[i])}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {calc?.status === "deficit" && (
                <div className="calc-result">
                  <p className="calc-msg">
                    Jawil Furud share total = {calc.totalStr}. The rest (
                    {calc.remainderStr}) of the asset will go to the Asaba
                    pairs.
                  </p>
                  <ul>
                    {calc.entries.map((e) => (
                      <li key={e.key}>
                        {e.label}: {fracToStr(e.frac)}
                      </li>
                    ))}
                  </ul>

                  {asabaItems.length === 0 && !extendedAsabaKey ? (
                    <div className="radd-prompt">
                      <p className="calc-msg warn">
                        No Asaba sharers present. Click Submit to apply Radd
                        (الرد) — surplus returns to non-spouse Jawil Furud
                        sharers.
                      </p>
                      <button
                        className="action-btn"
                        onClick={() => computeAsaba()}
                      >
                        Submit
                      </button>
                    </div>
                  ) : extendedAsabaKey ? (
                    <div className="radd-prompt">
                      <p className="calc-msg">
                        Extended Asaba selected: <strong>{tilesByKey[extendedAsabaKey]?.label}</strong>.
                        The remaining {calc.remainderStr} goes to this heir.
                      </p>
                      <button
                        className="action-btn"
                        onClick={computeExtendedAsaba}
                      >
                        Submit
                      </button>
                    </div>
                  ) : (
                    <div className="asaba-input-row">
                      <label>
                        Asaba males
                        <input
                          type="number"
                          min="0"
                          value={asabaInput.males}
                          onChange={(e) =>
                            setAsabaInput((a) => ({
                              ...a,
                              males: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label>
                        Asaba females
                        <input
                          type="number"
                          min="0"
                          value={asabaInput.females}
                          onChange={(e) =>
                            setAsabaInput((a) => ({
                              ...a,
                              females: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <button className="action-btn" onClick={computeAsaba}>
                        Submit
                      </button>
                    </div>
                  )}

                  {asabaCalc?.error && (
                    <p className="calc-error">{asabaCalc.error}</p>
                  )}

                  {asabaCalc && !asabaCalc.error && (
                    <div className="calc-result">
                      <p className="calc-msg">
                        {asabaCalc.extendedLabel
                          ? `The entire remaining ${calc.remainderStr} goes to ${asabaCalc.extendedLabel}.`
                          : asabaCalc.F === 0
                          ? `The entire remaining ${calc.remainderStr} goes to the asaba male${
                              asabaCalc.M > 1 ? "s" : ""
                            }.`
                          : asabaCalc.M === 0
                          ? `The entire remaining ${calc.remainderStr} goes to the asaba female${
                              asabaCalc.F > 1 ? "s" : ""
                            }.`
                          : `The remaining ${calc.remainderStr} is shared as 2:1 (male:female):`}
                      </p>
                      <ul>
                        {asabaCalc.F > 0 && (
                          <li>
                            Each asaba female ({asabaCalc.F}):{" "}
                            {fracToStr(asabaCalc.female)}
                          </li>
                        )}
                        {asabaCalc.M > 0 && (
                          <li>
                            Each asaba male ({asabaCalc.M}):{" "}
                            {fracToStr(asabaCalc.male)}
                          </li>
                        )}
                      </ul>
                      <p className="calc-msg ok">Total shares given:</p>
                      {(() => {
                        const allFracs = [
                          ...calc.entries.map((e) => e.frac),
                          ...(asabaCalc.F > 0
                            ? [{
                                n: asabaCalc.female.n * asabaCalc.F,
                                d: asabaCalc.female.d,
                              }]
                            : []),
                          ...(asabaCalc.M > 0
                            ? [{
                                n: asabaCalc.male.n * asabaCalc.M,
                                d: asabaCalc.male.d,
                              }]
                            : []),
                        ];
                        const common = commonDenom(allFracs);
                        let idx = 0;
                        return (
                          <ul>
                            {calc.entries.map((e) => (
                              <li key={e.key}>
                                {e.label}: <strong>{fracToStr(common[idx++])}</strong>
                              </li>
                            ))}
                            {asabaCalc.F > 0 && (
                              <li>
                                Asaba females ({asabaCalc.F}):{" "}
                                <strong>{fracToStr(common[idx++])}</strong>
                              </li>
                            )}
                            {asabaCalc.M > 0 && (
                              <li>
                                Asaba males ({asabaCalc.M}):{" "}
                                <strong>{fracToStr(common[idx++])}</strong>
                              </li>
                            )}
                          </ul>
                        );
                      })()}
                      <p className="calc-msg ok">Grand total = 1</p>
                    </div>
                  )}
                </div>
              )}

              {raddCalc?.error && (
                <p className="calc-error">{raddCalc.error}</p>
              )}

              {raddCalc && !raddCalc.error && (
                <div className="calc-result">
                  <p className="calc-msg ok">
                    No asaba sharers. Radd (الرد) applied — surplus returned to
                    non-spouse Jawil Furud sharers proportionally:
                  </p>
                  {(() => {
                    const finals = raddCalc.entries.map((e) => e.final || e.frac);
                    const common = commonDenom(finals);
                    return (
                      <ul>
                        {raddCalc.entries.map((e, i) => (
                          <li key={e.key}>
                            {e.label}: {fracToStr(e.frac)}
                            {e.extra && (
                              <span>
                                {" "}
                                + {fracToStr(e.extra)} (Radd) ={" "}
                                <strong>{fracToStr(common[i])}</strong>
                              </span>
                            )}
                            {!e.extra && (
                              <span>
                                {" "}
                                → <strong>{fracToStr(common[i])}</strong>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                  <p className="calc-msg ok">Grand total = 1</p>
                </div>
              )}

              {calc?.status === "awl" && (
                <div className="calc-result">
                  <p className="calc-msg warn">
                    Jawil Furud share total = {calc.totalStr} (greater than 1 —
                    Awl). Shares are reduced proportionally: each numerator over
                    the sum of numerators ({calc.totalNum}).
                  </p>
                  {(() => {
                    const reduced = calc.entries.map((e) =>
                      simplify({ n: e.num, d: calc.totalNum })
                    );
                    const common = commonDenom(reduced);
                    return (
                      <ul>
                        {calc.entries.map((e, i) => (
                          <li key={e.key}>
                            {e.label}: {fracToStr(e.frac)} →{" "}
                            <strong>{fracToStr(common[i])}</strong>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
