import { Outlet } from 'react-router-dom';
import { isOpsAuthenticated } from '../../lib/ops-auth';
import { OpsLoginPage } from './OpsLoginPage';

/**
 * Wraps ops routes. If a password is set (VITE_OPS_PASSWORD) and the user
 * isn’t logged in, shows the login page; otherwise renders the dashboard.
 */
export function OpsGate() {
  if (!isOpsAuthenticated()) {
    return <OpsLoginPage />;
  }
  return <Outlet />;
}
