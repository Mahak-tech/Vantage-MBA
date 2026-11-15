import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  Plus,
  BookOpen,
  ChevronDown,
  Trash2,
  BookmarkCheck,
  Search
} from 'lucide-react';
import { Subject, StudyDocument, Question, QuestionType, DifficultyLevel } from '../../types';
import { api } from '../../services/api';

interface PracticeQuestionsSectionProps {
  subject: Subject;
  documents: StudyDocument[];
  questions: Question[];
  onRefresh: () => void;
  isBankMode?: boolean;
}

export const PracticeQuestionsSection: React.FC<PracticeQuestionsSectionProps> = ({
  subject,
  documents,
  questions,
  onRefresh,
  isBankMode = false
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Generate Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genCount, setGenCount] = useState(5);
  const [genType, setGenType] = useState<QuestionType>('mcq');
  const [genDifficulty, setGenDifficulty] = useState<DifficultyLevel>('intermediate');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredQuestions = questions.filter(q => {
    const matchesDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesType = filterType === 'all' || q.type === filterType;
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiff && matchesType && matchesSearch;
  });

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
    setRevealedAnswers(prev => ({ ...prev, [questionId]: true }));
  };

  const toggleReveal = (questionId: string) => {
    setRevealedAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await api.generateQuestions({
        subjectId: subject.id,
        docIds: selectedDocIds.length > 0 ? selectedDocIds : undefined,
        topic: genTopic.trim() || undefined,
        count: genCount,
        type: genType,
        difficulty: genDifficulty
      });
      setShowGenModal(false);
      setGenTopic('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to generate practice questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (qId: string) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.deleteQuestion(qId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete question.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>{isBankMode ? 'Subject MCQ & Question Bank' : 'Practice Questions & Exercises'} ({questions.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Exam-level MCQs, case problems, and numericals with rigorous answer explanations and distractor rationale.
          </p>
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Questions</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-500">Filters:</span>
          {/* Difficulty */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced (Exam)</option>
          </select>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Question Types</option>
            <option value="mcq">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="case_based">Case-Based</option>
            <option value="numerical">Numerical Problem</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-3 shadow-xs">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Question Bank Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generate MCQs, case scenarios, or numerical problems from your uploaded lecture slides to test your mastery.
            </p>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Generate Practice Questions
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, qIndex) => {
            const userAns = selectedAnswers[q.id];
            const isRevealed = revealedAnswers[q.id] || Boolean(userAns);
            const isCorrect = userAns === q.correctAnswer;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Q{qIndex + 1}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {q.topic || 'Concept'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      q.difficulty === 'advanced' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      q.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                    title="Remove Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Question Text */}
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {q.question}
                </p>

                {/* Options (MCQ / TrueFalse) */}
                {q.options && q.options.length > 0 && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = userAns === opt;
                      const isThisCorrect = opt === q.correctAnswer;

                      let optStyle = 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200';

                      if (isRevealed) {
                        if (isThisCorrect) {
                          optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
                        } else if (isOptionSelected) {
                          optStyle = 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold ring-1 ring-rose-400';
                        } else {
                          optStyle = 'border-slate-200 dark:border-slate-800 opacity-60 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${optStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </div>

                          {isRevealed && isThisCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                          )}
                          {isRevealed && isOptionSelected && !isThisCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Reveal Answer Button */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => toggleReveal(q.id)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>{isRevealed ? 'Hide Explanation' : 'Show Answer & Distractor Rationale'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition transform ${isRevealed ? 'rotate-180' : ''}`} />
                  </button>

                  {q.sourceRef && (
                    <span className="text-[11px] text-slate-400">
                      Ref: {q.sourceRef}
                    </span>
                  )}
                </div>

                {/* Explanation Card */}
                {isRevealed && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-3 animate-in fade-in">
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                        ✓ Correct Answer: {q.correctAnswer}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                    </div>

                    {/* Explanations of why other options are wrong */}
                    {q.wrongOptionsExplanation && Object.keys(q.wrongOptionsExplanation).length > 0 && (
                      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                          Distractor Rationale (Why other choices are incorrect):
                        </span>
                        {Object.entries(q.wrongOptionsExplanation).map(([wrongOpt, reason]) => (
                          <div key={wrongOpt} className="text-slate-600 dark:text-slate-400 text-[11px] pl-2.5 border-l-2 border-indigo-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">"{wrongOpt}": </span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Generate Practice Questions</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Create exam-style MCQs and case questions directly from course slides.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic or Chapter (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Weighted Average Cost of Capital (WACC)"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Question Format
                </label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="case_based">Case-Based</option>
                  <option value="numerical">Numerical Problem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced (Exam)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Questions
              </label>
              <select
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            {documents.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Source Materials ({documents.length} available)
                </label>
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {documents.map(d => {
                    const isChecked = selectedDocIds.includes(d.id);
                    return (
                      <label key={d.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDocIds([...selectedDocIds, d.id]);
                            else setSelectedDocIds(selectedDocIds.filter(id => id !== d.id));
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{d.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate Questions'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
