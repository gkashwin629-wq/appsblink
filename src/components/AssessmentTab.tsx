import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { SKILL_CATALOG, SKILL_LEVEL_LABELS, TARGET_ROLES } from '../data/catalog';
import { LearnerProfile } from '../types';
import { AssessmentOutcome, evaluateAssessment } from '../utils/skillEngine';

interface AssessmentTabProps {
  profile: LearnerProfile;
  selectedSkillId: string;
  onSelectSkill: (skillId: string) => void;
  onAssessmentEvaluated: (outcome: AssessmentOutcome) => void;
}

export function AssessmentTab({
  profile,
  selectedSkillId,
  onSelectSkill,
  onAssessmentEvaluated,
}: AssessmentTabProps) {
  const skill = SKILL_CATALOG.find((s) => s.id === selectedSkillId) ?? SKILL_CATALOG[0];
  const role = TARGET_ROLES[profile.targetRole];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [outcome, setOutcome] = useState<AssessmentOutcome | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setAnswers({});
    setOutcome(null);
    setValidationError(null);
  }, [skill.id]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unanswered = skill.questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setValidationError(`Please answer all ${skill.questions.length} questions before scoring.`);
      return;
    }
    const currentLevel = profile.skillLevels[skill.id] ?? 0;
    const result = evaluateAssessment(skill, answers, currentLevel);
    setOutcome(result);
    onAssessmentEvaluated(result);
  };

  const handleRetake = () => {
    setAnswers({});
    setOutcome(null);
    setValidationError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Skill Selector Sidebar */}
      <aside className="lg:col-span-4 sp-card rounded-2xl p-5 space-y-3">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold">Skill Assessments</h2>
          <p className="text-xs text-[var(--sp-text-muted)]">
            Pass at 67%+ to advance your recorded proficiency up to Proficient (Lv 3) or Advanced (Lv 4).
          </p>
        </div>

        <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
          {SKILL_CATALOG.map((item) => {
            const isSelected = item.id === skill.id;
            const currentLv = profile.skillLevels[item.id] ?? 0;
            const isRoleRequired = role.requiredSkills[item.id] !== undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSkill(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[var(--sp-gold-bright)] bg-[var(--sp-gold-bright)]/10'
                    : 'border-transparent bg-[var(--sp-surface-muted)] hover:border-[var(--sp-border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{item.name}</span>
                  <span className="text-[11px] font-mono tabular-nums text-[var(--sp-text-muted)]">
                    Lv {currentLv}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--sp-text-muted)] mt-0.5">
                  {item.category}
                  {isRoleRequired ? ` · Role target Lv ${role.requiredSkills[item.id]}` : ''}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Active Assessment Questions & Results */}
      <section className="lg:col-span-8 sp-card rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--sp-border)] pb-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-[var(--sp-teal)]">{skill.category}</p>
            <h3 className="font-display text-3xl font-semibold">{skill.name}</h3>
            <p className="text-xs text-[var(--sp-text-muted)]">{skill.description}</p>
          </div>
          <div className="text-right font-mono text-xs">
            <p>Recorded Level: {profile.skillLevels[skill.id] ?? 0}/5</p>
            <p className="text-[var(--sp-text-muted)]">
              {SKILL_LEVEL_LABELS[profile.skillLevels[skill.id] ?? 0]}
            </p>
          </div>
        </div>

        {outcome && (
          <div
            role="status"
            className={`rounded-xl border p-4 space-y-2 ${
              outcome.passed
                ? 'border-teal-500/40 bg-teal-500/10'
                : 'border-amber-500/40 bg-amber-500/10'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Award className="w-4 h-4 text-[var(--sp-gold-bright)]" />
                <span>
                  Score: {outcome.score}/{outcome.total} ({outcome.percent}%) —{' '}
                  {outcome.passed ? 'Benchmark Passed' : 'Review Recommended'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--sp-surface-solid)] border border-[var(--sp-border)] text-xs font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>
            <p className="text-xs text-[var(--sp-text-muted)]">
              {outcome.levelUpdated
                ? `Skill level promoted from Level ${outcome.previousLevel} (${SKILL_LEVEL_LABELS[outcome.previousLevel]}) to Level ${outcome.newLevel} (${SKILL_LEVEL_LABELS[outcome.newLevel]}).`
                : `Recorded level remains Level ${outcome.newLevel} (${SKILL_LEVEL_LABELS[outcome.newLevel]}).`}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {skill.questions.map((q, qIdx) => {
            const graded = outcome?.results.find((r) => r.questionId === q.id);
            return (
              <fieldset key={q.id} className="space-y-2.5 rounded-xl bg-[var(--sp-surface-muted)] p-4">
                <legend className="text-sm font-medium leading-snug">
                  {qIdx + 1}. {q.prompt}
                </legend>
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isChecked = answers[q.id] === optIdx;
                    const isCorrectOption = graded && optIdx === q.correctIndex;
                    const isWrongPicked = graded && isChecked && !graded.isCorrect;

                    return (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs cursor-pointer transition-colors ${
                          isCorrectOption
                            ? 'border-teal-500 bg-teal-500/15'
                            : isWrongPicked
                            ? 'border-rose-500 bg-rose-500/15'
                            : isChecked
                            ? 'border-[var(--sp-gold-bright)] bg-[var(--sp-surface-solid)]'
                            : 'border-[var(--sp-border)] bg-[var(--sp-surface-solid)]/60 hover:border-[var(--sp-border-strong)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={isChecked}
                          disabled={Boolean(outcome)}
                          onChange={() => handleSelectOption(q.id, optIdx)}
                          className="mt-0.5 accent-[var(--sp-gold-bright)]"
                        />
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {graded && (
                  <div className="pt-2 border-t border-[var(--sp-border)] flex items-start gap-2 text-xs">
                    {graded.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--sp-teal)] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <p className="text-[var(--sp-text-muted)] leading-relaxed">{graded.explanation}</p>
                  </div>
                )}
              </fieldset>
            );
          })}

          {validationError && (
            <p role="alert" className="text-xs text-rose-500 dark:text-rose-400">
              {validationError}
            </p>
          )}

          {!outcome && (
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[var(--sp-gold-bright)] text-[#12151e] text-sm font-semibold hover:opacity-95 cursor-pointer"
            >
              Score Assessment
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
