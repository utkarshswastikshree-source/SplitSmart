import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, Wand2 } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const SUGGESTIONS = [
  'Rahul and Aman share pizza. Kumar gets the burger. Everyone shares drinks.',
  'Split all items equally across all 4 members.',
  'Priya and Rahul share seafood & rice. Kumar gets pomfret fry.',
];

export default function AiPromptInput({ onParsePrompt, isParsing }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isParsing) return;
    onParsePrompt(prompt);
  };

  const handleSuggestionClick = (text) => {
    setPrompt(text);
    onParsePrompt(text);
  };

  return (
    <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-navy-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-brand-800/50">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-500/30 text-brand-300 border border-brand-400/30">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold tracking-wide uppercase text-brand-200">
          AI Natural Language Splitting
        </h3>
      </div>

      <p className="text-xs text-slate-300 mb-4 max-w-xl leading-relaxed">
        Tell Gemini AI how to split the bill in plain English. SplitSmart automatically identifies people and matches dishes to assign costs.
      </p>

      {/* Main Prompt Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "Rahul and Aman share pizza. Kumar gets the burger. Everyone shares drinks."'
          className="w-full bg-navy-950/80 border border-slate-700/80 rounded-2xl py-3.5 pl-4 pr-32 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all shadow-inner"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!prompt.trim() || isParsing}
            loading={isParsing}
            icon={Wand2}
            className="rounded-xl shadow-none py-2 px-3 text-xs bg-brand-500 hover:bg-brand-600"
          >
            Apply AI
          </Button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Quick Prompts:
        </span>
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSuggestionClick(sug)}
            className="text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg transition-colors border border-white/10 truncate max-w-xs text-left"
          >
            "{sug}"
          </button>
        ))}
      </div>
    </div>
  );
}

