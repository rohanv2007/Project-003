"use client";
import { useState } from "react";
import { Card, SectionHead, btnPrimary, btnGhost } from "@/components/ui";
import { FIRST_AID, FIRST_AID_QUIZ, QUIZ_BADGE_TITLE } from "@/lib/data";
import { KEYS, useLocalStorage, load } from "@/lib/store";
import { whatsappUrl } from "@/lib/share";
import type { QuizBadge } from "@/lib/types";


function shareBadge(score: number, total: number) {
  const text = `${QUIZ_BADGE_TITLE}\nI scored ${score}/${total} on Nivarana's flood first-aid quiz — tested on CPR, bleeding, electric shock, choking and flood rescue. Trained to help when the water rises. 💪`;
  window.open(whatsappUrl(text), "_blank", "noopener");
}

function Quiz() {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [badges, setBadges] = useLocalStorage<QuizBadge[]>(KEYS.badges, []);
  const passMark = Math.ceil(FIRST_AID_QUIZ.length * 0.8);
  const passed = score >= passMark;
  const earned = badges.some((b) => b.id === "first-responder");

  function awardBadge(finalScore: number) {
    if (finalScore >= passMark && !load<QuizBadge[]>(KEYS.badges, []).some((b) => b.id === "first-responder")) {
      setBadges([
        ...load<QuizBadge[]>(KEYS.badges, []),
        { id: "first-responder", title: QUIZ_BADGE_TITLE, detail: `Scored ${finalScore}/${FIRST_AID_QUIZ.length} on the flood first-aid quiz`, earnedAt: Date.now() },
      ]);
    }
  }

  if (!started) {
    return (
      <Card className="mt-8 border-signal">
        <p className="font-display text-lg font-bold text-ink">⛑️ Test yourself</p>
        <p className="mt-1 text-sm text-faint">
          {FIRST_AID_QUIZ.length} quick questions drawn from these guides. Learn it now — you won't have time to read during the emergency.
          Score {passMark}+ to earn the {QUIZ_BADGE_TITLE} badge.
        </p>
        {earned && (
          <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
            {QUIZ_BADGE_TITLE} — already earned {new Date(badges.find((b) => b.id === "first-responder")!.earnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Retake it to stay sharp.
          </p>
        )}
        <button onClick={() => { setStarted(true); setIdx(0); setPicked(null); setScore(0); setDone(false); }} className={`${btnPrimary} mt-3`}>
          Start the quiz
        </button>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="mt-8 border-signal">
        <p className="font-display text-lg font-bold text-ink">Your score: {score} / {FIRST_AID_QUIZ.length}</p>
        <p className="mt-1 text-sm text-faint">
          {score === FIRST_AID_QUIZ.length
            ? "Perfect — you could genuinely help someone today."
            : score >= 3
              ? "Solid. Re-read the guides you missed and try again."
              : "Worth another pass through the guides above — these answers save lives."}
        </p>
        <button
          onClick={() => { setIdx(0); setPicked(null); setScore(0); setDone(false); }}
          className={`${btnGhost} mt-3`}
        >
          Retake quiz
        </button>
        {passed && (
          <div className="mt-4 rounded-lg border border-gold bg-gold/10 p-4">
            <p className="font-display text-lg font-bold text-ink">{QUIZ_BADGE_TITLE}</p>
            <p className="mt-1 text-sm text-soot">
              You earned this badge — it lives on this device as proof you've trained. Show your neighbours; the street that knows first aid survives floods better.
            </p>
            <button onClick={() => shareBadge(score, FIRST_AID_QUIZ.length)} className={`${btnPrimary} mt-3`}>
              Share badge on WhatsApp
            </button>
          </div>
        )}
      </Card>
    );
  }

  const q = FIRST_AID_QUIZ[idx];
  const answered = picked !== null;
  const correct = picked === q.answer;

  return (
    <Card className="mt-8 border-signal">
      <p className="text-xs font-semibold uppercase tracking-wide text-faint">Question {idx + 1} of {FIRST_AID_QUIZ.length}</p>
      <p className="mt-1 font-display text-lg font-bold text-ink">{q.question}</p>
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => { setPicked(i); if (i === q.answer) setScore((s) => s + 1); }}
              className={`w-full rounded-md border px-3 py-2.5 text-left text-sm font-medium ${
                answered
                  ? isAnswer
                    ? "border-moss bg-moss/10 text-ink"
                    : isPicked
                      ? "border-alarm bg-alarm/10 text-ink"
                      : "border-line bg-paper text-faint"
                  : "border-line bg-paper text-ink hover:border-signal"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3">
          <p className={`text-sm font-bold ${correct ? "text-moss" : "text-alarm"}`}>
            {correct ? "✓ Correct." : "✗ Not quite."}
          </p>
          <p className="mt-1 text-sm text-soot">{q.why}</p>
          <button
            onClick={() => {
              if (idx + 1 >= FIRST_AID_QUIZ.length) { awardBadge(score); setDone(true); }
              else { setIdx(idx + 1); setPicked(null); }
            }}
            className={`${btnPrimary} mt-3`}
          >
            {idx + 1 >= FIRST_AID_QUIZ.length ? "See my score" : "Next question"}
          </button>
        </div>
      )}
    </Card>
  );
}

export default function FirstAid() {
  const [open, setOpen] = useState<string | null>(FIRST_AID[0].id);
  return (
    <div className="mx-auto max-w-3xl">
      <SectionHead
        title="First aid — quick guides"
        sub="Preloaded for offline use. Read them now, not during the emergency."
      />
      <div className="sticky top-0 z-30 mb-3 flex gap-2 rounded-md border border-alarm/30 bg-cream/95 p-2 backdrop-blur">
        <a href="tel:108" className="flex-1 rounded-md bg-alarm px-3 py-2.5 text-center text-sm font-bold text-white">🚑 Call 108 — Ambulance</a>
        <a href="tel:112" className="flex-1 rounded-md border border-alarm px-3 py-2.5 text-center text-sm font-bold text-alarm">📞 Call 112 — Emergency</a>
      </div>
      <div className="space-y-3">
        {FIRST_AID.map((g) => {
          const isOpen = open === g.id;
          return (
            <Card key={g.id}>
              <button onClick={() => setOpen(isOpen ? null : g.id)} className="flex w-full items-center justify-between gap-3 text-left">
                <span>
                  <span className="font-display text-lg font-bold text-ink">{g.title}</span>
                  <span className="block text-sm text-faint">{g.subtitle}</span>
                </span>
                <span className="text-xl text-faint">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="mt-4 border-t border-line pt-4">
                  <ol className="space-y-2.5">
                    {g.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-soot">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-xs font-bold text-white">{i + 1}</span>
                        <span className="pt-0.5">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 rounded-md bg-alarm/10 px-3 py-2 text-sm font-medium text-alarm">⚠️ {g.warning}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-faint">These guides don't replace training or professional help. Call 108 in a medical emergency.</p>
      <Quiz />
    </div>
  );
}
