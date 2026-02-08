import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

type ViewMode = 'month' | 'week' | 'day' | 'list';

const ICS_FEED_URL = (() => {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/api/v1/calendar/ics`;
})();

export function OpsCalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const startPad = startOfWeek(monthStart);
  const endPad = endOfWeek(monthEnd);
  const allDays = eachDayOfInterval({ start: startPad, end: endPad });

  return (
    <div className="space-y-6">
      <Card className="border-[#d4af37]/30 p-6">
        <h2 className="text-lg font-semibold mb-2 text-[#0a0a0a]">Subscribe to calendar</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Use this URL in Google Calendar, Apple Calendar, or Outlook to see bookings and blocked slots. Events update when bookings are edited or cancelled.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="text-sm bg-muted px-2 py-1 rounded break-all">{ICS_FEED_URL}</code>
          <Button
            size="sm"
            variant="outline"
            className="border-[#d4af37]"
            onClick={() => navigator.clipboard?.writeText(ICS_FEED_URL)}
          >
            Copy link
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrent(subMonths(current, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium min-w-[180px] text-center">
            {view === 'month' && format(current, 'MMMM yyyy')}
            {view === 'week' && `Week of ${format(startOfWeek(current), 'MMM d')}`}
            {view === 'day' && format(current, 'PPP')}
            {view === 'list' && 'List'}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrent(addMonths(current, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          {(['month', 'week', 'day', 'list'] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'outline'}
              size="sm"
              className={view === v ? 'bg-[#d4af37]' : ''}
              onClick={() => setView(v)}
            >
              {v === 'month' && <CalendarIcon className="w-4 h-4 mr-1" />}
              {v === 'list' && <List className="w-4 h-4 mr-1" />}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {view === 'month' && (
        <Card className="border-[#d4af37]/30 overflow-hidden">
          <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground border-b border-[#d4af37]/20">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr" style={{ minHeight: 360 }}>
            {allDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`p-2 border-b border-r border-[#d4af37]/10 text-sm ${
                  !isSameMonth(day, current) ? 'bg-muted/30 text-muted-foreground' : ''
                } ${isSameDay(day, new Date()) ? 'bg-[#f4e4b7]/20' : ''}`}
              >
                {format(day, 'd')}
                <div className="mt-1 space-y-0.5">
                  {/* In production: render booking/blocked events for this day from API */}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {view === 'week' && (
        <Card className="border-[#d4af37]/30 p-6">
          <p className="text-muted-foreground text-sm">Week view – events from API would appear here.</p>
        </Card>
      )}

      {view === 'day' && (
        <Card className="border-[#d4af37]/30 p-6">
          <p className="text-muted-foreground text-sm">Day view – events from API would appear here.</p>
        </Card>
      )}

      {view === 'list' && (
        <Card className="border-[#d4af37]/30 p-6">
          <p className="text-muted-foreground text-sm">List view – upcoming bookings and blocked slots from API would appear here.</p>
        </Card>
      )}
    </div>
  );
}
