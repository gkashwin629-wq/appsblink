import React, { useState } from 'react';
import { ExternalLink, MessageCircleQuestion, Mic, MicOff, X } from 'lucide-react';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { buildAskAiUrls } from '../utils/skillEngine';

const TRENDING_QUESTIONS = [
  'Explain SQL window functions vs GROUP BY with an example',
  'How should I structure TypeScript discriminated unions in React?',
  'Difference between readinessProbe and livenessProbe in Kubernetes',
];

export function AskAiWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');

  const speech = useSpeechInput((transcript) => {
    setQuestion((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
  });

  const { chatGptUrl, geminiUrl } = buildAskAiUrls(question);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label="Ask AI External Helper"
          className="w-[min(calc(100vw-2rem),360px)] sp-card rounded-2xl p-4 shadow-xl space-y-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold leading-none">Ask AI</h2>
              <p className="text-[11px] text-[var(--sp-text-muted)] mt-1">
                Opens ChatGPT or Gemini in a new tab (not embedded).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Ask AI panel"
              className="p-1.5 rounded-lg hover:bg-[var(--sp-surface-muted)] text-[var(--sp-text-muted)] hover:text-[var(--sp-text)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="ask-ai-input" className="block text-xs font-medium text-[var(--sp-text-muted)]">
              Your learning question
            </label>
            <div className="flex gap-2 items-start">
              <textarea
                id="ask-ai-input"
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type or speak a question to send..."
                className="sp-input flex-1 rounded-lg px-3 py-2 text-xs resize-none"
              />
              <button
                type="button"
                onClick={speech.toggleListening}
                aria-label={speech.isListening ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={speech.isListening}
                title={speech.isSupported ? 'Dictate question' : 'Speech recognition unavailable'}
                className={`p-2.5 rounded-lg border transition-colors shrink-0 ${
                  speech.isListening
                    ? 'border-rose-500 bg-rose-500/15 text-rose-500'
                    : 'border-[var(--sp-border-strong)] hover:border-[var(--sp-gold-bright)] text-[var(--sp-text)]'
                }`}
              >
                {speech.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            {speech.isListening && (
              <p role="status" className="text-[11px] font-mono text-[var(--sp-teal)]">
                Listening… speak your question clearly.
              </p>
            )}
            {speech.feedback && (
              <p role="status" className="text-[11px] text-[var(--sp-gold-bright)]">
                {speech.feedback}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-mono text-[var(--sp-text-muted)]">Trending questions</p>
            <div className="flex flex-col gap-1.5">
              {TRENDING_QUESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuestion(item)}
                  className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-[var(--sp-surface-muted)] hover:border-[var(--sp-gold-bright)] border border-transparent transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={chatGptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[var(--sp-gold-bright)] text-[#12151e] text-xs font-semibold hover:opacity-95 whitespace-nowrap"
            >
              <span>Open ChatGPT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={geminiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-teal-700 text-white dark:bg-[#2dd4bf] dark:text-[#091214] text-xs font-semibold hover:opacity-95 whitespace-nowrap"
            >
              <span>Open Gemini</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--sp-gold-bright)] text-[#12151e] font-semibold text-xs shadow-lg hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
      >
        <MessageCircleQuestion className="w-4 h-4" />
        <span>Ask AI</span>
      </button>
    </div>
  );
}
