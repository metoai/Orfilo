import React from 'react';
import { Workflow, FileText, CheckCircle2, Move, Edit3, Trash2, Clock, ShieldCheck } from 'lucide-react';
import { FileEvent } from '../types/index.ts';

interface ActivityViewProps {
  events: FileEvent[];
  onRefresh?: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ events }) => {
  const getEventIcon = (eventType: FileEvent['event_type'], actorType: FileEvent['actor_type']) => {
    if (actorType === 'ai_system' || eventType === 'organized') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Workflow className="w-4 h-4" />
        </div>
      );
    }
    switch (eventType) {
      case 'saved':
      case 'imported':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'renamed':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Edit3 className="w-4 h-4" />
          </div>
        );
      case 'moved':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Move className="w-4 h-4" />
          </div>
        );
      case 'deleted':
        return (
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#111111]">Activity</h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Audit trail of AI organization, captures, and changes across your workspace
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-[#E7E7E4] rounded-2xl p-12 text-center">
          <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#111111]">No activity recorded yet</h3>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Capture or organize an artifact to start seeing your timeline.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6">
          <div className="divide-y divide-[#E7E7E4]">
            {events.map((ev) => (
              <div key={ev.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                {getEventIcon(ev.event_type, ev.actor_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#111111]">
                        {ev.actor_type === 'ai_system' ? 'AI organized' : 'You'}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-[#6B6B6B]">
                        {ev.event_type}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8F8F8F]">
                      {formatEventTime(ev.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-[#111111] mt-1 leading-relaxed">
                    {ev.metadata.summary || `${ev.event_type} artifact`}
                  </p>

                  {ev.metadata.to_path && (
                    <div className="mt-1 font-mono text-[11px] text-[#19A974] bg-[#E8F7F0] px-2 py-0.5 rounded inline-block">
                      → {ev.metadata.to_path}
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
