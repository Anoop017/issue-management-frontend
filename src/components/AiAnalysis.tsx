'use client';

import { useQuery } from '@tanstack/react-query';
import { analyzeIssue } from '@/lib/api';
import type { AiAnalysisResult } from '@/lib/types';
import toast from 'react-hot-toast';

interface AiAnalysisProps {
  issueId: number;
}

export default function AiAnalysis({ issueId }: AiAnalysisProps) {
  const { data, isFetching, refetch } = useQuery<AiAnalysisResult>({
    queryKey: ['ai-analysis', issueId],
    queryFn: () => analyzeIssue(issueId),
    enabled: false, // Don't fetch automatically
  });

  async function handleAnalyze() {
    try {
      await toast.promise(refetch(), {
        loading: 'Analyzing issue...',
        success: <b>Analysis complete!</b>,
        error: <b>Analysis failed.</b>,
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Formatting helpers
  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6 h-fit sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          AI Analysis
        </h3>
      </div>

      {!data && !isFetching && (
        <div className="text-center py-8">
          <p className="text-sm text-muted mb-4">
            Generate an AI-powered analysis to get potential root causes and recommended actions.
          </p>
          <button
            onClick={handleAnalyze}
            className="w-full py-2.5 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Generate Analysis
          </button>
        </div>
      )}

      {isFetching && (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-border border-t-black rounded-full animate-spin" />
        </div>
      )}

      {data && !isFetching && (
        <div className="space-y-6">
          {/* Summary */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Summary</h4>
            <p className="text-sm text-muted leading-relaxed">
              {data.summary}
            </p>
          </div>

          {/* Potential Root Causes */}
          {data.possibleCauses && data.possibleCauses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Potential Root Causes</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                {data.possibleCauses.map((cause, idx) => (
                  <li key={idx} className="text-sm text-muted">
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          {data.recommendedActions && data.recommendedActions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Recommended Actions</h4>
              <ul className="space-y-2">
                {data.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path fill="white" d="M10 14.5l-3-3 1.5-1.5 1.5 1.5 4.5-4.5 1.5 1.5-6 6z" />
                    </svg>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Assessment (Severity) */}
          {data.severity && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Risk Assessment</h4>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${severityColors[data.severity as keyof typeof severityColors] || 'bg-gray-100 text-gray-800'}`}>
                {data.severity} Risk
              </span>
              <p className="text-xs text-muted mt-2">
                Immediate investigation recommended based on severity level.
              </p>
            </div>
          )}

          {/* Regenerate Button */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={handleAnalyze}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
