import React, { useState, useEffect, useRef } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save current focus to restore later
    const previousActiveElement = document.activeElement as HTMLElement;
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Reset state when opening
    setAuthMode('login');
    setError(null);
    setSuccessMessage(null);
    setIsResetSuccess(false);
    setEmail('');
    setPassword('');

    // Focus first input on mount
    setTimeout(() => {
      if (modalRef.current) {
        const firstInput = modalRef.current.querySelector('input');
        if (firstInput) firstInput.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle ESC key
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Handle Focus Trap (Tab)
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!auth) throw new Error("Firebase configuration is missing.");
      
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        onClose();
      } else if (authMode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setIsResetSuccess(true);
        setLoading(false); 
        return; 
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      if (authMode !== 'reset') {
          setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!auth) throw new Error("Firebase configuration is missing.");
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'reset': return isResetSuccess ? 'Check your inbox' : 'Reset Password';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch (authMode) {
      case 'login': return 'Sign In';
      case 'signup': return 'Sign Up';
      case 'reset': return 'Send Reset Link';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-200 dark:border-gray-800 relative"
      >
        <h2 id="auth-modal-title" className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {getTitle()}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Success View for Reset */}
        {authMode === 'reset' && isResetSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-[#86BC25] rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
               </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
               We sent you a password change link to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
            </p>
            <button
               onClick={() => {
                   setAuthMode('login');
                   setIsResetSuccess(false);
                   setSuccessMessage(null);
               }}
               className="w-full py-2.5 bg-[#86BC25] hover:bg-[#76a821] text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC25]"
            >
               Sign In
            </button>
          </div>
        ) : (
          <>
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg border border-green-100 dark:border-green-900/30">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-[#86BC25] outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              
              {authMode !== 'reset' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                            setAuthMode('reset');
                            setError(null);
                            setSuccessMessage(null);
                        }}
                        className="text-xs text-[#86BC25] hover:underline font-medium focus:outline-none focus:text-[#76a821]"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-[#86BC25] outline-none transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#86BC25] hover:bg-[#76a821] text-white font-bold rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC25]"
              >
                {getButtonText()}
              </button>
            </form>

            {authMode !== 'reset' && (
              <>
                <div className="my-6 flex items-center justify-between">
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                  <span className="px-4 text-sm text-gray-500">or</span>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  type="button"
                  disabled={loading}
                  className="w-full py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              {authMode === 'login' && (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                        setAuthMode('signup');
                        setError(null);
                        setSuccessMessage(null);
                    }}
                    className="text-[#86BC25] font-semibold hover:underline focus:outline-none focus:text-[#76a821]"
                  >
                    Sign Up
                  </button>
                </>
              )}
              {authMode === 'signup' && (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                        setAuthMode('login');
                        setError(null);
                        setSuccessMessage(null);
                    }}
                    className="text-[#86BC25] font-semibold hover:underline focus:outline-none focus:text-[#76a821]"
                  >
                    Sign In
                  </button>
                </>
              )}
              {authMode === 'reset' && (
                <button
                  onClick={() => {
                      setAuthMode('login');
                      setError(null);
                      setSuccessMessage(null);
                  }}
                  className="text-[#86BC25] font-semibold hover:underline focus:outline-none focus:text-[#76a821]"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};