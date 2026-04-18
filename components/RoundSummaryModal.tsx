"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { RoundSummaryStats } from "@/lib/round-summary";
import { roundSummaryHeadline } from "@/lib/round-summary";

type Props = {
  open: boolean;
  stats: RoundSummaryStats | null;
  onContinue: () => void;
  onGoDashboard: () => void;
};

const OVERLAY_INTERACTIVE_MS = 500;

export function RoundSummaryModal({ open, stats, onContinue, onGoDashboard }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  /** Backdrop / Escape only dismiss after this arms (avoids same-gesture “double fire”). */
  const overlayReadyRef = useRef(false);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape" && overlayReadyRef.current) onContinue();
    },
    [open, onContinue],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !stats) {
      overlayReadyRef.current = false;
      return;
    }
    overlayReadyRef.current = false;
    const arm = window.setTimeout(() => {
      overlayReadyRef.current = true;
      closeBtnRef.current?.focus();
    }, OVERLAY_INTERACTIVE_MS);

    const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    if (pct >= 70 && !stats.endedByTimeOut) {
      void import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 55,
          spread: 58,
          origin: { y: 0.35 },
          zIndex: 100000,
          colors: ["#4ade80", "#38bdf8", "#fbbf24"],
        });
      });
    }
    return () => window.clearTimeout(arm);
  }, [open, stats]);

  if (typeof document === "undefined" || !open || !stats) return null;

  const copy = roundSummaryHeadline(stats);

  const modal = (
    <motion.div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        role="presentation"
        aria-hidden
        className="absolute inset-0 bg-pulse-bg/75 backdrop-blur-sm"
        onClick={() => {
          if (overlayReadyRef.current) onContinue();
        }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="round-summary-title"
        className="relative z-[100001] w-full max-w-md overflow-hidden rounded-2xl border border-pulse-border bg-pulse-surface p-6 shadow-[0_0_48px_var(--pulse-glow)] backdrop-blur-md"
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <motion.span
            className="select-none text-5xl leading-none"
            animate={{ rotate: [0, -6, 6, 0], y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            aria-hidden
          >
            {copy.badge}
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-pulse-blue">Deck cleared</p>
            <h2 id="round-summary-title" className="mt-1 text-2xl font-extrabold tracking-tight text-pulse-text">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-pulse-muted">{copy.subtitle}</p>
          </div>
        </div>

        {stats.paceLabel ? (
          <p className="mt-3 rounded-lg border border-pulse-border/60 bg-pulse-surface-strong/50 px-3 py-2 text-xs text-pulse-muted">
            Timer: <span className="font-semibold text-pulse-text">{stats.paceLabel}</span>
          </p>
        ) : null}

        {stats.topicLabel ? (
          <p className="mt-3 rounded-lg border border-pulse-border/60 bg-pulse-surface-strong/50 px-3 py-2 text-xs text-pulse-muted">
            Topic filter: <span className="font-semibold text-pulse-text">{stats.topicLabel}</span>
          </p>
        ) : null}

        {stats.endedByTimeOut && (stats.unansweredCount ?? 0) > 0 ? (
          <p className="mt-3 rounded-lg border border-pulse-orange/35 bg-pulse-orange/10 px-3 py-2 text-xs font-medium text-pulse-orange">
            Unanswered (counted as missed): {stats.unansweredCount}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-pulse-green/30 bg-pulse-green/10 px-2 py-3">
            <div className="text-2xl font-black tabular-nums text-pulse-green">{stats.correct}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-pulse-muted">Nailed it</div>
          </div>
          <div className="rounded-xl border border-pulse-orange/30 bg-pulse-orange/10 px-2 py-3">
            <div className="text-2xl font-black tabular-nums text-pulse-orange">{stats.wrong}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-pulse-muted">Plot holes</div>
          </div>
          <div className="rounded-xl border border-pulse-border bg-pulse-surface-strong px-2 py-3">
            <div className="text-2xl font-black tabular-nums text-pulse-text">{stats.total}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-pulse-muted">In the mix</div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-pulse-muted">
          Accuracy:{" "}
          <span className="font-bold text-pulse-blue">
            {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
          </span>
          {stats.wrong > 0 ? (
            <>
              {" "}
              · Wrong answers still earn you{" "}
              <span className="font-semibold text-pulse-text">free explanations</span> above.
            </>
          ) : null}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/"
            onClick={onGoDashboard}
            className="inline-flex items-center justify-center rounded-xl border border-pulse-border bg-pulse-surface-strong px-4 py-3 text-center text-sm font-semibold text-pulse-text no-underline backdrop-blur-sm transition hover:border-pulse-blue/40"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            ref={closeBtnRef}
            onClick={onContinue}
            className="rounded-xl bg-pulse-green px-4 py-3 text-sm font-bold text-pulse-bg shadow-[0_0_24px_rgba(74,222,128,0.35)] transition hover:brightness-110"
          >
            Shuffle a fresh round
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] text-pulse-muted">
          After a short moment you can tap outside to shuffle · Escape too · or head home above
        </p>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
