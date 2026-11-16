// The 8 lines of the 3x3 grid. Cells are row-major: index = row * 3 + col.
import { deepFreeze } from './freeze.js';

export const LINES = deepFreeze([
  { id: 'row0', kind: 'row', index: 0, cells: [0, 1, 2] },
  { id: 'row1', kind: 'row', index: 1, cells: [3, 4, 5] },
  { id: 'row2', kind: 'row', index: 2, cells: [6, 7, 8] },
  { id: 'col0', kind: 'col', index: 0, cells: [0, 3, 6] },
  { id: 'col1', kind: 'col', index: 1, cells: [1, 4, 7] },
  { id: 'col2', kind: 'col', index: 2, cells: [2, 5, 8] },
  { id: 'diag_down', kind: 'diag', index: 0, cells: [0, 4, 8] },
  { id: 'diag_up', kind: 'diag', index: 1, cells: [2, 4, 6] },
]);
