import React, { useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { TARGET_ROLES } from '../data/catalog';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { ChatMessage, LearnerProfile } from '../types';
import { formatTimestampNow, generateMentorReply } from '../utils/skillEngine';

interface MentorTabProps {
  profile: LearnerProfile;
}

const SUGGESTED_QUESTIONS = [
  'What are my top skill gaps?',
  'What should I study next in the roadmap?',
  'How do assessments update my skill level?',
  'What portfolio project should I build next?',
];

export function MentorTab({ profile }: MentorTabProps) {
  const role = TARGET_ROLES[profile.targetRole];
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'mentor-welcome',
      sender: 'mentor',
      text: `Simulated Mentor (Demo Mode): Welcome, ${profile.name}. I am aligned with your ${role.title} goal. Ask about your skill gaps, next roadmap step, or portfolio ideas.`,
      timestamp: formatTimestampNow(),
    },
  ]);

  const speech = useSpeechInput((transcript) => {
    setInput((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
  });

  const sendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: formatTimestampNow(),
    };

    const replyMsg: ChatMessage = {
      id: `mentor-${Date.now() + 1}`,
      sender: 'mentor',
      text: generateMentorReply(trimmed, profile),
      timestamp: formatTimestampNow(),
    };

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="sp-card rounded-2xl p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--sp-border)] pb-4">
        <div>
          <h2 className="font-display text-3xl font-semibold">Career Mentor</h2>
          <p className="text-xs text-[var(--sp-text-muted)]">
            Simulated Mentor · Local rule-based demo replies grounded in your current SkillPath profile (not live AI).
          </p>
        </div>
        <span className="text-[11px] font-mono text-[var(--sp-gold-bright)] whitespace-nowrap">
          Simulated Demo Chat
        </span>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-[var(--sp-text-muted)]">Suggested questions</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 rounded-lg bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] hover:border-[var(--sp-gold-bright)] text-xs transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div
        aria-label="Simulated mentor conversation"
        className="space-y-3 max-h-[380px] overflow-y-auto rounded-xl bg-[var(--sp-surface-muted)] p-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[var(--sp-gold-bright)] text-[#12151e] font-medium'
                  : 'bg-[var(--sp-surface-solid)] border border-[var(--sp-border)] text-[var(--sp-text)]'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] font-mono text-[var(--sp-text-muted)] mt-1 tabular-nums">
              {msg.sender === 'user' ? 'You' : 'Simulated Mentor'} · {msg.timestamp}
            </span>
          </div>
        ))}
      </div>

      {/* Input + Microphone */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="mentor-chat-input" className="sr-only">
            Ask the simulated mentor
          </label>
          <input
            id="mentor-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skill gaps, next roadmap steps, or projects..."
            className="sp-input flex-1 rounded-lg px-3.5 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={speech.toggleListening}
            aria-label={speech.isListening ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={speech.isListening}
            title={speech.isSupported ? 'Speak message' : 'Speech recognition unavailable'}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              speech.isListening
                ? 'border-rose-500 bg-rose-500/15 text-rose-500'
                : 'border-[var(--sp-border-strong)] hover:border-[var(--sp-gold-bright)]'
            }`}
          >
            {speech.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-teal-700 text-white dark:bg-[#2dd4bf] dark:text-[#091214] text-xs font-semibold hover:opacity-95 whitespace-nowrap cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>

        {speech.isListening && (
          <p role="status" className="text-xs font-mono text-[var(--sp-teal)]">
            Listening… speak clearly into your microphone.
          </p>
        )}
        {speech.feedback && (
          <p role="status" className="text-xs text-[var(--sp-gold-bright)]">
            {speech.feedback}
          </p>
        )}
      </form>
    </div>
  );
}
