import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Table,
  Send,
  RefreshCw,
  Cpu,
  BarChart2
} from 'lucide-react';
import { api } from '../../services/api';
import { MLMetricsResponse, MLPredictResponse } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const MLModelInspector: React.FC = () => {
  const [metrics, setMetrics] = useState<MLMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live Test Sandbox
  const [testText, setTestText] = useState('Air conditioning is blowing hot air on the 3rd floor');
  const [prediction, setPrediction] = useState<MLPredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const data = await api.getMLMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load ML metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    handlePredict();
  }, []);

  const handlePredict = async () => {
    if (!testText.trim()) return;
    setIsPredicting(true);
    try {
      const res = await api.predictDepartment(testText);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const departments = ['Accounts', 'HR', 'IT Support', 'Maintenance', 'Technical'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
            Machine Learning Pipeline
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Scikit-Learn TF-IDF + Logistic Regression
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Ticket Classification Model Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Genuine, verified evaluation metrics evaluated on a 20% holdout test dataset with 600 synthetic enterprise tickets.
        </p>
      </div>

      {/* Metrics High-Level Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Accuracy
          </span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '...'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">120 holdout test samples</span>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Macro Precision
          </span>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {metrics ? `${(metrics.macro_precision * 100).toFixed(1)}%` : '...'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Average across 5 classes</span>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Macro Recall
          </span>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {metrics ? `${(metrics.macro_recall * 100).toFixed(1)}%` : '...'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">True positive sensitivity</span>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Weighted F1-Score
          </span>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {metrics ? `${(metrics.weighted_f1 * 100).toFixed(1)}%` : '...'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Balanced harmonic mean</span>
        </Card>
      </div>

      {/* Live Interactive Prediction Sandbox */}
      <Card className="p-5 space-y-4 border-2 border-blue-500/20">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Live Inference Sandbox
              </h3>
              <p className="text-xs text-slate-400">
                Test the Scikit-learn model with real-time text input
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            Realtime REST Endpoint
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testText}
            onChange={e => setTestText(e.target.value)}
            placeholder="Type sample issue..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handlePredict}
            isLoading={isPredicting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Predict Routing
          </Button>
        </div>

        {prediction && (
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
              <div>
                <span>Predicted Target: </span>
                <strong className="text-sm font-black">{prediction.department}</strong>
              </div>
              <div>
                <span>Confidence Score: </span>
                <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {prediction.confidence_percentage}%
                </strong>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Class Probability Distribution
              </span>
              {prediction.ranked_departments.map(rank => (
                <div key={rank.department} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {rank.department}
                    </span>
                    <span className="font-mono text-slate-500">
                      {(rank.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${rank.confidence * 100}%` }}
                      className={`h-full rounded-full ${
                        rank.department === prediction.department
                          ? 'bg-blue-600'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Classification Report & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Report Table */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Per-Department Classification Report
            </h3>
            <span className="text-[11px] text-slate-400">Holdout 20% split</span>
          </div>

          {metrics?.classification_report ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1-Score</th>
                    <th className="py-2.5 px-3 text-right">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departments.map(dept => {
                    const row = metrics.classification_report[dept];
                    if (!row) return null;
                    return (
                      <tr key={dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {dept}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                          {(row.precision * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">
                          {(row.recall * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {(row['f1-score'] * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {row.support}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">Loading metrics...</div>
          )}
        </Card>

        {/* 5x5 Confusion Matrix */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              5x5 Confusion Matrix
            </h3>
            <span className="text-[11px] text-slate-400">Actual vs Predicted</span>
          </div>

          {metrics?.confusion_matrix ? (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                    <th className="py-2 px-2 text-left">Actual \ Pred</th>
                    {departments.map(d => (
                      <th key={d} className="py-2 px-2" title={d}>
                        {d.substring(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {metrics.confusion_matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-2 text-left font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        {departments[i]}
                      </td>
                      {row.map((val, j) => {
                        const isDiagonal = i === j;
                        return (
                          <td
                            key={j}
                            className={`py-2.5 px-2 font-mono font-bold ${
                              isDiagonal
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : val > 0
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">Loading matrix...</div>
          )}
        </Card>
      </div>
    </div>
  );
};
