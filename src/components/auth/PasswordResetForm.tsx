import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface PasswordResetFormProps {
  onBackToLogin?: () => void;
}

export function PasswordResetForm({ onBackToLogin }: PasswordResetFormProps) {
  const { resetPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    const { error } = await resetPassword(email);

    if (!error) {
      setSuccessMessage('Password reset instructions have been sent to your email');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
            {formError}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded">
            {successMessage}
          </div>
        )}

        <p className="text-gray-400 text-sm">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="your@email.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className="w-full py-2 px-4 bg-primary text-dark font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-primary hover:underline text-sm"
          >
            Back to login
          </button>
        </div>
      </form>
    </div>
  );
}
