import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Subject, StudyDocument, TutorMessage } from '../../types';
import { api } from '../../services/api';
import { marked } from 'marked';

interface AiTutorSectionProps {
  subject: Subject;
  documents: StudyDocument[];
}

export const AiTutorSection: React.FC<AiTutorSectionProps> = ({
  subject,
  documents
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: 'Explain Simply', prompt: 'Explain Simply' },
    { label: 'Business Example', prompt: 'Give a Real-Life Business Example' },
    { label: 'Step by Step', prompt: 'Explain Step by Step' },
    { label: 'From Uploaded PPT', prompt: 'Explain from My Uploaded PPT' },
    { label: 'Compare Concepts', prompt: 'Compare Two Concepts' },
    { label: 'Test My Understanding', prompt: 'Test My Understanding' },
  ];

  useEffect(() => {
    loadChatHistory();
  }, [subject.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const data = await api.getTutorMessages(subject.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string, actionPrompt?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      setInputText('');

      const tempUserMsg: TutorMessage = {
        id: `temp_${Date.now()}`,
        subjectId: subject.id,
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      const assistantReply = await api.sendTutorChat({
        subjectId: subject.id,
        message: content,
        actionPrompt
      });

      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, assistantReply]);
    } catch (err: any) {
      alert(err.message || 'Tutor response failed.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear conversation history with your AI Tutor?')) return;
    try {
      await api.clearTutorMessages(subject.id);
      setMessages([]);
    } catch (err: any) {
      alert('Failed to clear chat.');
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[750px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Academic Mentor – {subject.name}</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ready to assist" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personal MBA Mentor • RAG Document Citations Active ({documents.length} materials indexed)
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/50">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Ask your MBA Academic Mentor
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Stuck on a lecture slide, financial calculation, or strategic framework? Ask questions below or pick a prompt to begin.
              </p>
            </div>

            {/* Quick action chips */}
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(`Can you explain the core fundamentals of ${subject.name}?`, qa.prompt)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl rounded-2xl p-4.5 space-y-2 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-xs'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                  ) : (
                    <div>
                      <div
                        className="prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed prose-headings:font-bold prose-table:border prose-th:p-1.5 prose-td:p-1.5 prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-1 prose-blockquote:px-2"
                        dangerouslySetInnerHTML={{ __html: marked.parse(m.content) as string }}
                      />

                      {/* RAG Citations */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Course Material Citations:</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.citations.map((cite, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/50 rounded-lg text-[10px] font-semibold text-indigo-700 dark:text-indigo-300"
                                title={cite.snippet}
                              >
                                {cite.docTitle} • {cite.pageTitle}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          onClick={() => handleCopyMessage(m.id, m.content)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
                          title="Copy message"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Analyzing lecture slides & synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask a question about ${subject.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition shadow-xs"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default AiTutorSection;
