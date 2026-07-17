import { useEffect, useState } from "react";
import { getAiAnalytics } from "../../services/analyticsService";
import { 
  TrendingUp, AlertTriangle, Briefcase, DollarSign, CheckCircle2, 
  Clock, Heart, Star, Sparkles, UserCheck 
} from "lucide-react";

export default function AiAnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAiData = async () => {
    try {
      setLoading(true);
      const res = await getAiAnalytics();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to compile AI analytics. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Running AI forecasting heuristics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400 my-4">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        <h4 className="font-bold">AI Analytics Offline</h4>
        <p className="text-xs mt-1">{error || "No data returned."}</p>
        <button 
          onClick={fetchAiData}
          className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
        >
          Retry Compilation
        </button>
      </div>
    );
  }

  const { 
    revenueForecast, projectDelayPrediction, engineerWorkload, 
    riskDetection, budgetPrediction, completionForecast, 
    heatmapGrid, projectHealthScore, customerSatisfaction, 
    aiRecommendations 
  } = data;

  const maxRevenue = Math.max(...revenueForecast.map(r => r.value), 50000);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* AI Assistant Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-indigo-950/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-400 border border-indigo-500/20 animate-pulse">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
            ConstructAI Engine Active
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Parametric forecasts are running locally on your active database. The forecasting paths are structured and ready to hook up to Google Gemini / OpenAI keys.
          </p>
        </div>
      </div>

      {/* Main Grid 1: Revenue & Delay */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Revenue Forecast Area Chart */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" /> Revenue Forecast
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Projected billing milestones for the next 6 months</p>
          </div>

          <div className="h-44 my-4 relative">
            <svg viewBox="0 0 500 160" className="h-full w-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.5, 1].map((r, idx) => (
                <line 
                  key={idx} 
                  x1="30" y1={10 + r * 110} x2="480" y2={10 + r * 110} 
                  stroke="currentColor" strokeDasharray="3 3" className="text-gray-200 dark:text-slate-800" 
                />
              ))}

              {/* Data path */}
              {(() => {
                const points = revenueForecast.map((r, idx) => ({
                  x: 35 + idx * 85,
                  y: 120 - (r.value / maxRevenue) * 100
                }));
                const d = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const fill = `${d} L ${points[points.length-1].x} 120 L 35 120 Z`;
                return (
                  <>
                    <path d={fill} fill="url(#gradientRevenue)" />
                    <path d={d} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                    {points.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="3.5" className="fill-white stroke-indigo-500 stroke-2 dark:fill-slate-900" />
                    ))}
                  </>
                );
              })()}

              {/* X Axis Labels */}
              {revenueForecast.map((r, idx) => (
                <text key={idx} x={35 + idx * 85} y="145" textAnchor="middle" className="text-[10px] fill-current text-gray-400 font-semibold">
                  {r.month}
                </text>
              ))}
            </svg>
          </div>

          <div className="mt-2 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 p-3 border border-indigo-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-spin" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">{aiRecommendations.revenue}</p>
          </div>
        </div>

        {/* Chart 2: Project Delay Predictions */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-rose-500" /> Project Delay Predictions
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Heuristic timeline risk index per project</p>
          </div>

          <div className="my-4 space-y-3">
            {projectDelayPrediction.slice(0, 4).map((p, idx) => {
              const isHigh = p.delayProbability > 50;
              const barColor = isHigh ? "bg-rose-500" : p.delayProbability > 25 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-light-text dark:text-dark-text truncate pr-4">{p.name}</span>
                    <span className={isHigh ? "text-rose-500" : "text-gray-400"}>{p.delayProbability}% Delay Prob.</span>
                  </div>
                  <div className="flex h-2.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div className={barColor} style={{ width: `${p.delayProbability}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic line-clamp-1">{p.reason}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-rose-500/5 dark:bg-rose-500/10 p-3 border border-rose-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">{aiRecommendations.delay}</p>
          </div>
        </div>
      </div>

      {/* Grid 2: Health & Workload */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Project Health Score */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <Heart className="h-4.5 w-4.5 text-rose-500 fill-current" /> Project Health Index
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Composite score based on timeline, budget & speed</p>
          </div>

          <div className="my-5 flex items-center justify-center">
            {/* SVG circle health score representation */}
            {(() => {
              const avgHealth = Math.round(projectHealthScore.reduce((sum, h) => sum + h.healthScore, 0) / projectHealthScore.length);
              const color = avgHealth >= 80 ? "stroke-emerald-500" : avgHealth >= 50 ? "stroke-amber-500" : "stroke-rose-500";
              return (
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-gray-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      className={color} 
                      strokeWidth="8" fill="transparent" 
                      strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * avgHealth) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-light-text dark:text-dark-text">{avgHealth}</span>
                    <span className="text-[9px] font-bold text-gray-400 tracking-wider">TEAM HEALTH</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 p-3 border border-indigo-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">{aiRecommendations.health}</p>
          </div>
        </div>

        {/* Engineer Workload Allocation */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <UserCheck className="h-4.5 w-4.5 text-emerald-500" /> Engineer Workload Status
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total active task slots allocated per engineer</p>
          </div>

          <div className="my-4 space-y-3">
            {engineerWorkload.slice(0, 4).map((eng, idx) => {
              const isOver = eng.activeTasksCount > 3;
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-light-text dark:text-dark-text">{eng.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">{eng.activeTasksCount} active</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                      isOver ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {isOver ? "Overload" : "Optimal"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 p-3 border border-emerald-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">{aiRecommendations.workload}</p>
          </div>
        </div>

        {/* CSAT Customer Satisfaction */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <Star className="h-4.5 w-4.5 text-amber-500 fill-current" /> Customer Satisfaction (CSAT)
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Evaluation index from customer sign-off rating</p>
          </div>

          <div className="my-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-light-text dark:text-dark-text">{customerSatisfaction.overallRating}</p>
              <div className="flex gap-0.5 justify-center mt-1 text-amber-400">
                {Array(5).fill(0).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-semibold">OVERALL SCORE</p>
            </div>

            {/* Ratings distribution bar */}
            <div className="flex-1 space-y-1">
              {Object.entries(customerSatisfaction.ratingCounts).reverse().map(([stars, count]) => {
                const total = Object.values(customerSatisfaction.ratingCounts).reduce((a,b)=>a+b, 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stars} className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
                    <span className="w-8 whitespace-nowrap">{stars} Star</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-6 text-right font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-amber-500/5 dark:bg-amber-500/10 p-3 border border-amber-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">Customer trust index is stable. Target safety compliance reviews on site touchpoints to maintain high satisfaction scores.</p>
          </div>
        </div>
      </div>

      {/* Grid 3: Risks, Budgets, Forecasts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Budget Variance Predictor */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <DollarSign className="h-4.5 w-4.5 text-indigo-500" /> Budget Predictor
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Projected budget costs vs variance margin</p>
          </div>

          <div className="my-4 space-y-3.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Total Project Allocations</span>
              <span className="font-bold text-light-text dark:text-dark-text">₹{budgetPrediction.totalBudget.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Predicted Final Output Cost</span>
              <span className="font-bold text-light-text dark:text-dark-text">₹{budgetPrediction.predictedFinalCost.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center border-t border-light-border dark:border-dark-border pt-3.5">
              <span className="text-gray-500 dark:text-gray-400">Predicted Margin Variance</span>
              <span className={`font-extrabold ${budgetPrediction.variance > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                {budgetPrediction.variance > 0 ? "+" : ""}{budgetPrediction.variance.toLocaleString("en-IN")} ({budgetPrediction.variancePercentage}%)
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 p-3 border border-indigo-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">{aiRecommendations.budget}</p>
          </div>
        </div>

        {/* Completion Forecast */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-indigo-500" /> Completion Forecast
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Backlog forecast based on historical work output speed</p>
          </div>

          <div className="my-4 space-y-3.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Pending Tasks Queue</span>
              <span className="font-bold text-light-text dark:text-dark-text">{completionForecast.totalPendingTasks} items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Estimated Project Completion</span>
              <span className="font-bold text-light-text dark:text-dark-text">~ {completionForecast.estimatedWeeks} weeks</span>
            </div>
            <div className="flex justify-between items-center border-t border-light-border dark:border-dark-border pt-3.5">
              <span className="text-gray-500 dark:text-gray-400">Predicted Delivery Threshold</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{completionForecast.predictedCompletionDate}</span>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 p-3 border border-indigo-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">{aiRecommendations.completion}</p>
          </div>
        </div>

        {/* Real-time Risk Detection Warnings */}
        <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500" /> Active Risk Detection
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI identified operational & security deficits</p>
          </div>

          <div className="my-3 space-y-2 max-h-32 overflow-y-auto pr-1">
            {riskDetection.map((risk, idx) => {
              const isHigh = risk.severity === "high";
              return (
                <div key={idx} className="p-2 border border-light-border dark:border-dark-border rounded-xl space-y-1 bg-gray-50/50 dark:bg-slate-900/35">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className={isHigh ? "text-rose-500" : "text-amber-500"}>{risk.type}</span>
                    <span className="uppercase">{risk.severity}</span>
                  </div>
                  <p className="text-[10px] font-bold text-light-text dark:text-dark-text">{risk.target}</p>
                  <p className="text-[9px] text-gray-450 line-clamp-2 leading-tight">{risk.description}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-rose-500/5 dark:bg-rose-500/10 p-3 border border-rose-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ConstructAI Recommendation
            </span>
            <p className="text-xs text-light-text dark:text-dark-text mt-1 font-medium">Verify budget allocations immediately for projects flagged with overrun parameters.</p>
          </div>
        </div>
      </div>

      {/* Heatmap Grid: Projects vs Engineers Active Load */}
      <div className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="mb-4">
          <h4 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
            <Briefcase className="h-4.5 w-4.5 text-indigo-500" /> Work Allocation Matrix Heatmap
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Task intensity matrix mapping Projects (Rows) to Engineers (Columns)</p>
        </div>

        <div className="overflow-x-auto py-2">
          <div className="min-w-[620px] grid grid-cols-6 gap-1.5 text-xs">
            {/* Headers row */}
            <div></div>
            {engineerWorkload.slice(0, 5).map((eng, idx) => (
              <div key={idx} className="font-bold text-center text-gray-400 truncate px-1">
                {eng.name}
              </div>
            ))}

            {/* Matrix row lines */}
            {(() => {
              const projNames = [...new Set(heatmapGrid.map(h => h.projectName))];
              return projNames.map((pName, rowIdx) => (
                <>
                  <div className="font-bold text-gray-500 truncate flex items-center h-8 pr-3">
                    {pName}
                  </div>
                  {Array(5).fill(0).map((_, colIdx) => {
                    const cell = heatmapGrid.find(h => h.projectIndex === rowIdx && h.engineerIndex === colIdx);
                    const count = cell ? cell.intensity : 0;
                    
                    let bgStyle = "bg-indigo-500/5 text-gray-300 dark:text-slate-750";
                    if (count > 0 && count <= 1) {
                      bgStyle = "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20";
                    } else if (count > 1 && count <= 3) {
                      bgStyle = "bg-indigo-500/50 text-indigo-100 border border-indigo-400/35";
                    } else if (count > 3) {
                      bgStyle = "bg-indigo-600 text-white font-extrabold shadow-xs";
                    }

                    return (
                      <div 
                        key={colIdx}
                        className={`h-8 rounded-lg flex items-center justify-center font-bold font-mono transition hover:scale-102 hover:ring-2 hover:ring-indigo-400 cursor-pointer ${bgStyle}`}
                        title={`${cell?.engineerName} has ${count} active tasks on ${pName}`}
                      >
                        {count}
                      </div>
                    );
                  })}
                </>
              ));
            })()}
          </div>
        </div>
      </div>

    </div>
  );
}
