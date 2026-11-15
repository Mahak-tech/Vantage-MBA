import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  GitBranch,
  Network,
  Activity,
  Sliders,
  Columns,
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Subject, StudyDocument, VisualStudioItem, VisualMode } from '../../types';
import { api } from '../../services/api';

interface VisualStudioSectionProps {
  subject: Subject;
  documents: StudyDocument[];
}

export const VisualStudioSection: React.FC<VisualStudioSectionProps> = ({
  subject,
  documents
}) => {
  const [visualItems, setVisualItems] = useState<VisualStudioItem[]>([]);
  const [activeItem, setActiveItem] = useState<VisualStudioItem | null>(null);
  const [currentMode, setCurrentMode] = useState<VisualMode>('flowchart');
  const [loading, setLoading] = useState(true);

  // Flowchart state
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Concept Map state
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Animated Equilibrium state
  const [sliderPrice, setSliderPrice] = useState(50);
  const [supplyShift, setSupplyShift] = useState(0);
  const [demandShift, setDemandShift] = useState(0);

  // Business Simulation state
  const [simPrice, setSimPrice] = useState(50);
  const [simUnitCost, setSimUnitCost] = useState(20);
  const [simMarketingSpend, setSimMarketingSpend] = useState(10000);

  // Generation Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genMode, setGenMode] = useState<VisualMode>('flowchart');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadVisualItems();
  }, [subject.id]);

  const loadVisualItems = async () => {
    try {
      setLoading(true);
      const data = await api.getVisualItems(subject.id);
      setVisualItems(data);
      if (data.length > 0) {
        setActiveItem(data[0]);
        setCurrentMode(data[0].mode);
      } else {
        handleQuickDefaultVisual('flowchart');
      }
    } catch (err) {
      console.error('Failed to load visual items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDefaultVisual = async (mode: VisualMode) => {
    try {
      setIsGenerating(true);
      const defaultTopic =
        mode === 'flowchart' ? 'Product Development Lifecycle & GTM Strategy' :
        mode === 'simulation' ? 'Pricing, Margin & Revenue Elasticity' :
        mode === 'animated_explanation' ? 'Market Equilibrium & Supply Shocks' :
        mode === 'comparison' ? 'Agile vs Waterfall Methodologies' :
        mode === 'concept_map' ? 'Strategic Competitive Advantage' :
        'Customer Retention & Product Market Fit';

      const item = await api.generateVisual({
        subjectId: subject.id,
        topic: defaultTopic,
        mode
      });

      setVisualItems(prev => [item, ...prev]);
      setActiveItem(item);
      setCurrentMode(mode);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    try {
      setIsGenerating(true);
      const item = await api.generateVisual({
        subjectId: subject.id,
        topic: genTopic.trim(),
        mode: genMode
      });
      setVisualItems(prev => [item, ...prev]);
      setActiveItem(item);
      setCurrentMode(item.mode);
      setShowGenModal(false);
      setGenTopic('');
    } catch (err: any) {
      alert(err.message || 'Failed to generate visual model.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this visual model?')) return;
    try {
      await api.deleteVisual(id);
      const updated = visualItems.filter(v => v.id !== id);
      setVisualItems(updated);
      setActiveItem(updated[0] || null);
    } catch (err) {
      alert('Failed to delete visual.');
    }
  };

  // Dynamic calculations for simulation mode
  const baseDemand = 1000;
  const priceElasticity = 1.8;
  const calculatedUnitsSold = Math.max(
    50,
    Math.round((baseDemand * Math.pow(50 / simPrice, priceElasticity)) + (simMarketingSpend / 20))
  );
  const calculatedGrossRevenue = calculatedUnitsSold * simPrice;
  const calculatedCOGS = calculatedUnitsSold * simUnitCost;
  const calculatedGrossProfit = calculatedGrossRevenue - calculatedCOGS;
  const calculatedNetProfit = calculatedGrossProfit - simMarketingSpend;
  const calculatedMarginPercent = calculatedGrossRevenue > 0 ? Math.round((calculatedGrossProfit / calculatedGrossRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Visual Learning Studio</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/50">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transform abstract MBA theories into interactive flowcharts, simulations, market equilibrium models, and comparison matrices.
          </p>
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Visual</span>
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'flowchart', label: 'Flowchart', icon: GitBranch },
          { id: 'concept_map', label: 'Concept Map', icon: Network },
          { id: 'animated_explanation', label: 'Equilibrium Dynamics', icon: Activity },
          { id: 'simulation', label: 'Business Simulation', icon: Sliders },
          { id: 'comparison', label: 'Visual Comparison', icon: Columns },
          { id: 'storytelling', label: 'Executive Case Analysis', icon: BookOpen },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setCurrentMode(m.id as VisualMode);
                const matchingItem = visualItems.find(v => v.mode === m.id);
                if (matchingItem) {
                  setActiveItem(matchingItem);
                } else {
                  handleQuickDefaultVisual(m.id as VisualMode);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Studio Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs min-h-[580px]">
        {/* Active Model Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
              {currentMode.replace('_', ' ')}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{activeItem?.title || 'Interactive Model'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">{activeItem?.explanation}</p>
          </div>

          {activeItem && (
            <button
              onClick={() => handleDelete(activeItem.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition self-start sm:self-center"
              title="Delete Visual Model"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 1. FLOWCHART MODE */}
        {currentMode === 'flowchart' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(activeItem?.data?.steps || [
                { id: '1', title: '1. Discovery & Need', badge: 'Stage 1', description: 'Validate customer problem statement and total addressable market size.' },
                { id: '2', title: '2. MVP Specification', badge: 'Stage 2', description: 'Define core functional scope and prototype key hypotheses.' },
                { id: '3', title: '3. Unit Economics', badge: 'Stage 3', description: 'Measure acquisition costs (CAC) against customer lifetime value (LTV).' },
                { id: '4', title: '4. Scale & Moats', badge: 'Stage 4', description: 'Automate marketing funnels and establish defensive barriers.' },
              ]).map((step: any, idx: number) => {
                const isSelected = activeStepIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {step.badge || `Stage ${idx + 1}`}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-2">{step.title}</h4>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      <span>Inspect Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Step Inspection Card */}
            {(() => {
              const steps = activeItem?.data?.steps || [];
              const step = steps[activeStepIndex] || steps[0];
              if (!step) return null;
              return (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {activeStepIndex + 1}
                    </span>
                    <span>Executive Inspection: {step.title}</span>
                  </h4>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {step.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {step.metrics && (
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">Key Metrics & KPIs:</span>
                        <p className="text-slate-600 dark:text-slate-400">{step.metrics}</p>
                      </div>
                    )}
                    {step.example && (
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">MBA Real-World Case Study:</span>
                        <p className="text-slate-600 dark:text-slate-400">{step.example}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 2. CONCEPT MAP MODE */}
        {currentMode === 'concept_map' && (
          <div className="space-y-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any concept node to explore its theoretical relationships, strategic drivers, and dependencies.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(activeItem?.data?.nodes || [
                { id: 'core', label: 'Strategic Moat', details: 'Structural advantage preventing competitor margin erosion.' },
                { id: 'network', label: 'Network Effects', details: 'Product value increases quadratically with each new user (Metcalfe\'s Law).' },
                { id: 'switching', label: 'Switching Costs', details: 'Friction and pain incurred when changing vendors or platforms.' },
                { id: 'cost', label: 'Cost Leadership', details: 'Structural lower production cost enabling price flexibility (e.g. Walmart).' },
                { id: 'intangibles', label: 'Intangible Assets', details: 'Patents, proprietary tech, brand goodwill, and regulatory licenses.' },
                { id: 'scale', label: 'Scale Economies', details: 'Fixed overhead distributed across massive output volumes.' },
              ]).map((node: any) => {
                const isSelected = activeNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`p-4 rounded-xl border text-center transition flex flex-col justify-center items-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Network className={`w-5 h-5 mb-2 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold">{node.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              {(() => {
                const nodes = activeItem?.data?.nodes || [];
                const active = nodes.find((n: any) => n.id === activeNodeId) || nodes[0];
                return (
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{active?.label || 'Select a Concept'}</h5>
                    <p className="text-slate-600 dark:text-slate-400">{active?.details || 'Explore interconnectivity between strategic management principles.'}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 3. ANIMATED EQUILIBRIUM MODE */}
        {currentMode === 'animated_explanation' && (
          <div className="space-y-6">
            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Market Price ($): <span className="text-indigo-600 dark:text-indigo-400 font-bold">${sliderPrice}</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={sliderPrice}
                  onChange={(e) => setSliderPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supply Shift (Cost/Raw Material Shock): <span className="text-emerald-600 font-bold">{supplyShift > 0 ? `+${supplyShift}` : supplyShift}</span>
                </label>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={supplyShift}
                  onChange={(e) => setSupplyShift(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Demand Shift (Consumer Preference): <span className="text-sky-600 font-bold">{demandShift > 0 ? `+${demandShift}` : demandShift}</span>
                </label>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={demandShift}
                  onChange={(e) => setDemandShift(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            {/* SVG Equilibrium Canvas */}
            <div className="relative bg-slate-900 dark:bg-slate-950 rounded-xl p-6 text-white overflow-hidden shadow-inner border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="font-semibold text-indigo-300">Price vs Quantity Equilibrium Dynamics</span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-emerald-400 font-semibold">• Supply Curve (S)</span>
                  <span className="text-sky-400 font-semibold">• Demand Curve (D)</span>
                </div>
              </div>

              <div className="h-64 flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <line x1="40" y1="20" x2="40" y2="180" stroke="#334155" strokeWidth="2" />
                  <line x1="40" y1="180" x2="380" y2="180" stroke="#334155" strokeWidth="2" />
                  <text x="15" y="30" fill="#94A3B8" fontSize="10">Price (P)</text>
                  <text x="340" y="195" fill="#94A3B8" fontSize="10">Quantity (Q)</text>

                  {/* Supply Curve */}
                  <line
                    x1="60"
                    y1={160 - supplyShift}
                    x2="340"
                    y2={40 - supplyShift}
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <text x="345" y={45 - supplyShift} fill="#10B981" fontSize="11" fontWeight="bold">S</text>

                  {/* Demand Curve */}
                  <line
                    x1="60"
                    y1={40 - demandShift}
                    x2="340"
                    y2={160 - demandShift}
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <text x="345" y={165 - demandShift} fill="#38BDF8" fontSize="11" fontWeight="bold">D</text>

                  {/* Price Line */}
                  <line
                    x1="40"
                    y1={180 - (sliderPrice * 1.5)}
                    x2="380"
                    y2={180 - (sliderPrice * 1.5)}
                    stroke="#FBBF24"
                    strokeDasharray="4"
                    strokeWidth="2"
                  />
                  <text x="320" y={175 - (sliderPrice * 1.5)} fill="#FBBF24" fontSize="10" fontWeight="bold">
                    P = ${sliderPrice}
                  </text>
                </svg>
              </div>

              {/* Economic Outcome Summary */}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Market Condition:</span>
                  <span className="font-semibold text-white">
                    {sliderPrice > 60 ? 'Surplus (Excess Supply)' : sliderPrice < 45 ? 'Shortage (Excess Demand)' : 'Equilibrium Cleared'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/80">
                  <span className="text-sky-300 block text-[10px] uppercase font-semibold">Price Pressure:</span>
                  <span className="font-semibold text-white">
                    {sliderPrice > 60 ? 'Downward Pressure on Price' : sliderPrice < 45 ? 'Upward Pressure on Price' : 'Price Stable'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/80">
                  <span className="text-amber-300 block text-[10px] uppercase font-semibold">Strategic Recommendation:</span>
                  <span className="font-semibold text-white">
                    {sliderPrice > 60 ? 'Stimulate demand / discount' : 'Expand capacity'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. BUSINESS SIMULATION MODE */}
        {currentMode === 'simulation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Price: <span className="text-indigo-600 dark:text-indigo-400 font-bold">${simPrice}</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={simPrice}
                  onChange={(e) => setSimPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Cost (COGS): <span className="text-slate-900 dark:text-white font-bold">${simUnitCost}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={1}
                  value={simUnitCost}
                  onChange={(e) => setSimUnitCost(parseInt(e.target.value, 10))}
                  className="w-full accent-slate-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marketing Spend: <span className="text-emerald-600 font-bold">${simMarketingSpend.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={30000}
                  step={1000}
                  value={simMarketingSpend}
                  onChange={(e) => setSimMarketingSpend(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Metrics Output Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Units Sold</span>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{calculatedUnitsSold.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Calculated by elasticity</p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center">
                <span className="text-[10px] font-semibold uppercase text-indigo-700 dark:text-indigo-300 tracking-wider">Gross Revenue</span>
                <h4 className="text-2xl font-bold text-indigo-950 dark:text-indigo-200 mt-1">${calculatedGrossRevenue.toLocaleString()}</h4>
                <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400 mt-0.5">Units × Price</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-center">
                <span className="text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">Gross Margin</span>
                <h4 className="text-2xl font-bold text-emerald-950 dark:text-emerald-200 mt-1">{calculatedMarginPercent}%</h4>
                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400 mt-0.5">${(simPrice - simUnitCost)} unit contribution</p>
              </div>

              <div className={`p-4 rounded-xl border text-center ${
                calculatedNetProfit >= 0
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              }`}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Operating Profit</span>
                <h4 className={`text-2xl font-bold mt-1 ${calculatedNetProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ${calculatedNetProfit.toLocaleString()}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Net of marketing</p>
              </div>
            </div>
          </div>
        )}

        {/* 5. VISUAL COMPARISON MODE */}
        {currentMode === 'comparison' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] font-semibold uppercase text-indigo-700 dark:text-indigo-400">Option A</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{activeItem?.data?.itemA || 'Framework A'}</h4>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Option B</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{activeItem?.data?.itemB || 'Framework B'}</h4>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="p-3.5">Criteria</th>
                    <th className="p-3.5 text-indigo-600 dark:text-indigo-400">{activeItem?.data?.itemA || 'Framework A'}</th>
                    <th className="p-3.5">{activeItem?.data?.itemB || 'Framework B'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(activeItem?.data?.criteria || [
                    { feature: 'Core Philosophy', valA: 'Iterative, sprint-based feedback loops', valB: 'Linear, sequential phase-gate progression' },
                    { feature: 'Handling Change', valA: 'Welcomes scope changes even late in cycle', valB: 'Requires formal Change Request approvals' },
                    { feature: 'Risk Profile', valA: 'Risk discovered and mitigated early via MVPs', valB: 'High risk concentrated at final testing phase' },
                    { feature: 'Best Application', valA: 'High-uncertainty software, SaaS, startups', valB: 'Regulated aerospace, civil construction, hardware' },
                  ]).map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{row.feature}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-normal">{row.valA}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{row.valB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. EXECUTIVE CASE STORYTELLING MODE */}
        {currentMode === 'storytelling' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base border border-indigo-100 dark:border-indigo-900/50">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {activeItem?.data?.character || 'Elena Vasquez, Chief Operating Officer'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeItem?.data?.company || 'LogiTech Solutions (B2B SaaS)'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {(activeItem?.data?.episodes || [
                {
                  title: 'Act 1: The Churn Crisis',
                  situation: 'LogiTech reached $2M ARR, but annual churn spiked from 3% to 11%.',
                  decision: 'Instead of raising sales commissions, leadership shadowed frontline support for 3 weeks.',
                  outcome: 'Discovered that integrations broke silently, frustrating enterprise users.',
                  keyTakeaway: 'Always address product retention leaks before pouring money into acquisition.'
                },
                {
                  title: 'Act 2: The RICE Prioritization',
                  situation: 'Engineers wanted AI features, while sales wanted custom integrations.',
                  decision: 'Applied the RICE framework (Reach, Impact, Confidence, Effort) to allocate sprint capacity.',
                  outcome: 'Built 3 core ERP connectors. Churn dropped to 1.8%.',
                  keyTakeaway: 'Frameworks prevent emotional roadmapping and align teams on measurable enterprise value.'
                }
              ]).map((ep: any, eIdx: number) => (
                <div key={eIdx} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                    {ep.title}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="font-semibold text-slate-900 dark:text-white block mb-1">The Dilemma:</span>
                      <p className="text-slate-600 dark:text-slate-400">{ep.situation}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="font-semibold text-slate-900 dark:text-white block mb-1">Strategic Move:</span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{ep.decision}</p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/50">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-0.5">Executive Principle:</span>
                    <p className="text-emerald-900 dark:text-emerald-200">{ep.keyTakeaway}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate Visual Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Generate Interactive Visual Model</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create an interactive learning tool for any business topic or lecture slide.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic or Business Framework *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Porter's Five Forces or DCF Valuation"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Visual Mode
              </label>
              <select
                value={genMode}
                onChange={(e) => setGenMode(e.target.value as VisualMode)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              >
                <option value="flowchart">Interactive Flowchart</option>
                <option value="concept_map">Concept Map</option>
                <option value="animated_explanation">Animated Equilibrium / Dynamics</option>
                <option value="simulation">Business Simulation</option>
                <option value="comparison">Visual Comparison</option>
                <option value="storytelling">Executive Case Analysis</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating || !genTopic.trim()}
                onClick={handleGenerate}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 transition"
              >
                {isGenerating ? 'Designing...' : 'Generate Visual'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VisualStudioSection;
