import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Student, MarkEntry, Exam } from '../../types';
import {
  calculateStudentThreeTermsProgress,
  StudentThreeTermsProgress
} from '../../utils/academicProgress';

interface AcademicProgressChartProps {
  student: Student | null | undefined;
  marks?: MarkEntry[];
  exams?: Exam[];
  academicYear?: string;
  className?: string;
  compact?: boolean;
  showCardWrapper?: boolean;
  title?: string;
}

export const AcademicProgressChart: React.FC<AcademicProgressChartProps> = ({
  student,
  marks = [],
  exams = [],
  academicYear = '2025/2026',
  className = '',
  compact = false,
  showCardWrapper = true,
  title = 'Academic Performance & 3-Term Growth'
}) => {
  const [viewMode, setViewMode] = useState<'term-overview' | 'subject-comparison'>('term-overview');

  const progressData: StudentThreeTermsProgress | null = calculateStudentThreeTermsProgress(
    student,
    marks,
    exams,
    academicYear
  );

  if (!student || !progressData) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
        No academic record available to render 3-term progress.
      </div>
    );
  }

  const isGrowthPositive = progressData.progressDelta >= 0;

  // Custom Tooltip for Term Overview
  const CustomTermTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-emerald-950 text-white p-3 rounded-xl shadow-xl border border-amber-400/40 text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-amber-300 border-b border-white/20 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">{data.academicYear}</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Student Score:
            </span>
            <span className="font-extrabold text-white font-mono text-sm">{data.studentAverage}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Class Average:
            </span>
            <span className="font-semibold text-amber-200 font-mono">{data.classAverage}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Class Position:</span>
            <span className="font-bold text-emerald-300">{data.position}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-white/10 text-[11px]">
            <span>Grade & Standing:</span>
            <span className="font-bold text-amber-300">{data.grade} ({data.gpaOrStanding})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Subject Comparison
  const CustomSubjectTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 min-w-[200px]">
          <div className="font-bold text-amber-300 border-b border-slate-700 pb-1">
            {data.subject}
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-emerald-400">Term 1:</span>
            <span className="font-mono font-bold">{data['Term 1']}%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-amber-400">Term 2:</span>
            <span className="font-mono font-bold">{data['Term 2']}%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-teal-300">Term 3:</span>
            <span className="font-mono font-bold">{data['Term 3']}%</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-700 font-semibold">
            <span>Overall Trajectory:</span>
            <span className={data.growth >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
              {data.growth >= 0 ? `+${data.growth}%` : `${data.growth}%`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const content = (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-['Outfit'] flex items-center gap-2">
              {title}
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                3-Term Cycle
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Comparative terminal assessment trajectory for {progressData.studentName} ({progressData.academicYear})
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('term-overview')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'term-overview'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Term Overview
          </button>
          <button
            type="button"
            onClick={() => setViewMode('subject-comparison')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'subject-comparison'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Subject Trajectory
          </button>
        </div>
      </div>

      {/* Summary Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">3-Term Cumulative Avg</span>
          <span className="text-lg font-black text-emerald-950 font-mono font-['Outfit']">
            {progressData.overallThreeTermAverage}%
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Year Growth Delta</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isGrowthPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span
              className={`text-base font-black font-mono ${
                isGrowthPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isGrowthPositive ? `+${progressData.progressDelta}%` : `${progressData.progressDelta}%`}
            </span>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Peak Term Score</span>
          <span className="text-base font-black text-amber-950 font-mono">
            {progressData.bestTermScore}% <span className="text-[10px] font-semibold text-amber-700 font-sans">({progressData.bestTerm})</span>
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Strongest Subject</span>
          <span className="text-xs font-bold text-slate-900 truncate block mt-0.5" title={progressData.strongestSubject}>
            {progressData.strongestSubject}
          </span>
          <span className="text-[10px] font-mono text-emerald-700 font-semibold block">
            Avg: {progressData.strongestSubjectAverage}%
          </span>
        </div>
      </div>

      {/* Main Recharts Bar Chart */}
      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-2xs">
        {viewMode === 'term-overview' ? (
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1">
              <span className="font-semibold text-slate-700">Terminal Score vs Class Average (%)</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Benchmark: 70% Pass Standard
              </span>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressData.termData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="term"
                    tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTermTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Pass standard (70%)',
                      fill: '#059669',
                      fontSize: 10,
                      position: 'top'
                    }}
                  />
                  <Bar
                    name="Student Average (%)"
                    dataKey="studentAverage"
                    fill="#047857"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  >
                    {progressData.termData.map((entry, index) => (
                      <Cell
                        key={`cell-std-${index}`}
                        fill={index === 2 ? '#065f46' : index === 1 ? '#047857' : '#059669'}
                      />
                    ))}
                  </Bar>
                  <Bar
                    name="Class Average (%)"
                    dataKey="classAverage"
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1">
              <span className="font-semibold text-slate-700">Subject Scores across Term 1, Term 2 & Term 3 (%)</span>
              <span className="text-slate-400">Core Academic Pillars</span>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressData.subjectComparisons}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fill: '#334155', fontSize: 10.5, fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomSubjectTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
                    iconType="circle"
                  />
                  <Bar
                    name="Term 1"
                    dataKey="Term 1"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    name="Term 2"
                    dataKey="Term 2"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    name="Term 3"
                    dataKey="Term 3"
                    fill="#047857"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Breakdown Pill Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {progressData.termData.map((t, idx) => (
          <div
            key={t.term}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-extrabold text-emerald-950 block">{t.term}</span>
              <span className="text-[11px] text-slate-500 font-medium">Rank: {t.position}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-emerald-900 font-mono block">{t.studentAverage}%</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block">
                {t.grade} ({t.gpaOrStanding})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return content;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      {content}
    </div>
  );
};
