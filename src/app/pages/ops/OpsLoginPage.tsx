import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { checkOpsPassword, setOpsAuthenticated } from '../../lib/ops-auth';
import { useNavigate, useLocation } from 'react-router-dom';

export function OpsLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('Enter the password');
      return;
    }
    if (!checkOpsPassword(password.trim())) {
      setError('Wrong password');
      return;
    }
    setOpsAuthenticated();
    const to = location.pathname && location.pathname.startsWith('/ops') ? location.pathname : '/ops';
    navigate(to, { replace: true });
    window.dispatchEvent(new Event('ops-auth'));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-[#d4af37]/30 p-6 shadow-lg">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#f4e4b7]/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-[#0a0a0a]">Ops dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter the password to continue</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ops-password">Password</Label>
            <Input
              id="ops-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#d4af37]/30 focus:border-[#d4af37]"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-[#d4af37] hover:bg-[#b8941f] text-white"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log in
          </Button>
        </form>
      </Card>
    </div>
  );
}
