// Finds a seed for the scripted first run: spins 1 and 2 pay, spin 3 pays nothing until one column is nudged. Prints the first hit.
// node scripts/find-tutorial-seed.mjs   (a second or two). Put the result in TUTORIAL_SEED in src/tutorial.js.
import { newRun, pickTerms, termsOffer, spin, collect } from '../src/core/run.js';
import { nudgeHint, TUTORIAL_TERMS } from '../src/tutorial.js';

export function tutorialOpening(seed) {
  const run = newRun({ seed });
  run.forcedTerms = TUTORIAL_TERMS;
  pickTerms(run, termsOffer(run)[0].id);
  const gains = [];
  for (let i = 0; i < 2; i++) { spin(run); gains.push(collect(run).gain); }
  spin(run);
  return { run, gains, hint: nudgeHint(run) };
}

if (process.argv[1]?.endsWith('find-tutorial-seed.mjs')) {
  for (let n = 0; n < 5000; n++) {
    const seed = 'first-night-' + n, { gains, hint, run } = tutorialOpening(seed);
    if (gains[0] > 0 && gains[1] > gains[0] && hint && hint.before === 0 && !run.grid.includes('ash')) { console.log(seed, gains, hint); break; }
  }
}
