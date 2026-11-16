import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Layers,
  HelpCircle,
  Award,
  BarChart2,
  Briefcase,
  ChevronDown,
  Search,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import {
  Subject,
  StudyDocument,
  AcademicTerm,
  AIConversation,
  ConversationMessage,
  TeachingMode,
  TutorCitation
} from '../types';
import { api } from '../services/api';
import { marked } from 'marked';

interface AiTutorWorkspaceViewProps {
  subjects: Subject[];
  terms: AcademicTerm[];
  activeTermId?: string;
  initialSubjectId?: string;
  initialPrompt?: string;
}

export const AiTutorWorkspaceView: React.FC<AiTutorWorkspaceViewProps> = ({
  subjects,
  terms,
  activeTermId = 'term-2',
  initialSubjectId,
  initialPrompt
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ''
  );
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<TeachingMode>('teach_me');

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isSending, setIsSending] = useState(false);
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const activeTerm = terms.find(t => t.id === activeTermId) || terms[1] || terms[0];

  const teachingModes: Array<{ id: TeachingMode; label: string; icon: any; desc: string }> = [
    { id: 'teach_me', label: 'Teach Me', icon: GraduationCap, desc: 'Intuitive beginner breakdown with everyday & business examples' },
    { id: 'notes_maker', label: 'Notes Maker', icon: FileText, desc: 'Synthesizes complete, short & revision notes from course slides' },
    { id: 'practice_me', label: 'Practice Me', icon: HelpCircle, desc: 'Generates MCQs, numerical problems & application scenarios' },
    { id: 'exam_prep', label: 'Exam Prep', icon: Award, desc: 'Practice predictions with 2-mark, 5-mark & 10-mark model answers' },
    { id: 'case_study', label: 'Case Analyst', icon: Briefcase, desc: 'Reads complete case studies & builds strategic MBA recommendations' },
    { id: 'assignment_assistant', label: 'Assignment Coach', icon: BarChart2, desc: 'Deconstructs assignment rubrics & provides outline coaching' },
    { id: 'doubt_solver', label: 'Doubt Solver', icon: Sparkles, desc: 'Rigorous answers referencing exact formulas and slide numbers' },
    { id: 'visual_teacher', label: 'Visual Teacher', icon: Layers, desc: 'Structured flowcharts, mind maps & comparative matrices' }
  ];

  const suggestedQuestions: Record<TeachingMode, string[]> = {
    teach_me: [
      'Explain price elasticity of demand like I am 10 years old with an ice cream analogy',
      'What is the difference between movement along a demand curve and a curve shift?',
      'Walk me through the circular flow model with a modern tech platform example'
    ],
    notes_maker: [
      'Synthesize complete executive notes from Sessions 1-5 of my uploaded materials',
      'Create quick revision flash notes covering all elasticity formulas',
      'Extract all key definitions and decision rules from my slides'
    ],
    practice_me: [
      'Generate 3 intermediate MCQs on arc elasticity with detailed explanations',
      'Give me a numerical problem calculating equilibrium price and quantity',
      'Create an application question on consumer surplus for a ride-sharing firm'
    ],
    exam_prep: [
      'Generate 2-mark, 5-mark and 10-mark practice predicted questions for my midterm',
      'Provide a 10-mark model answer on returns to scale vs diminishing returns',
      'What are the most frequently tested concepts in this subject?'
    ],
    case_study: [
      'Analyze the core business problem and stakeholder conflicts in my uploaded case',
      'Apply economic theories to evaluate the strategic options available',
      'Formulate an executive recommendation and 90-day implementation plan'
    ],
    assignment_assistant: [
      'Break down my assignment prompt into smaller milestones and deliverables',
      'Which lecture slides and theories should I cite in section 2?',
      'Review my methodology and suggest concrete areas for improvement'
    ],
    doubt_solver: [
      'Why is marginal revenue equal to price in a perfectly competitive market?',
      'How do I calculate user cost of capital with economic depreciation?',
      'Explain the equimarginal principle formula step by step'
    ],
    visual_teacher: [
      'Create a visual ASCII flowchart of the firm production decision process',
      'Build a concept comparison matrix between perfect competition and monopoly',
      'Map out the stages of demand estimation regression modeling'
    ]
  };

  useEffect(() => {
    if (selectedSubjectId) {
      loadConversations();
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const convList = await api.getConversations({ subjectId: selectedSubjectId });
      setConversations(convList);
      if (convList.length > 0) {
        // Select first conversation if none selected or if switching subject
        const current = convList.find(c => c.id === activeConversationId);
        if (current) {
          selectConversation(current);
        } else {
          selectConversation(convList[0]);
        }
      } else {
        // Create an initial welcome conversation
        handleNewConversation();
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = (conv: AIConversation) => {
    setActiveConversationId(conv.id);
    setActiveMode(conv.mode || 'teach_me');
    setMessages(conv.messages || []);
  };

  const handleNewConversation = async () => {
    if (!selectedSubject) return;
    try {
      const modeConfig = teachingModes.find(m => m.id === activeMode);
      const newConv = await api.createConversation({
        subjectId: selectedSubject.id,
        termId: selectedSubject.termId || activeTermId,
        title: `New ${modeConfig?.label || 'Tutoring'} Session`,
        mode: activeMode
      });

      // Add welcoming introductory greeting from AI professor
      const welcomeMsg: ConversationMessage = {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: `Greetings! I am your personal MBA Professor and Academic AI Tutor for **${selectedSubject.name}** in **${activeTerm.name}**.\n\nI have indexed all your uploaded lecture slides, notes, and case materials in this subject workspace. My current mode is set to **${modeConfig?.label}** (${modeConfig?.desc}).\n\nHow can I help you master your coursework today?`,
        timestamp: new Date().toISOString()
      };

      newConv.messages = [welcomeMsg];
      setConversations(prev => [newConv, ...prev.filter(c => c.id !== newConv.id)]);
      selectConversation(newConv);
    } catch (err: any) {
      alert(err.message || 'Failed to create conversation');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending || !activeConversationId || !selectedSubject) return;

    try {
      setIsSending(true);
      setInputText('');

      const tempUserMsg: ConversationMessage = {
        id: `temp_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      const assistantReply = await api.sendConversationMessage(activeConversationId, {
        content: text,
        mode: activeMode
      });

      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, assistantReply]);

      // Refresh conversation list in background to update title & timestamp
      api.getConversations({ subjectId: selectedSubjectId }).then(setConversations).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'AI Tutor response failed.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation history?')) return;
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          selectConversation(remaining[0]);
        } else {
          handleNewConversation();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete conversation');
    }
  };

  const handleSaveToNotes = async (content: string) => {
    if (!selectedSubject) return;
    try {
      await api.convertChatToNote({
        subjectId: selectedSubject.id,
        title: `${selectedSubject.name} - AI Tutor Note`,
        content,
        type: activeMode === 'notes_maker' ? 'complete' : 'revision',
        topic: 'AI Tutoring Synthesis'
      });
      showNotification('Saved to your Subject Notes successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save to notes');
    }
  };

  const handleConvertToFlashcards = async (content: string) => {
    if (!selectedSubject) return;
    try {
      // Parse key QA pairs from content
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const cards = [
        { front: `Key Concept: ${lines[0]?.replace(/[#*]/g, '').trim() || selectedSubject.name}`, back: content.substring(0, 300) }
      ];
      await api.convertChatToFlashcards({
        subjectId: selectedSubject.id,
        cards,
        topic: 'AI Tutoring'
      });
      showNotification('Flashcards added to your subject deck!');
    } catch (err: any) {
      alert(err.message || 'Failed to convert to flashcards');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchConvQuery.trim()) return true;
    return c.title.toLowerCase().includes(searchConvQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Left Sidebar: Subject Selector & Conversation History */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        {/* Subject & Term Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Isolated AI Workspace
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
              {activeTerm.name} Active
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code || 'MBA'})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Conversation Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchConvQuery}
              onChange={(e) => setSearchConvQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet for this subject.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{conv.title}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 rounded transition"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {/* Top Teaching Modes Selector Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-2 shrink-0">
            Teaching Mode:
          </span>
          {teachingModes.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMode(m.id);
                  if (activeConversationId) {
                    api.updateConversation(activeConversationId, { mode: m.id }).catch(() => {});
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
                title={m.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto p-8 text-center space-y-4 pt-16">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {selectedSubject?.name} AI Tutor
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                I am connected strictly to your uploaded lecture slides and materials for {selectedSubject?.name}. Ask any question, generate exam predictions, or analyze case studies.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              if (msg.content === 'START_TUTOR_SESSION') return null;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-3 ${isUser ? 'max-w-lg' : 'flex-1'}`}>
                    <div
                      className={`p-5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-indigo-600 text-white font-medium rounded-tr-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div
                          className="prose prose-xs dark:prose-invert max-w-none space-y-2"
                          dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                        />
                      )}
                    </div>

                    {/* Citations & Source Preview (Assistant only) */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 text-[11px] space-y-1">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                          Verified Course Sources ({msg.citations.length}):
                        </span>
                        {msg.citations.map((c, idx) => (
                          <div key={idx} className="text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-indigo-400">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{c.docTitle}</span> ({c.pageTitle}):
                            <span className="italic ml-1">"{c.snippet}"</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons (Assistant only) */}
                    {!isUser && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleSaveToNotes(msg.content)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 rounded-lg transition"
                          title="Save this answer to Subject Notes"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Save to Notes</span>
                        </button>

                        <button
                          onClick={() => handleConvertToFlashcards(msg.content)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 rounded-lg transition"
                          title="Generate Flashcards from this answer"
                        >
                          <Layers className="w-3 h-3" />
                          <span>To Flashcards</span>
                        </button>

                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => handleSendMessage(`Please elaborate further and provide another practical MBA business example.`)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 rounded-lg transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Elaborate</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex gap-3 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>Consulting {selectedSubject?.name} knowledge base...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Suggested Questions & Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
          {/* Suggested Prompts for active mode */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Suggested:
            </span>
            {(suggestedQuestions[activeMode] || suggestedQuestions.teach_me).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="text-[11px] px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 rounded-xl whitespace-nowrap transition shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask your ${selectedSubject?.name} professor (${teachingModes.find(m => m.id === activeMode)?.label} mode)...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
