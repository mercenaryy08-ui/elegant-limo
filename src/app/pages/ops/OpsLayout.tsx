import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { clearOpsAuthenticated } from '../../lib/ops-auth';

const nav = [
  { to: '/ops', end: true, label: 'Bookings', icon: LayoutDashboard },
  { to: '/ops/working-hours', end: false, label: 'Working hours', icon: Clock },
  { to: '/ops/calendar', end: false, label: 'Calendar', icon: Calendar },
];

export function OpsLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-[#d4af37]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to site
            </Button>
            <span className="text-lg font-semibold text-[#0a0a0a]">Ops dashboard</span>
          </div>
          {(() => {
            try {
              const env = (import.meta as unknown as { env: Record<string, string> }).env;
              if (env?.VITE_OPS_PASSWORD) {
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      clearOpsAuthenticated();
                      navigate('/ops', { replace: true });
                      window.dispatchEvent(new Event('ops-auth'));
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Log out
                  </Button>
                );
              }
            } catch {
              // ignore
            }
            return null;
          })()}
        </div>
        <nav className="container mx-auto px-4 flex gap-1 border-t border-[#d4af37]/10">
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#d4af37] text-[#0a0a0a] bg-[#f4e4b7]/10'
                    : 'border-transparent text-muted-foreground hover:text-[#0a0a0a] hover:bg-[#fafafa]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
