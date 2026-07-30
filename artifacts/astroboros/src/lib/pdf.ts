import { jsPDF } from "jspdf";
import type { Reading } from "@/types/astro";
import type { Comparison } from "@/lib/compare";
import { SIGNS, SUMMARY_ORDER, PLANET_META, ORDINALS } from "@/constants/astro";
import { formatDegree } from "@/lib/ephemeris";

// jsPDF core fonts only cover Latin-1, so strip/convert astrological glyphs and
// typographic punctuation to safe equivalents.
const clean = (s: string) =>
  s
    .replace(/→/g, "->")
    .replace(/℞/g, "(R)")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, "-")
    .replace(/[·•]/g, "-")
    .replace(/◬/g, "")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "")
    .replace(/[ ]{2,}/g, " ")
    .trim();

export function exportReadingPdf(reading: Reading, includePremium: boolean) {
  const { chart, planetSections, functions, primary, heroJourney } = reading;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string, size: number) => {
    ensure(size + 14);
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(24, 26, 40);
    doc.text(clean(text), margin, y);
    y += size + 6;
  };

  const sub = (text: string) => {
    ensure(16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(120, 120, 135);
    doc.text(clean(text), margin, y);
    y += 15;
  };

  const para = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(45, 47, 60);
    const lines = doc.splitTextToSize(clean(text), maxW) as string[];
    for (const line of lines) {
      ensure(15);
      doc.text(line, margin, y);
      y += 14.5;
    }
    y += 8;
  };

  // Cover
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(24, 26, 40);
  doc.text("ASTROBOROS", margin, y + 8);
  y += 40;
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(150, 120, 60);
  doc.text("A Creation Blueprint", margin, y);
  y += 30;

  heading(chart.input.name ? chart.input.name : "Your Reading", 20);
  sub(
    `${chart.input.place}   |   ${chart.input.date}   |   ${chart.input.time}   |   ${
      chart.zodiac === "sidereal" ? "Sidereal (Lahiri)" : "Tropical"
    } - Placidus`
  );
  y += 10;

  // Natal chart summary
  heading("Natal Chart Summary", 15);
  const cols = [margin, margin + 160, margin + 300, margin + 410];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 135);
  ensure(16);
  doc.text("PLANET", cols[0], y);
  doc.text("SIGN", cols[1], y);
  doc.text("DEGREE", cols[2], y);
  doc.text("HOUSE", cols[3], y);
  y += 15;

  const row = (a: string, b: string, c: string, d: string) => {
    ensure(15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 47, 60);
    doc.text(clean(a), cols[0], y);
    doc.text(clean(b), cols[1], y);
    doc.text(clean(c), cols[2], y);
    doc.text(clean(d), cols[3], y);
    y += 14.5;
  };

  const asc = chart.ascendant;
  row("Ascendant", SIGNS[asc.signIndex].name, formatDegree(asc), "1st");
  for (const key of SUMMARY_ORDER) {
    const pos = chart.positions[key];
    row(
      PLANET_META[key].name + (pos.retrograde ? " (R)" : ""),
      SIGNS[pos.signIndex].name,
      formatDegree(pos),
      ORDINALS[pos.house - 1]
    );
  }
  y += 14;

  // Free layer — primary archetype
  heading("Your Alchemist Archetype", 16);
  sub(primary.name);
  for (const p of primary.paragraphs) para(p);

  if (includePremium) {
    // Planet functions + thresholds (woven in cycle order)
    doc.addPage();
    y = margin;
    heading("The Functions & Thresholds", 16);
    for (const s of planetSections) {
      heading(s.title, 13);
      sub(s.subtitle);
      for (const p of s.paragraphs) para(p);
    }

    // Alchemist Archetypes (deep)
    doc.addPage();
    y = margin;
    heading("The Six Alchemist Archetypes", 16);
    for (const f of functions) {
      heading(`${f.title} — ${f.archetypeName}`, 13);
      sub(`${f.tagline}  |  ${f.resonance}`);
      for (const p of f.reading) para(p);
    }

    // Blueprint Journey
    doc.addPage();
    y = margin;
    heading(heroJourney.title, 16);
    for (const p of heroJourney.paragraphs) para(p);
  }

  const safeName =
    (chart.input.name || "blueprint")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "blueprint";
  doc.save(`astral-forge-${safeName}.pdf`);
}

// ─── Laboratory / Compare PDF ────────────────────────────────────────────────

export function exportLabPdf(c: Comparison) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) { doc.addPage(); y = margin; }
  };

  const rule = () => {
    ensure(14);
    doc.setDrawColor(200, 200, 210);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
  };

  const heading = (text: string, size: number) => {
    ensure(size + 16);
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(24, 26, 40);
    doc.text(clean(text), margin, y);
    y += size + 8;
  };

  const label = (text: string) => {
    ensure(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(130, 110, 60);
    doc.text(clean(text.toUpperCase()), margin, y);
    y += 13;
  };

  const sub = (text: string) => {
    ensure(14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 135);
    const lines = doc.splitTextToSize(clean(text), maxW) as string[];
    for (const line of lines) { ensure(13); doc.text(line, margin, y); y += 13; }
    y += 4;
  };

  const para = (text: string, color: [number, number, number] = [45, 47, 60]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(text), maxW) as string[];
    for (const line of lines) { ensure(14); doc.text(line, margin, y); y += 14; }
    y += 6;
  };

  const kv = (key: string, value: string) => {
    ensure(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 115);
    doc.text(clean(key.toUpperCase()), margin, y);
    y += 13;
    para(value);
  };

  // ── Cover ──────────────────────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.setTextColor(24, 26, 40);
  doc.text("ASTRAL FORGE", margin, y);
  y += 36;

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(150, 120, 60);
  doc.text("The Laboratory", margin, y);
  y += 28;

  heading(`${c.nameA}  x  ${c.nameB}`, 22);
  y += 8;

  for (const p of c.summary) para(p);
  y += 8;

  // ── Experimental Summary ───────────────────────────────────────────────────
  rule();
  label("Experimental Summary");
  heading(`Laboratory Climate: ${c.experimentalSummary.climate}`, 14);
  kv("Primary Strength", c.experimentalSummary.primaryStrength);
  kv("Primary Challenge", c.experimentalSummary.primaryChallenge);
  kv("Greatest Opportunity", c.experimentalSummary.greatestOpportunity);
  kv("Greatest Operational Risk", c.experimentalSummary.greatestRisk);
  kv("Left Unconscious", c.experimentalSummary.leftUnconscious);
  kv("Built Intentionally", c.experimentalSummary.builtIntentionally);

  // ── Archetypes ─────────────────────────────────────────────────────────────
  rule();
  label("Primary Archetypes");
  heading(`${c.archetype.a}  meets  ${c.archetype.b}`, 14);
  for (const p of c.archetype.paragraphs) para(p);

  // ── Creation Cycle Analysis ────────────────────────────────────────────────
  doc.addPage(); y = margin;
  label("Creation Cycle Analysis — Function by Function");
  y += 6;

  for (const pair of c.planetPairs) {
    const meta = PLANET_META[pair.key];
    ensure(60);
    heading(`${meta.name}  —  ${pair.aSign} / ${pair.bSign}  (${pair.relationshipType})`, 13);
    sub(`Health: ${pair.healthIndicator}`);
    if (pair.question) sub(`Function question: ${pair.question}`);
    para(pair.note);
    if (pair.reactionState) sub(`Reaction: ${pair.reactionState}`);
    if (pair.reactionReason) para(pair.reactionReason, [80, 80, 95]);
    if (pair.observableEffect) kv("Observable Effect", pair.observableEffect);
    if (pair.recommendation) kv("Recommendation", pair.recommendation);
    if (pair.experiment) kv("Laboratory Experiment", pair.experiment);
    y += 6;
  }

  // ── Amplifiers ─────────────────────────────────────────────────────────────
  rule();
  label("Amplifiers — Where Functions Strengthen Each Other");
  y += 4;
  for (const amp of c.amplifiers) {
    ensure(50);
    heading(amp.interaction, 12);
    kv("Why it matters", amp.whyItMatters);
    kv("Observable outcome", amp.observableOutcome);
    kv("Operational advantage", amp.operationalAdvantage);
    y += 4;
  }

  // ── Constraints ────────────────────────────────────────────────────────────
  rule();
  label("Constraints — Engineering Limitations");
  y += 4;
  for (const con of c.constraints) {
    ensure(40);
    heading(con.constraint, 12);
    kv("Operational consequence", con.operationalConsequence);
    kv("Best mitigation", con.bestMitigation);
    y += 4;
  }

  // ── Emergent System ────────────────────────────────────────────────────────
  rule();
  label("Emergent System");
  heading(c.emergentSystem.category, 14);
  para(c.emergentSystem.description);

  // ── Predicted Creation Cycle ───────────────────────────────────────────────
  rule();
  label("Predicted Creation Cycle");
  y += 4;
  const phases: Array<[string, string]> = [
    ["Ignition", c.predictedCycle.ignition],
    ["Translation", c.predictedCycle.translation],
    ["Execution", c.predictedCycle.execution],
    ["Expansion", c.predictedCycle.expansion],
    ["Preservation", c.predictedCycle.preservation],
  ];
  for (const [ph, text] of phases) kv(ph, text);
  kv("Natural Accelerator", c.predictedCycle.naturalAccelerator);
  kv("Natural Stall", c.predictedCycle.naturalStall);
  kv("Handoff Protocol", c.predictedCycle.handoff);

  // ── Executive Summary ──────────────────────────────────────────────────────
  rule();
  label("Executive Summary — The Laboratory Conclusion");
  y += 4;
  kv("Defining Strength", c.executiveSummary.definingStrength);
  kv("Defining Limitation", c.executiveSummary.definingLimitation);
  kv("Highest Leverage Adjustment", c.executiveSummary.highestLeverage);
  kv("Long-Term Potential", c.executiveSummary.longTermPotential);

  // ── Save ───────────────────────────────────────────────────────────────────
  const safeA = (c.nameA || "a").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const safeB = (c.nameB || "b").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`astral-forge-lab-${safeA}-${safeB}.pdf`);
}
