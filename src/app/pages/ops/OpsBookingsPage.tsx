import { useState, useEffect } from 'react';
import {
  Mail,
  XCircle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  User,
  MapPin,
  Calendar,
  Clock,
  Car,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  fetchBookings,
  resendBookingConfirmation,
  declineBooking,
  confirmBooking,
  getVehicleName,
  type AdminBooking,
  type BookingStatus,
} from '../../lib/ops-api';
import { toast } from 'sonner';

const statusOptions: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    confirmed: { variant: 'default', label: 'Confirmed' },
    completed: { variant: 'outline', label: 'Completed' },
    cancelled: { variant: 'destructive', label: 'Declined' },
  };
  const c = map[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export function OpsBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [declineTarget, setDeclineTarget] = useState<AdminBooking | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchBookings(
        statusFilter === 'all' ? undefined : { status: statusFilter }
      );
      setBookings(list);
    } catch (e) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleResendEmail = async (b: AdminBooking) => {
    setActionLoading(b.id);
    try {
      await resendBookingConfirmation(b.id);
      toast.success(`Confirmation email sent to ${b.customerDetails.email}`);
    } catch {
      toast.error('Failed to resend email');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = async (b: AdminBooking) => {
    setActionLoading(b.id);
    try {
      await confirmBooking(b.id);
      toast.success('Booking confirmed');
      load();
    } catch {
      toast.error('Failed to confirm');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!declineTarget) return;
    setActionLoading(declineTarget.id);
    try {
      await declineBooking(declineTarget.id, declineReason || undefined);
      toast.success('Booking declined');
      setDeclineTarget(null);
      setDeclineReason('');
      load();
    } catch {
      toast.error('Failed to decline');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = statusFilter === 'all' ? bookings : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Bookings</h1>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as BookingStatus | 'all')}
          >
            <SelectTrigger className="w-[160px] border-[#d4af37]/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Receive and manage client bookings: confirm, resend confirmation email, or decline.
      </p>

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading…</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No bookings match the filter.</Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <Card key={b.id} className="border-[#d4af37]/20 p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-[#d4af37]">{b.bookingReference}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#d4af37]" />
                      {b.from} → {b.to}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#d4af37]" />
                      {format(new Date(b.date), 'PPP')} at {b.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#d4af37]" />
                      {getVehicleName(b.vehicleId)} · {b.passengers} pax
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#d4af37]" />
                      {b.customerDetails.firstName} {b.customerDetails.lastName} · {b.customerDetails.email}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#0a0a0a]">
                    {b.totalPrice.toFixed(2)} CHF
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {b.status === 'pending' && (
                    <Button
                      size="sm"
                      className="bg-[#d4af37] hover:bg-[#b8941f]"
                      onClick={() => handleConfirm(b)}
                      disabled={actionLoading !== null}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                  )}
                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#d4af37] text-[#d4af37]"
                      onClick={() => handleResendEmail(b)}
                      disabled={actionLoading !== null}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {actionLoading === b.id ? 'Sending…' : 'Resend email'}
                    </Button>
                  )}
                  {b.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => setDeclineTarget(b)}
                      disabled={actionLoading !== null}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!declineTarget} onOpenChange={(open) => !open && setDeclineTarget(null)}>
        <DialogContent className="border-[#d4af37]/30">
          <DialogHeader>
            <DialogTitle>Decline booking</DialogTitle>
            <DialogDescription>
              {declineTarget && (
                <>Cancel booking {declineTarget.bookingReference}? The customer can be notified by email.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (optional, for internal use or email)</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. No availability for this time"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={actionLoading !== null}
            >
              {actionLoading ? 'Declining…' : 'Decline booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
