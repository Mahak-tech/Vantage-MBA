import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { Subject, StudyDocument, Question, QuizAttempt } from '../../types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

interface QuizSectionProps {
  subject: Subject;
  documents: StudyDocument[];
  questions: Question[];
  onRefresh: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  subject,
  documents,
  questions,
  onRefresh
}) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Quiz State
  const [mode, setMode] = useState<'hub' | 'setup' | 'taking' | 'results'>('hub');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);

  // Setup options
  const [setupTopic, setSetupTopic] = useState('');
  const [setupCount, setSetupCount] = useState(5);
  const [setupDifficulty, setSetupDifficulty] = useState('intermediate');
  const [setupTimeLimitMinutes, setSetupTimeLimitMinutes] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadAttempts();
  }, [subject.id]);

  const loadAttempts = async () => {
    try {
      setLoadingAttempts(true);
      const data = await api.getQuizAttempts(subject.id);
      setAttempts(data);
    } catch (err) {
      console.error('Failed to load quiz attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (mode === 'taking' && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
        setTimeTakenSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timeRemainingSeconds]);

  const handleStartQuiz = async () => {
    try {
      setIsGenerating(true);
      let pool = questions.filter(q => {
        if (setupDifficulty !== 'all' && q.difficulty !== setupDifficulty) return false;
        if (setupTopic && !q.topic.toLowerCase().includes(setupTopic.toLowerCase())) return false;
        return true;
      });

      if (pool.length < setupCount) {
        const generated = await api.generateQuestions({
          subjectId: subject.id,
          topic: setupTopic || undefined,
          count: setupCount,
          difficulty: setupDifficulty as any
        });
        pool = [...pool, ...generated];
      }

      const selected = pool.slice(0, setupCount);
      setQuizQuestions(selected);
      setCurrentQIndex(0);
      setUserAnswers({});
      setTimeRemainingSeconds(setupTimeLimitMinutes * 60);
      setTimeTakenSeconds(0);
      setMode('taking');
    } catch (err: any) {
      alert(err.message || 'Failed to start quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQIndex]: option }));
  };

  const handleSubmitQuiz = async () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const topicMap: Record<string, { total: number; correct: number }> = {};

    quizQuestions.forEach((q, idx) => {
      const topic = q.topic || 'General';
      if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 };
      topicMap[topic].total += 1;

      const userAns = userAnswers[idx];
      if (!userAns) {
        unattempted += 1;
      } else if (userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correct += 1;
        topicMap[topic].correct += 1;
      } else {
        incorrect += 1;
      }
    });

    const percentage = Math.round((correct / quizQuestions.length) * 100);

    const topicBreakdown = Object.entries(topicMap).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }));

    const recommendations = [];
    if (percentage < 60) {
      recommendations.push('Review high-yield revision notes before retesting.');
      recommendations.push('Revisit spaced repetition flashcards for missed topics.');
    } else if (percentage < 85) {
      recommendations.push('Good foundation! Focus on the distractor rationales for incorrect options.');
    } else {
      recommendations.push('Excellent mastery! Ready for exam-level case analysis.');
    }

    const payload: Partial<QuizAttempt> = {
      subjectId: subject.id,
      title: `${subject.name} - ${setupTopic || 'Comprehensive Mock Exam'}`,
      totalQuestions: quizQuestions.length,
      correctCount: correct,
      incorrectCount: incorrect,
      unattemptedCount: unattempted,
      score: correct,
      percentage,
      timeTakenSeconds,
      difficulty: setupDifficulty,
      topicBreakdown,
      recommendations,
      questions: quizQuestions,
      userAnswers
    };

    try {
      const savedAttempt = await api.submitQuiz(payload);
      setActiveAttempt(savedAttempt);
      setMode('results');
      loadAttempts();

      if (percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz results.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. QUIZ HUB VIEW
  if (mode === 'hub') {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Interactive Mock Exams & Quizzes</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Timed practice tests simulated directly from your lecture slides and textbook materials.
            </p>
          </div>

          <button
            onClick={() => setMode('setup')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start New Timed Quiz</span>
          </button>
        </div>

        {/* Previous Quiz Attempts History */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Quiz History & Analytics</h3>

          {attempts.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-xs italic">
              No quizzes attempted yet. Click "Start New Timed Quiz" to test your knowledge!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {attempts.map((att) => (
                <div key={att.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{att.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        att.percentage >= 70
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {att.percentage}% Score
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{att.correctCount}/{att.totalQuestions} Correct</span>
                      <span>•</span>
                      <span>{Math.round(att.timeTakenSeconds / 60)} min taken</span>
                      <span>•</span>
                      <span>{new Date(att.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveAttempt(att);
                      setMode('results');
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. QUIZ SETUP VIEW
  if (mode === 'setup') {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Configure Mock Exam</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize subject topics, question depth, and timer constraints.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Specific Topic or Focus Area (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Valuation Multiples & DCF"
              value={setupTopic}
              onChange={(e) => setSetupTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Questions
              </label>
              <select
                value={setupCount}
                onChange={(e) => setSetupCount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions (Quick Drill)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Full Test)</option>
                <option value={15}>15 Questions (Mastery Exam)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Time Limit (Minutes)
              </label>
              <select
                value={setupTimeLimitMinutes}
                onChange={(e) => setSetupTimeLimitMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Difficulty Tier
            </label>
            <select
              value={setupDifficulty}
              onChange={(e) => setSetupDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="intermediate">Intermediate (Standard MBA Exam)</option>
              <option value="beginner">Beginner (Foundational)</option>
              <option value="advanced">Advanced (Rigorous Case Exam)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMode('hub')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Back
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleStartQuiz}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            {isGenerating ? 'Preparing Questions...' : 'Start Quiz Now'}
          </button>
        </div>
      </div>
    );
  }

  // 3. QUIZ TAKING VIEW
  if (mode === 'taking' && quizQuestions.length > 0) {
    const q = quizQuestions[currentQIndex];
    const userAns = userAnswers[currentQIndex];
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Timer Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Question {currentQIndex + 1} of {quizQuestions.length}
            </span>
            <span className="text-xs text-slate-400">
              ({answeredCount} answered)
            </span>
          </div>

          {/* Countdown Clock */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold ${
            timeRemainingSeconds < 120 ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
          }`}>
            <Timer className="w-4 h-4" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          <button
            onClick={handleSubmitQuiz}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            Submit Quiz
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded">
              {q.topic || 'Concept'}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 capitalize">
              {q.difficulty}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {q.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {q.options?.map((opt, oIdx) => {
              const isSelected = userAns === opt;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center gap-3.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Nav buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Question circles */}
            <div className="hidden sm:flex items-center gap-1.5">
              {quizQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold transition ${
                    currentQIndex === idx
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : userAnswers[idx]
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQIndex < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:opacity-90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. QUIZ RESULTS VIEW
  if (mode === 'results' && activeAttempt) {
    const isPassing = activeAttempt.percentage >= 60;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Results Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto border-2 border-indigo-200 dark:border-indigo-800">
            <span className="text-3xl font-extrabold">{activeAttempt.percentage}%</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isPassing ? 'Exam Completed Successfully! 🎯' : 'Quiz Complete – Review Recommended'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Time taken: {Math.round(activeAttempt.timeTakenSeconds / 60)} min • Total Questions: {activeAttempt.totalQuestions}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="block text-lg font-bold text-emerald-700 dark:text-emerald-400">{activeAttempt.correctCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Correct</span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 text-center">
              <span className="block text-lg font-bold text-rose-700 dark:text-rose-400">{activeAttempt.incorrectCount}</span>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Incorrect</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
              <span className="block text-lg font-bold text-slate-700 dark:text-slate-300">{activeAttempt.unattemptedCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">Unattempted</span>
            </div>
          </div>

          {/* Recommendations */}
          {activeAttempt.recommendations && activeAttempt.recommendations.length > 0 && (
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 text-left space-y-1">
              <span className="font-bold block uppercase tracking-wider text-[10px]">Academic Recommendations:</span>
              {activeAttempt.recommendations.map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setMode('hub')}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Back to Quiz Hub
            </button>
            <button
              onClick={() => {
                setMode('setup');
                handleStartQuiz();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              Retake Quiz
            </button>
          </div>
        </div>

        {/* Topic Breakdown */}
        {activeAttempt.topicBreakdown && activeAttempt.topicBreakdown.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Topic-Wise Performance</h3>
            <div className="space-y-2">
              {activeAttempt.topicBreakdown.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{t.topic}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{t.correct}/{t.total} ({t.percentage}%)</span>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t.percentage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${t.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Question Review */}
        {activeAttempt.questions && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Detailed Answer Key & Explanations</h3>
            <div className="space-y-4">
              {activeAttempt.questions.map((q, idx) => {
                const userAns = activeAttempt.userAnswers?.[idx];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{q.question}</p>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Your Answer: </span>
                        <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {userAns || '(Unattempted)'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Correct Answer: </span>
                          <span className="text-emerald-600 font-bold">{q.correctAnswer}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
