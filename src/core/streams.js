// Counted rng streams: run.rngState[label] = draws so far, so a saved run resumes with the same future.
import { makeRng } from './rng.js';

const cache = new WeakMap();

export function stream(run, label) {
  let m = cache.get(run);
  if (!m) cache.set(run, (m = {}));
  if (m[label]) return m[label];
  run.rngState ??= {};
  const base = makeRng(run.seed).fork(label);
  for (let i = 0, n = run.rngState[label] || 0; i < n; i++) base.next();
  const next = () => {
    run.rngState[label] = (run.rngState[label] || 0) + 1;
    return base.next();
  };
  return (m[label] = {
    next,
    int: (n) => Math.floor(next() * n),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    weighted(items, weights) {
      let total = 0;
      for (const w of weights) total += w;
      let r = next() * total;
      for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r < 0) return items[i];
      }
      return items[items.length - 1];
    },
  });
}
