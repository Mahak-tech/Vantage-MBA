import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  Shuffle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Subject, StudyDocument, Flashcard } from '../../types';
import { api } from '../../services/api';

interface FlashcardsSectionProps {
  subject: Subject;
  documents: StudyDocument[];
  flashcards: Flashcard[];
  onRefresh: () => void;
}

export const FlashcardsSection: React.FC<FlashcardsSectionProps> = ({
  subject,
  documents,
  flashcards,
  onRefresh
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'study' | 'list'>('study');
  const [missedCardsOnly, setMissedCardsOnly] = useState(false);

  // Generate Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genCount, setGenCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [manualTopic, setManualTopic] = useState('');

  // Filter study cards
  const studyCards = missedCardsOnly
    ? flashcards.filter(c => c.status !== 'mastered')
    : flashcards;

  const currentCard = studyCards[currentIndex] || null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkCard = async (status: 'mastered' | 'learning') => {
    if (!currentCard) return;
    try {
      const interval = status === 'mastered' ? (currentCard.interval || 1) * 2 : 1;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);

      await api.updateFlashcard(currentCard.id, {
        status,
        interval,
        repetitions: (currentCard.repetitions || 0) + 1,
        nextReviewDate: nextDate.toISOString(),
        lastReviewedAt: new Date().toISOString()
      });

      await onRefresh();
      handleNext();
    } catch (err: any) {
      console.error('Failed to update card:', err);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await api.generateFlashcards({
        subjectId: subject.id,
        topic: genTopic.trim() || undefined,
        count: genCount
      });
      setShowGenModal(false);
      setGenTopic('');
      await onRefresh();
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      alert(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFront.trim() || !manualBack.trim()) return;

    try {
      await api.createFlashcard({
        subjectId: subject.id,
        front: manualFront.trim(),
        back: manualBack.trim(),
        topic: manualTopic.trim() || 'General'
      });
      setShowAddModal(false);
      setManualFront('');
      setManualBack('');
      setManualTopic('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add card.');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Delete this flashcard?')) return;
    try {
      await api.deleteFlashcard(cardId);
      await onRefresh();
      if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete card.');
    }
  };

  const masteredCount = flashcards.filter(c => c.status === 'mastered').length;
  const learningCount = flashcards.filter(c => c.status === 'learning').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Spaced Repetition Flashcards ({flashcards.length})</span>
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {masteredCount} Mastered
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {learningCount} In Review
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'study' ? 'list' : 'study')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            {activeTab === 'study' ? 'Manage Cards' : 'Study Mode'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
          <button
            onClick={() => setShowGenModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Flashcards</span>
          </button>
        </div>
      </div>

      {activeTab === 'study' ? (
        studyCards.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Flashcards Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Automatically extract high-yield active-recall cards from your lecture slides or create cards manually.
            </p>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Generate Cards from Course Materials
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Card {currentIndex + 1} of {studyCards.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-1 hover:text-indigo-600 font-medium transition"
                  title="Shuffle deck"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
                <button
                  onClick={() => setMissedCardsOnly(!missedCardsOnly)}
                  className={`flex items-center gap-1 font-semibold transition ${
                    missedCardsOnly ? 'text-indigo-600' : 'hover:text-indigo-600'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{missedCardsOnly ? 'Showing Missed' : 'Practice Missed'}</span>
                </button>
              </div>
            </div>

            {/* 3D Flip Card */}
            <div
              onClick={handleFlip}
              className="relative w-full h-80 cursor-pointer perspective-1000 select-none group"
            >
              <div
                className={`w-full h-full rounded-2xl transition-transform duration-500 transform-style-preserve-3d shadow-md border border-slate-200 dark:border-slate-800 relative ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded">
                      {currentCard?.topic || 'Concept'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Click anywhere to flip
                    </span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-relaxed">
                      {currentCard?.front}
                    </h3>
                  </div>

                  <div className="text-center text-[11px] text-slate-400 font-medium">
                    Question / Term Side
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-8 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 bg-white/10 px-2.5 py-1 rounded">
                      Answer & Explanation
                    </span>
                    <span className="text-xs text-indigo-200">
                      Interval: {currentCard?.interval || 1}d
                    </span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                      {currentCard?.back}
                    </p>
                  </div>

                  <div className="text-center text-[11px] text-indigo-300">
                    Spaced Repetition Active Recall
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Assessment Buttons */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => handleMarkCard('learning')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition"
              >
                <XCircle className="w-4 h-4 text-amber-600" />
                <span>Don't Know (Review Soon)</span>
              </button>
              <button
                onClick={() => handleMarkCard('mastered')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Know (Mastered)</span>
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )
      ) : (
        /* List Mode: View, Edit, Delete */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">All Cards in this Subject</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {flashcards.map((card) => (
              <div key={card.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {card.topic || 'Concept'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      card.status === 'mastered'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{card.front}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{card.back}</p>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate AI Flashcards Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Generate Flashcards</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Synthesize active recall flashcards from course materials.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic or Focus Area (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Porter's Five Forces, Cost of Equity"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Cards
              </label>
              <div className="flex gap-2">
                {[5, 8, 12, 16].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setGenCount(c)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      genCount === c
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c} Cards
                  </button>
                ))}
              </div>
            </div>

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
                <span>{isGenerating ? 'Extracting Cards...' : 'Generate Flashcards'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleManualAdd} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Create New Flashcard</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topic / Category
              </label>
              <input
                type="text"
                placeholder="e.g. Valuation, Microeconomics"
                value={manualTopic}
                onChange={(e) => setManualTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Front (Question or Term)
              </label>
              <textarea
                required
                rows={3}
                placeholder="What is Net Present Value (NPV)?"
                value={manualFront}
                onChange={(e) => setManualFront(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Back (Answer or Explanation)
              </label>
              <textarea
                required
                rows={4}
                placeholder="NPV is the sum of present values of incoming and outgoing cash flows..."
                value={manualBack}
                onChange={(e) => setManualBack(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
              >
                Add Flashcard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
