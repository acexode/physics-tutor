"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Question } from "@/lib/jamb/types";
import { pickRandomTaunt } from "@/lib/quiz-celebration";
import { getTopicById } from "@/lib/jamb/syllabus-data";
import type { RoundSummaryStats } from "@/lib/round-summary";
import {
  formatCountdown,
  paceTotalSeconds,
  PACE_LABEL,
  type QuizPace,
} from "@/lib/quiz-pace";
import { shuffleArray } from "@/lib/shuffle";
import { MathText } from "./MathText";
import { QuestionDiagramPlaceholder } from "./QuestionDiagramPlaceholder";
import { RoundSummaryModal } from "./RoundSummaryModal";

const LETTERS = ["A", "B", "C", "D", "E"] as const;

function optionLetters(q: Question): (typeof LETTERS)[number][] {
  return LETTERS.filter((L) => q.options[L] != null && q.options[L] !== "");
}

async function fireConfettiBurst() {
  const { default: confetti } = await import("canvas-confetti");
  const burst = (particleCount: number, spread: number, scalar: number) => {
    confetti({
      particleCount,
      spread,
      startVelocity: 35,
      scalar,
      ticks: 220,
      origin: { x: 0.5, y: 0.55 },
      zIndex: 9999,
      colors: ["#4ade80", "#38bdf8", "#a78bfa", "#fbbf24", "#f472b6"],
    });
  };
  burst(90, 70, 1);
  window.setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      zIndex: 9999,
      colors: ["#4ade80", "#22d3ee", "#818cf8"],
    });
  }, 120);
  window.setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      zIndex: 9999,
      colors: ["#4ade80", "#22d3ee", "#818cf8"],
    });
  }, 220);
}

export function QuizModule({
  questions,
  syllabusHintTopicId,
  initialQuestionId,
}: {
  questions: Question[];
  syllabusHintTopicId?: string;
  initialQuestionId?: string;
}) {
  const deckSignature = useMemo(
    () => questions.map((x) => x.id).join("\0"),
    [questions],
  );

  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [wrongTaunt, setWrongTaunt] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryStats, setSummaryStats] = useState<RoundSummaryStats | null>(null);
  const [pace, setPace] = useState<QuizPace>("easy");
  const [timerKey, setTimerKey] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const confettiKeyRef = useRef<string | null>(null);
  /** Mirrors round counts for summary (avoids stale closure on “Finish round”). */
  const roundCorrectRef = useRef(0);
  const roundWrongRef = useRef(0);
  const indexRef = useRef(0);
  const revealedRef = useRef(false);
  const deckLenRef = useRef(0);
  const summaryOpenRef = useRef(false);
  const paceRef = useRef<QuizPace>("easy");
  const expiredFiredRef = useRef(false);

  useLayoutEffect(() => {
    indexRef.current = index;
    revealedRef.current = revealed;
    deckLenRef.current = deck.length;
    summaryOpenRef.current = summaryOpen;
    paceRef.current = pace;
  }, [index, revealed, deck.length, summaryOpen, pace]);

  useEffect(() => {
    queueMicrotask(() => {
      if (questions.length === 0) {
        setDeck([]);
        return;
      }
      const shuffled = shuffleArray([...questions]);
      let start = 0;
      if (initialQuestionId) {
        const p = shuffled.findIndex((x) => x.id === initialQuestionId);
        if (p >= 0) start = p;
      }
      setDeck(shuffled);
      setIndex(start);
      setSelected(null);
      setRevealed(false);
      setWrongTaunt(null);
      confettiKeyRef.current = null;
      roundCorrectRef.current = 0;
      roundWrongRef.current = 0;
      setSummaryOpen(false);
      setSummaryStats(null);
      setTimeExpired(false);
      expiredFiredRef.current = false;
      setTimeLeftSec(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deckSignature fingerprints questions
  }, [deckSignature, initialQuestionId]);

  useEffect(() => {
    if (questions.length === 0 || summaryOpen || deck.length === 0) return;

    expiredFiredRef.current = false;
    queueMicrotask(() => setTimeExpired(false));

    const deadline = Date.now() + paceTotalSeconds(deck.length, pace) * 1000;
    let cancelled = false;

    const tick = () => {
      if (cancelled || summaryOpenRef.current) return;
      const leftSec = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeftSec(leftSec);
      if (leftSec <= 0 && !expiredFiredRef.current) {
        expiredFiredRef.current = true;
        setTimeExpired(true);
        const idx = indexRef.current;
        const rev = revealedRef.current;
        const len = deckLenRef.current;
        const answered = rev ? idx + 1 : idx;
        const unanswered = Math.max(0, len - answered);
        roundWrongRef.current += unanswered;
        const topicLabel = syllabusHintTopicId
          ? getTopicById(syllabusHintTopicId)?.title
          : undefined;
        setSummaryStats({
          correct: roundCorrectRef.current,
          wrong: roundWrongRef.current,
          total: len,
          topicLabel,
          endedByTimeOut: true,
          unansweredCount: unanswered,
          paceLabel: PACE_LABEL[paceRef.current],
        });
        queueMicrotask(() => {
          setSummaryOpen(true);
          setTimeLeftSec(null);
        });
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [questions.length, deck.length, deckSignature, pace, timerKey, summaryOpen, syllabusHintTopicId]);

  const finishRoundAndShuffle = useCallback(() => {
    setSummaryOpen(false);
    setSummaryStats(null);
    setRevealed(false);
    setSelected(null);
    setWrongTaunt(null);
    confettiKeyRef.current = null;
    roundCorrectRef.current = 0;
    roundWrongRef.current = 0;
    setTimeExpired(false);
    expiredFiredRef.current = false;
    setTimeLeftSec(null);
    if (questions.length === 0) {
      setDeck([]);
      setIndex(0);
      return;
    }
    setDeck(shuffleArray([...questions]));
    setIndex(0);
  }, [questions]);

  const dismissSummaryOnly = useCallback(() => {
    setSummaryOpen(false);
    setSummaryStats(null);
  }, []);

  const q = deck[index];
  const topic = useMemo(() => {
    const id = syllabusHintTopicId ?? q?.topicIds[0];
    return id ? getTopicById(id) : undefined;
  }, [syllabusHintTopicId, q]);

  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-pulse-border bg-pulse-surface p-4 text-sm text-pulse-muted backdrop-blur-md">
        No questions in this set yet.
      </p>
    );
  }

  const loadingDeck = !q || deck.length === 0;
  const letters = q ? optionLetters(q) : [];
  const correct = q?.correctOption;
  const isCorrect = Boolean(q && selected && selected === correct);

  function reveal() {
    if (timeExpired || summaryOpen || expiredFiredRef.current) return;
    if (!q || !selected || !correct) return;
    const gotIt = selected === correct;
    if (gotIt) {
      setWrongTaunt(null);
      const key = `${index}-${q.id}-correct`;
      if (confettiKeyRef.current !== key) {
        confettiKeyRef.current = key;
        queueMicrotask(() => {
          void fireConfettiBurst();
        });
      }
    } else {
      setWrongTaunt(pickRandomTaunt());
    }
    roundCorrectRef.current += gotIt ? 1 : 0;
    roundWrongRef.current += gotIt ? 0 : 1;
    setRevealed(true);
  }

  function next() {
    if (timeExpired || summaryOpen || expiredFiredRef.current) return;
    confettiKeyRef.current = null;
    if (index + 1 < deck.length) {
      setWrongTaunt(null);
      setSelected(null);
      setRevealed(false);
      setIndex((i) => i + 1);
    } else {
      // End of round: do NOT clear `selected` while `revealed` stays true — otherwise
      // `isCorrect` becomes false and the UI flashes "Incorrect" before the summary opens.
      const topicLabel = syllabusHintTopicId
        ? getTopicById(syllabusHintTopicId)?.title
        : undefined;
      const stats: RoundSummaryStats = {
        correct: roundCorrectRef.current,
        wrong: roundWrongRef.current,
        total: deck.length,
        topicLabel,
        paceLabel: PACE_LABEL[paceRef.current],
      };
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setSummaryStats(stats);
          setSummaryOpen(true);
          setTimeLeftSec(null);
        });
      });
    }
  }

  const hintObjectives = topic?.objectives.slice(0, 3) ?? [];
  const isLastInRound = deck.length > 0 && index === deck.length - 1;
  const canChangePace = index === 0 && !revealed && !summaryOpen && !timeExpired;
  const totalAllocatedSec = deck.length > 0 ? paceTotalSeconds(deck.length, pace) : 0;

  function setPaceSafe(nextPace: QuizPace) {
    if (!canChangePace) return;
    setPace(nextPace);
    setTimerKey((k) => k + 1);
  }

  return (
    <>
    <RoundSummaryModal
      open={summaryOpen}
      stats={summaryStats}
      onContinue={finishRoundAndShuffle}
      onGoDashboard={dismissSummaryOnly}
    />
    {loadingDeck ? (
      <p className="rounded-2xl border border-pulse-border bg-pulse-surface p-4 text-sm text-pulse-muted backdrop-blur-md">
        Shuffling questions…
      </p>
    ) : (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-pulse-border bg-pulse-surface-strong/50 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-pulse-blue">Pace</span>
          {timeLeftSec != null && totalAllocatedSec > 0 ? (
            <span
              className={[
                "font-mono text-sm font-bold tabular-nums",
                timeLeftSec <= 10 ? "text-pulse-red" : timeLeftSec <= 30 ? "text-pulse-orange" : "text-pulse-text",
              ].join(" ")}
            >
              {formatCountdown(timeLeftSec)} / {formatCountdown(totalAllocatedSec)} allotted
            </span>
          ) : (
            <span className="text-xs text-pulse-muted">Starting timer…</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["easy", "medium", "hard"] as const).map((p) => (
            <button
              key={p}
              type="button"
              disabled={!canChangePace}
              onClick={() => setPaceSafe(p)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition",
                pace === p
                  ? "bg-pulse-blue text-pulse-bg"
                  : "border border-pulse-border bg-pulse-surface text-pulse-text hover:border-pulse-blue/40",
                !canChangePace ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              {p === "easy" ? "Easy (60s/q)" : p === "medium" ? "Medium (45s/q)" : "Hard (30s/q)"}
            </button>
          ))}
        </div>
        {(index > 0 || revealed) && !summaryOpen ? (
          <p className="text-[11px] text-pulse-muted">Pace locks after you answer the first question this round.</p>
        ) : null}
        <div className="h-1.5 overflow-hidden rounded-full bg-pulse-border/40">
          <div
            className="h-full rounded-full bg-pulse-blue transition-[width] duration-300 ease-linear"
            style={{
              width:
                timeLeftSec != null && totalAllocatedSec > 0
                  ? `${Math.min(100, (timeLeftSec / totalAllocatedSec) * 100)}%`
                  : "100%",
            }}
          />
        </div>
      </div>

    <motion.div
      className={[
        "rounded-2xl border border-pulse-border bg-pulse-surface p-5 shadow-[0_0_24px_transparent] backdrop-blur-md",
        summaryOpen ? "pointer-events-none" : "",
      ].join(" ")}
      animate={
        revealed
          ? isCorrect
            ? {
                scale: [1, 1.02, 1],
                boxShadow: "0 0 36px rgba(74, 222, 128, 0.35)",
              }
            : {
                x: [0, -10, 10, -10, 10, 0],
                boxShadow: "0 0 32px rgba(251, 146, 60, 0.28)",
              }
          : { scale: 1, x: 0, boxShadow: "0 0 24px transparent" }
      }
      transition={
        revealed && isCorrect
          ? {
              // Spring only supports two keyframes; multi-step scale must use tween.
              duration: 0.45,
              ease: "easeOut",
            }
          : { duration: 0.42, ease: "easeInOut" }
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pulse-border/60 pb-3">
        <div className="text-sm text-pulse-muted">
          Question {index + 1} of {deck.length}
          <span className="ml-2 text-pulse-muted/70">· shuffled</span>
          {q.year ? <span className="ml-2 text-pulse-muted/80">· {q.year}</span> : null}
        </div>
        {q.needsHumanReview ? (
          <span className="rounded-full border border-pulse-orange/40 bg-pulse-surface-strong px-2 py-0.5 text-xs font-medium text-pulse-orange">
            Needs human review
          </span>
        ) : null}
      </div>

      <QuestionDiagramPlaceholder diagramKey={q.diagramKey} />

      <p className="mt-4 text-base leading-relaxed text-pulse-text">
        <MathText text={q.stem} />
      </p>

      <ul className="mt-4 space-y-2">
        {letters.map((L) => {
          const text = q.options[L]!;
          const chosen = selected === L;
          const showCorrect = revealed && L === correct;
          const showWrong = revealed && chosen && L !== correct;
          return (
            <li key={L}>
              <button
                type="button"
                disabled={revealed || timeExpired || summaryOpen}
                onClick={() => setSelected(L)}
                className={[
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                  chosen && !revealed
                    ? "border-pulse-green/60 bg-pulse-surface-strong shadow-[0_0_16px_rgba(74,222,128,0.12)]"
                    : "border-pulse-border bg-pulse-surface-strong/50 hover:border-pulse-blue/35",
                  showCorrect ? "border-pulse-green bg-pulse-surface-strong" : "",
                  showWrong ? "border-pulse-red/70 bg-pulse-red/10" : "",
                  revealed ? "cursor-default opacity-95" : "",
                ].join(" ")}
              >
                <span className="mt-0.5 font-mono text-xs font-bold text-pulse-muted">{L}.</span>
                <span className="text-pulse-text">
                  <MathText text={text} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        {!revealed ? (
          <button
            type="button"
            disabled={!selected || timeExpired || summaryOpen}
            onClick={reveal}
            className="rounded-xl bg-pulse-green px-4 py-2 text-sm font-semibold text-pulse-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            disabled={timeExpired || summaryOpen}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="rounded-xl border border-pulse-border bg-pulse-surface-strong px-4 py-2 text-sm font-semibold text-pulse-text backdrop-blur-sm transition hover:border-pulse-blue/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLastInRound ? "Finish round — see score" : "Next question"}
          </button>
        )}
      </div>

      {revealed ? (
        <div className="mt-5 space-y-4 border-t border-pulse-border/60 pt-4">
          <div
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium",
              isCorrect
                ? "bg-pulse-green/15 text-pulse-green"
                : "bg-pulse-orange/15 text-pulse-orange",
            ].join(" ")}
          >
            {isCorrect ? "Correct." : `Incorrect. The answer is ${correct}.`}
          </div>

          {revealed && !isCorrect && wrongTaunt ? (
            <motion.div
              role="status"
              aria-live="polite"
              className="relative rounded-xl border border-pulse-orange/35 bg-linear-to-br from-pulse-orange/20 via-pulse-surface-strong to-pulse-red/10 px-4 py-3"
              initial={{ opacity: 0, scale: 0.98, y: 4 }}
              animate={{
                opacity: 1,
                scale: [1, 1.01, 1],
                y: 0,
              }}
              transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.5, ease: "easeOut" } }}
            >
              <div className="flex items-start gap-3">
                <motion.span
                  className="select-none text-4xl leading-none drop-shadow-[0_0_12px_rgba(251,146,60,0.45)]"
                  animate={{ rotate: [-8, 8, -6, 6, 0], y: [0, -2, 0] }}
                  transition={{
                    duration: 1.1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  aria-hidden
                >
                  🤨
                </motion.span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-pulse-orange">
                    Physics pulse says
                  </p>
                  <p className="mt-1 text-sm font-semibold italic leading-snug text-pulse-text">
                    “{wrongTaunt}”
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}

          <div>
            <h4 className="text-sm font-semibold text-pulse-text">Explanation</h4>
            <p className="mt-1 text-sm leading-relaxed text-pulse-muted">
              <MathText text={q.whyCorrect} />
            </p>
          </div>
          {!isCorrect && selected ? (
            <div>
              <h4 className="text-sm font-semibold text-pulse-text">Why option {selected} is wrong</h4>
              <p className="mt-1 text-sm leading-relaxed text-pulse-muted">
                <MathText
                  text={
                    q.whyOthersWrong[selected as keyof typeof q.whyOthersWrong] ??
                    "No separate note was stored for this distractor."
                  }
                />
              </p>
            </div>
          ) : null}
          {hintObjectives.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-pulse-text">Syllabus objectives (hint)</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-pulse-muted">
                {hintObjectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </motion.div>
    </>
    )}
    </>
  );
}
