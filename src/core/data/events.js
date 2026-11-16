// The 4 lite creditor events (CONTENT.md section 4). Data only; run.js reads `mods` at tide start.
// mods: pegDelta (pegs this tide), spinsDelta, quotaMul, noPegCols (column indexes that cannot be pegged),
//       lineSkip (line ids that do not pay).
import { deepFreeze } from './freeze.js';

const E = (id, en, tr, who, mods) => ({ id, en, tr, who, mods, nameKey: `event.${id}.name`, descKey: `event.${id}.desc` });

export const EVENTS = deepFreeze([
  E('auditor', 'The Auditor', 'Müfettiş', 'Nermin Hanım', { pegDelta: -1 }), // "2 pegs instead of 3" as -1, so Spare Peg still adds
  E('fog_bank', 'Fog Bank', 'Sis', 'weather', { noPegCols: [2] }),
  E('short_day', 'Short Day', 'Kısa Gün', 'the ferry timetable', { spinsDelta: -1, quotaMul: 0.9 }),
  E('low_water', 'Low Water', 'Çekilme', 'the sea', { lineSkip: ['row2'] }),
]);
