import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { queryAiAssistant } from '../services/geminiService';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Sparkles,
  Send,
  BotMessageSquare,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Utensils,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const PRESET_QUERIES = [
  'Who owes me the most?',
  'How much did we spend on food?',
  'Split this bill equally except Rahul pays ₹200 extra.',
  'Suggest the optimal way to settle debts with minimum transactions.',
];

export default function AiAssistantPage() {
  const {
    aiChatHistory,
    addAiMessage,
    currentGroup,
    currentUser,
    currency,
  } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiChatHistory, isThinking]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isThinking) return;

    // Add user message to history
    addAiMessage({
      sender: 'user',
      text: textToSend,
    });

    setInputQuery('');
    setIsThinking(true);

    try {
      const response = await queryAiAssistant(textToSend, {
        groupName: currentGroup?.name,
        currentUser: currentUser.name,
      });

      addAiMessage({
        sender: 'ai',
        text: response.text,
        action: response.action,
        chartData: response.chartData,
      });
    } catch (err) {
      console.error(err);
      addAiMessage({
        sender: 'ai',
        text: "I couldn't process that query against the current ledger. Please try asking again.",
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleAction = (action) => {
    if (!action) return;
    if (action.type === 'navigate') {
      navigate(action.path);
    } else if (action.type === 'settle') {
      navigate('/settlement');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7.5rem)] bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <span>SplitSmart AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500">
              Synced with {currentGroup?.name || 'Goa Trip 2024'} Ledger
            </p>
          </div>
        </div>

        <Badge variant="brand" size="sm">
          Gemini Pro Fintech Engine
        </Badge>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {aiChatHistory.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isAi ? '' : 'flex-row-reverse'
              }`}
            >
              {isAi ? (
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              ) : (
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                />
              )}

              <div
                className={`max-w-[85%] sm:max-w-lg rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isAi
                    ? 'bg-slate-50 border border-slate-200/80 text-navy-900 shadow-xs'
                    : 'bg-brand-600 text-white'
                }`}
              >
                {/* Message Text with simple formatting */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Optional Chart embedded inside response */}
                {msg.chartData && (
                  <div className="mt-3 pt-3 border-t border-slate-200 bg-white rounded-xl p-3">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Individual Food Spending (₹)
                    </p>
                    <div className="h-36 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msg.chartData}>
                          <XAxis dataKey="name" fontSize={10} stroke="#94A3B8" />
                          <YAxis fontSize={10} stroke="#94A3B8" />
                          <Tooltip
                            formatter={(val) => [formatCurrency(val, currency), 'Spent']}
                          />
                          <Bar dataKey="spend" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Action CTA Button inside response */}
                {msg.action && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      iconPosition="right"
                      onClick={() => handleAction(msg.action)}
                      className="text-xs py-1.5 px-3"
                    >
                      {msg.action.label}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 text-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 flex items-center gap-2">
              <LoadingSpinner size="sm" className="text-brand-600" />
              <span className="text-xs text-slate-500 font-medium">
                SplitSmart AI is analyzing balances...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Query Pills */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Suggestions:
        </span>
        {PRESET_QUERIES.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isThinking}
            onClick={() => handleSend(q)}
            className="text-xs text-navy-800 bg-white hover:bg-slate-100 hover:text-brand-600 border border-slate-200 px-3 py-1.5 rounded-full shrink-0 transition-colors shadow-2xs font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about spending, debts, or simulated split rules..."
            disabled={isThinking}
            className="flex-1 px-4 py-3 text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuery.trim() || isThinking}
            icon={Send}
            className="rounded-2xl px-4 py-3"
          >
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

