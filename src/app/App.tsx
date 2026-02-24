import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VehicleSelectionPage } from './pages/VehicleSelectionPage';
import { CalculatePricePage } from './pages/CalculatePricePage';
import { BookingSummaryPage } from './pages/BookingSummaryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { CalendarPage } from './pages/CalendarPage';
import { OpsGate } from './pages/ops/OpsGate';
import { OpsLayout } from './pages/ops/OpsLayout';
import { OpsBookingsPage } from './pages/ops/OpsBookingsPage';
import { OpsWorkingHoursPage } from './pages/ops/OpsWorkingHoursPage';
import { OpsCalendarPage } from './pages/ops/OpsCalendarPage';
import { Toaster } from './components/ui/sonner';
import { BookingProvider } from './contexts/BookingContext';

export default function App() {
  return (
    <BookingProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/summary" element={<BookingSummaryPage />} />
            <Route path="/select-vehicle" element={<Navigate to="/summary" replace />} />
            <Route path="/calculate-price" element={<Navigate to="/summary" replace />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/ops" element={<OpsGate />}>
              <Route element={<OpsLayout />}>
                <Route index element={<OpsBookingsPage />} />
                <Route path="working-hours" element={<OpsWorkingHoursPage />} />
                <Route path="calendar" element={<OpsCalendarPage />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </BookingProvider>
  );
}