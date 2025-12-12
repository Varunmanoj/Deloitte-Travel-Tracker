import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentName: string;
  onUpdateProfile: (name: string) => Promise<void>;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  currentName,
  onUpdateProfile,
  onLogout
}) => {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync local state when prop changes and handle Accessibility
  useEffect(() => {
    if (isOpen) {
      setName(currentName || user.displayName || '');
      setImgError(false); // Reset image error state on open

      const previousActiveElement = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector('button, input');
          if (firstFocusable) (firstFocusable as HTMLElement).focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Focus Trap
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
        if (previousActiveElement) previousActiveElement.focus();
      };
    }
  }, [isOpen, currentName, user, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile(name);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-black rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 id="profile-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Account</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-8">
            {user.photoURL && !imgError ? (
              <img 
                src={user.photoURL} 
                alt={name || "User"}
                className="w-16 h-16 rounded-full border-2 border-gray-100 dark:border-gray-800 object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-16 h-16 bg-[#86BC25]/20 text-[#86BC25] rounded-full flex items-center justify-center text-2xl font-bold">
                {(name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{name || user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#86BC25] outline-none text-gray-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="text"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#86BC25] hover:bg-[#76a821] text-white font-bold rounded-lg transition-colors disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC25]"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogoutClick}
              className="w-full py-2.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};