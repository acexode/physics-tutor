/** Playful one-liners when an answer is wrong (keep tone light, not personal attacks). */
export const WRONG_ANSWER_TAUNTS = [
  "The syllabus saw that one coming.",
  "Not quite — try the explanation below.",
  "Bold choice. Boldly incorrect.",
  "Close… if we are measuring in astronomical units.",
  "That answer had energy, just not the right kind.",
  "Newton called. He said “recheck the forces.”",
  "Nice try — the mark scheme disagrees.",
  "Hmm. The universe remains unmoved by that pick.",
  "Almost… no, wait. Not almost.",
  "If wrong answers were kinetic, you would have powered a city.",
] as const;

export function pickRandomTaunt(): string {
  const i = Math.floor(Math.random() * WRONG_ANSWER_TAUNTS.length);
  return WRONG_ANSWER_TAUNTS[i] ?? WRONG_ANSWER_TAUNTS[0];
}
