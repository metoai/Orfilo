import React from 'react';
import { Workflow, FileText, CheckCircle2, Move, Edit3, Trash2, Clock, Sparkles } from 'lucide-react';
import { FileEvent } from '../types/index.ts';

interface ActivityViewProps {
  events: FileEvent[];
  onRefresh?: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ events }) => {
  const getEventIcon = (eventType: FileEvent['event_type'], actorType: FileEvent['actor_type']) => {
    if (actorType === 'ai_system' || eventType === 'organized') {
      return (
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
          <Workflow className="w-4 h-4" />
        </div>
      );
    }
    switch (eventType) {
      case 'saved':
      case 'imported':
        return (
          <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 border border-neutral-200/60">
            <CheckCircle2 className="w-4 h-4 text-[#19A974]" />
          </div>
        );
      case 'renamed':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
            <Edit3 className="w-4 h-4" />
          </div>
        );
      case 'moved':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
            <Move className="w-4 h-4" />
          </div>
        );
      case 'deleted':
        return (
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200/60">
            <Trash2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-200/60">
            <FileText className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatEventTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Activity Timeline</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Audit trail of AI categorization, ingestion, and file organization
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-12 text-center shadow-2xs">
          <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900">No activity recorded yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Deliverables captured via the extension or uploaded directly will appear in this timeline.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="divide-y divide-neutral-100">
            {events.map((ev) => (
              <div key={ev.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                {getEventIcon(ev.event_type, ev.actor_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900">
                        {ev.actor_type === 'ai_system' ? 'AI Ingestion Engine' : 'You'}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200/50">
                        {ev.event_type}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {formatEventTime(ev.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                    {ev.metadata.summary || `${ev.event_type} artifact`}
                  </p>

                  {ev.metadata.to_path && (
                    <div className="mt-1.5 font-mono text-[11px] text-[#19A974] bg-[#E8F7F0] px-2 py-0.5 rounded-md inline-block border border-[#19A974]/20">
                      &rarr; {ev.metadata.to_path}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
