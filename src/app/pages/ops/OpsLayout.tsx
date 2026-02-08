import { Outlet, NavLink } from 'react-router-dom';

export function OpsLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[#d4af37]/20 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-6">
          <span className="text-xl font-semibold text-[#0a0a0a]">Ops</span>
          <nav className="flex gap-4">
            <NavLink
              to="/ops"
              end
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-[#d4af37]' : 'text-muted-foreground hover:text-[#0a0a0a]'}`
              }
            >
              Bookings
            </NavLink>
            <NavLink
              to="/ops/working-hours"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-[#d4af37]' : 'text-muted-foreground hover:text-[#0a0a0a]'}`
              }
            >
              Working hours
            </NavLink>
            <NavLink
              to="/ops/calendar"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-[#d4af37]' : 'text-muted-foreground hover:text-[#0a0a0a]'}`
              }
            >
              Calendar
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
