// id -> { file (null = synth only), vol (0..1), pv (random pitch variance, +- fraction), rate (fixed playback rate), loop }
// Ids follow TECH.md section 6. Files live in public/sfx/. Nobody has listened to these picks yet.
const o = 'ogg', w = 'wav';
const S = (id, ext, vol = 0.8, pv = 0.04, extra = {}) => [id, { file: ext ? `${id}.${ext}` : null, vol, pv, rate: 1, ...extra }];

export const SFX = Object.fromEntries([
  S('crank_pull', o, 0.8, 0.03),
  S('reel_spin', o, 0.35, 0, { loop: true }),
  S('reel_stop_1', o, 0.6, 0.02, { rate: 1 }),
  S('reel_stop_2', o, 0.72, 0.02, { rate: 0.94 }),
  S('reel_stop_3', o, 0.85, 0.02, { rate: 0.88 }),
  S('pair_pulse', o, 0.4, 0.03),
  S('peg_on', w, 0.8, 0.05),
  S('peg_off', w, 0.6, 0.06),
  S('peg_hit', w, 0.8, 0.02),
  S('line_ink', o, 0.6, 0.04),
  S('pay_step', w, 0.7, 0),
  S('coin_fly', o, 0.5, 0.08),
  S('coin_jar', w, 0.8, 0.05),
  S('trinket_tick', o, 0.6, 0.05),
  S('lantern_light', w, 0.7, 0),
  S('big_win', o, 0.9, 0),
  S('stamp_paid', o, 0.9, 0.02, { rate: 0.7 }),
  S('orhan_hm', null, 0.7, 0.05),
  S('orhan_cough', null, 0.7, 0.05),
  S('deni_blip', w, 0.6, 0),
  S('event_stamp', null, 0.9, 0.02),
  S('quota_fail', w, 0.7, 0),
  S('run_win', o, 0.85, 0),
  S('shop_open', w, 0.6, 0.04),
  S('buy', w, 0.8, 0.03),
  S('sell', w, 0.7, 0.03),
  S('reroll', o, 0.7, 0.03),
  S('remove_token', w, 0.6, 0.06),
  S('deny', w, 0.6, 0.03),
  S('ui_tap', w, 0.6, 0.04),
  S('ui_page', w, 0.6, 0.03),
  S('build_hammer', w, 0.85, 0.03),
  S('build_done', w, 0.8, 0),
  S('plank_gain', w, 0.7, 0),
  S('postcard', w, 0.6, 0.03),
  S('streak', w, 0.7, 0),
  S('amb_harbor', null, 0.15, 0, { loop: true }),
  S('amb_night', null, 0.15, 0, { loop: true }),
]);

// Pitch ladders for playStep: semitone offsets per step. pay_step has 8 pitches, lantern_light 5.
export const LADDERS = {
  pay_step: [0, 2, 4, 5, 7, 9, 11, 12],
  lantern_light: [0, 2, 4, 7, 9],
};
