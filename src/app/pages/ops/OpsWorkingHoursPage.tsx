import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  getClosedSlots,
  createClosedSlot,
  updateClosedSlot,
  deleteClosedSlot,
  getVehicleName,
} from '../../lib/ops-api';
import { FLEET } from '../../lib/fleet';
import type { ClosedSlot } from '../../lib/availability';
import { toast } from 'sonner';

const emptySlot = (): Omit<ClosedSlot, 'id'> => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '09:00',
  endTime: '17:00',
  reason: '',
  vehicleId: undefined,
});

export function OpsWorkingHoursPage() {
  const [slots, setSlots] = useState<ClosedSlot[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ClosedSlot, 'id'>>(emptySlot());

  const refresh = () => setSlots(getClosedSlots());

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptySlot());
    setDialogOpen(true);
  };

  const openEdit = (slot: ClosedSlot) => {
    setEditingId(slot.id);
    setForm({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason ?? '',
      vehicleId: slot.vehicleId,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      const result = updateClosedSlot(editingId, form);
      if (result.success) {
        toast.success('Block updated');
        refresh();
        setDialogOpen(false);
      } else {
        toast.error(result.error ?? 'Update failed');
      }
    } else {
      const result = createClosedSlot(form);
      if (result.success) {
        toast.success('Block added');
        refresh();
        setForm(emptySlot());
        setDialogOpen(false);
      } else {
        toast.error(result.error ?? 'Create failed');
      }
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this block?')) return;
    deleteClosedSlot(id);
    toast.success('Block removed');
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Working hours</h1>
        <Button className="bg-[#d4af37] hover:bg-[#b8941f]" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Block time
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Block dates and times when no bookings are allowed (e.g. holidays, maintenance). Blocks appear in the calendar and prevent clients from booking those slots.
      </p>

      {slots.length === 0 ? (
        <Card className="border-[#d4af37]/20 p-8 text-center text-muted-foreground">
          No blocked slots. Click “Block time” to add holidays or unavailable periods.
        </Card>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => (
            <Card key={slot.id} className="border-[#d4af37]/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  {format(new Date(slot.date), 'PPP')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  {slot.startTime} – {slot.endTime}
                </div>
                <span className="text-muted-foreground">
                  {slot.vehicleId ? getVehicleName(slot.vehicleId) : 'All vehicles'}
                </span>
                {slot.reason && (
                  <span className="text-[#0a0a0a]">{slot.reason}</span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(slot)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(slot.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#d4af37]/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit block' : 'Block time'}</DialogTitle>
            <DialogDescription>
              Block a date and time range. Leave vehicle empty to block all vehicles.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="border-[#d4af37]/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="border-[#d4af37]/30"
                />
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="border-[#d4af37]/30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vehicle (optional)</Label>
              <Select
                value={form.vehicleId ?? 'all'}
                onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v === 'all' ? undefined : v }))}
              >
                <SelectTrigger className="border-[#d4af37]/30">
                  <SelectValue placeholder="All vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All vehicles</SelectItem>
                  {FLEET.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.className})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                placeholder="e.g. Holiday, Maintenance"
                value={form.reason ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                className="border-[#d4af37]/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#d4af37] hover:bg-[#b8941f]" onClick={handleSave}>
              {editingId ? 'Update' : 'Add block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
