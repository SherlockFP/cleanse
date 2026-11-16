// Every tunable number (ECONOMY.md). Change numbers here only: data/symbols.js reads LINE_PAY and data/trinkets.js reads PRICES.trinket.
// Token list prices and trinket effect numbers live in their data tables.

export const SPINS_PER_TIDE = 6;
export const PEGS_PER_TIDE = 3;
export const TIDES_PER_RUN = 5;
export const REMOVALS_PER_RUN = 3;
export const MERCY_GAP = 5; // once per run, if 1 <= quota - jar <= 5

export const QUOTA_BASE = 15;
export const QUOTA_GROWTH = 2;
export const QUOTA_LAMPLIGHT_BASE = 240; // Q(5)
export const QUOTA_LAMPLIGHT_GROWTH = 1.15;
export const TIER_SLOPE = 0.015;
export const INSTALLMENTS = 12;

// Installment tier S(c) = 1 + 0.015 x (c-1), c = 1..12
export const tier = (c) => 1 + TIER_SLOPE * (c - 1);

// Base quota Q(t): tides 1-5 grow x2 from 15; Lamplight (t >= 6) grows x1.45 from 240.
export function baseQuota(t) {
  if (t <= TIDES_PER_RUN) return Math.round(QUOTA_BASE * Math.pow(QUOTA_GROWTH, t - 1));
  return Math.round(QUOTA_LAMPLIGHT_BASE * Math.pow(QUOTA_LAMPLIGHT_GROWTH, t - TIDES_PER_RUN));
}

// Quota for tide t (1-based) at installment c (1-based); tide 1 is never multiplied by the tier.
// The 1e-9 keeps ceil from jumping on float noise.
export function QUOTA(t, c = 1) {
  const q = baseQuota(t);
  return t <= 1 ? q : Math.ceil(q * tier(c) - 1e-9);
}

export const LINE_PAY = Object.freeze({
  pebble: 4, sardine: 6, tea: 7, lantern: 10, gull: 14,
  sea_glass: 22, compass: 34, golden_cormorant: 80, three_knots: 12,
});

export const PRICES = Object.freeze({
  trinket: Object.freeze([5, 9, 14, 22]), // grade 1..4, no growth
  tokenMin: 4, tokenMax: 20, tokenGrowthPerCopy: 2,
  tokenCopyCap: 3, tokenCopyCapCormorant: 2,
  removal: 26, // flat; at most REMOVALS_PER_RUN per run
  rerollBase: 2, rerollStep: 3,
  sellDiv: 2, // sell = floor(price / 2)
});

export const SHOP = Object.freeze({
  trinketShare: 0.7, tokenShare: 0.3,
  gradeWeights: Object.freeze([60, 30, 9, 1]),
});

export const PLANKS = Object.freeze({
  perTideCleared: 2, winBonus: 5, clutch: 1, firstRun: 10,
  dailyTide: 5, streak: Object.freeze([2, 2, 3, 3, 4, 4, 8]),
  ledgerTotal: 150, marketWeekend: 25, doubleMult: 2,
  boathouseTotal: 1035,
  ledgerSteps: 30,
});
// Harbor Ledger step n (1..30) costs 5 + floor(n x 35 / 29) XP; 1 XP per tide cleared.
export const ledgerStepCost = (n) => 5 + Math.floor((n * 35) / 29);

export const AD_CAPS = Object.freeze({
  rewardedPerDay: 7, doublePlanksPerDay: 3, skinPerDay: 1, dailyRetryPerDay: 1, postcardHintPerDay: 2,
  interstitialPerDay: 6, interstitialMinSeconds: 180, interstitialEveryRuns: 2,
});
