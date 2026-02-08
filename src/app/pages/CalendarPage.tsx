import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';

export function CalendarPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Calendar className="w-16 h-16 text-[#d4af37] mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-bold text-[#0a0a0a] mb-2">Calendar</h1>
        <p className="text-muted-foreground mb-6">
          Public calendar view and ICS feed are available from the ops dashboard.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-[#d4af37] hover:bg-[#b8941f] text-white"
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
