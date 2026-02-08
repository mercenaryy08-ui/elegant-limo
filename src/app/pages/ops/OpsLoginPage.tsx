import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { checkOpsPassword, setOpsAuthenticated } from '../../lib/ops-auth';

export function OpsLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkOpsPassword(password)) {
      setOpsAuthenticated();
      navigate('/ops');
    } else {
      setError('Wrong password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">Ops login</h1>
        <div className="space-y-2">
          <Label htmlFor="ops-password">Password</Label>
          <Input
            id="ops-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="border-[#d4af37]/30"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full bg-[#d4af37] hover:bg-[#b8941f]">Continue</Button>
      </form>
    </div>
  );
}
