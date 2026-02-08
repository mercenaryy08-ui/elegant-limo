import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { getBookings } from '../../lib/bookings-store';
import { getVehicleName, type AdminBooking } from '../../lib/ops-api';

type ViewMode = 'month' | 'week' | 'day' | 'list';

function BookingDot({ booking }: { booking: AdminBooking }) {
  const statusColor: Record<string, string> = {
    confirmed: 'bg-green-500',
    pending: 'bg-yellow-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-400',
  };
  return (
    <div
      className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight truncate ${statusColor[booking.status] ?? 'bg-gray-400'} text-white`}
      title={`${booking.time} ${booking.from} → ${booking.to} (${booking.bookingReference})`}
    >
      <span className="font-medium">{booking.time}</span>
      <span className="truncate">{booking.bookingReference}</span>
    </div>
  );
}

function BookingCard({ booking }: { booking: AdminBooking }) {
  const statusColor: Record<string, string> = {
    confirmed: 'border-green-500 bg-green-50',
    pending: 'border-yellow-500 bg-yellow-50',
    completed: 'border-blue-500 bg-blue-50',
    cancelled: 'border-red-400 bg-red-50',
  };
  return (
    <div className={`border-l-4 rounded-lg p-3 ${statusColor[booking.status] ?? 'border-gray-400 bg-gray-50'}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-mono font-semibold text-sm text-[#d4af37]">{booking.bookingReference}</span>
        <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-[10px]">
          {booking.status}
        </Badge>
      </div>
      <div className="text-xs space-y-0.5 text-muted-foreground">
        <p><strong>{booking.time}</strong> · {getVehicleName(booking.vehicleId)} · {booking.passengers} pax</p>
        <p className="truncate">{booking.from} → {booking.to}</p>
        <p>{booking.customerDetails.firstName} {booking.customerDetails.lastName} · {booking.totalPrice.toFixed(2)} CHF</p>
      </div>
    </div>
  );
}

export function OpsCalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [allBookings, setAllBookings] = useState<AdminBooking[]>([]);

  // Reload bookings when view/date changes
  useEffect(() => {
    setAllBookings(getBookings());
  }, [current, view]);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const startPad = startOfWeek(monthStart);
  const endPad = endOfWeek(monthEnd);
  const allDays = eachDayOfInterval({ start: startPad, end: endPad });

  const weekStart = startOfWeek(current);
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(current) });

  const bookingsForDay = (day: Date): AdminBooking[] => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return allBookings.filter((b) => b.date === dateStr && b.status !== 'cancelled');
  };

  const navigate = (dir: 1 | -1) => {
    if (view === 'month') setCurrent(dir === 1 ? addMonths(current, 1) : subMonths(current, 1));
    if (view === 'week') setCurrent(dir === 1 ? addWeeks(current, 1) : subWeeks(current, 1));
    if (view === 'day') setCurrent(dir === 1 ? addDays(current, 1) : subDays(current, 1));
  };

  const headerLabel = () => {
    if (view === 'month') return format(current, 'MMMM yyyy');
    if (view === 'week') return `Week of ${format(weekStart, 'MMM d, yyyy')}`;
    if (view === 'day') return format(current, 'PPPP');
    return 'All Bookings';
  };

  // List view: all upcoming bookings sorted by date+time
  const listBookings = [...allBookings]
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium min-w-[220px] text-center">{headerLabel()}</span>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrent(new Date())}>
          Today
        </Button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-[#d4af37]/30 text-center">
          <p className="text-2xl font-bold text-[#d4af37]">{allBookings.length}</p>
          <p className="text-xs text-muted-foreground">Total Bookings</p>
        </Card>
        <Card className="p-4 border-green-500/30 text-center">
          <p className="text-2xl font-bold text-green-600">{allBookings.filter((b) => b.status === 'confirmed').length}</p>
          <p className="text-xs text-muted-foreground">Confirmed</p>
        </Card>
        <Card className="p-4 border-yellow-500/30 text-center">
          <p className="text-2xl font-bold text-yellow-600">{allBookings.filter((b) => b.status === 'pending').length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-4 border-red-400/30 text-center">
          <p className="text-2xl font-bold text-red-500">{allBookings.filter((b) => b.status === 'cancelled').length}</p>
          <p className="text-xs text-muted-foreground">Cancelled</p>
        </Card>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <Card className="border-[#d4af37]/30 overflow-hidden">
          <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground border-b border-[#d4af37]/20">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr" style={{ minHeight: 420 }}>
            {allDays.map((day) => {
              const dayBookings = bookingsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-1.5 border-b border-r border-[#d4af37]/10 text-sm min-h-[80px] cursor-pointer hover:bg-[#f4e4b7]/10 transition ${
                    !isSameMonth(day, current) ? 'bg-muted/30 text-muted-foreground' : ''
                  } ${isSameDay(day, new Date()) ? 'bg-[#f4e4b7]/20 ring-1 ring-[#d4af37]/40' : ''}`}
                  onClick={() => { setCurrent(day); setView('day'); }}
                >
                  <span className={`text-xs font-medium ${isSameDay(day, new Date()) ? 'text-[#d4af37] font-bold' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <BookingDot key={b.id} booking={b} />
                    ))}
                    {dayBookings.length > 3 && (
                      <p className="text-[10px] text-muted-foreground pl-1">+{dayBookings.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week View */}
      {view === 'week' && (
        <Card className="border-[#d4af37]/30 overflow-hidden">
          <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground border-b border-[#d4af37]/20">
            {weekDays.map((d) => (
              <div key={d.toISOString()} className={`p-2 ${isSameDay(d, new Date()) ? 'text-[#d4af37] font-bold' : ''}`}>
                {format(d, 'EEE d')}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7" style={{ minHeight: 300 }}>
            {weekDays.map((day) => {
              const dayBookings = bookingsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 border-r border-[#d4af37]/10 min-h-[200px] ${
                    isSameDay(day, new Date()) ? 'bg-[#f4e4b7]/10' : ''
                  }`}
                >
                  {dayBookings.length === 0 ? (
                    <p className="text-xs text-muted-foreground mt-4 text-center">No bookings</p>
                  ) : (
                    <div className="space-y-2">
                      {dayBookings.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Day View */}
      {view === 'day' && (
        <Card className="border-[#d4af37]/30 p-6">
          <h3 className="text-lg font-semibold mb-4">{format(current, 'PPPP')}</h3>
          {(() => {
            const dayBookings = bookingsForDay(current);
            if (dayBookings.length === 0) {
              return <p className="text-muted-foreground text-sm py-8 text-center">No bookings for this day.</p>;
            }
            return (
              <div className="space-y-3">
                {dayBookings
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
              </div>
            );
          })()}
        </Card>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card className="border-[#d4af37]/30 p-6">
          <h3 className="text-lg font-semibold mb-4">All Bookings ({listBookings.length})</h3>
          {listBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {listBookings.map((b) => (
                <div key={b.id} className="flex items-start gap-3">
                  <div className="text-xs text-muted-foreground min-w-[80px] pt-1">
                    {format(new Date(b.date), 'MMM d')}
                  </div>
                  <div className="flex-1">
                    <BookingCard booking={b} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
