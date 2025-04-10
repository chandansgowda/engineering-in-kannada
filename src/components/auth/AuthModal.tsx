import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PasswordResetForm } from './PasswordResetForm';

type AuthView = 'login' | 'signup' | 'reset-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  if (!isOpen) return null;

  // Use createPortal to render the modal at the root level of the DOM
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-auto bg-dark border border-gray-700 rounded-lg p-6 shadow-2xl"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="mt-4">
          {currentView === 'login' && (
            <LoginForm
              onSuccess={onClose}
              onSignUpClick={() => setCurrentView('signup')}
              onForgotPasswordClick={() => setCurrentView('reset-password')}
            />
          )}

          {currentView === 'signup' && (
            <SignupForm
              onSuccess={() => setCurrentView('login')}
              onLoginClick={() => setCurrentView('login')}
            />
          )}

          {currentView === 'reset-password' && (
            <PasswordResetForm
              onBackToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
