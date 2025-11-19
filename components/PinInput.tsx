'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface PinInputProps {
  onSubmit: (pin: string) => Promise<void>;
  onCancel: () => void;
}

export default function PinInput({ onSubmit, onCancel }: PinInputProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Enter Twitter PIN</h2>
      <p className="text-gray-600 mb-4">
        Please enter the PIN shown on the Twitter website to complete authentication.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          required
          pattern="[0-9]+"
          maxLength={7}
          className="text-center text-lg"
        />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !pin}>
            {loading ? 'Verifying...' : 'Verify PIN'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 