import React, { useState, forwardRef } from 'react';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  isProcessing: boolean;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(({ onUpload, isProcessing }, ref) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={`relative p-8 rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer group focus-within:ring-4 focus-within:ring-[#86BC25]/50 focus-within:border-[#86BC25]
        ${dragActive 
          ? "border-[#86BC25] bg-green-50 dark:bg-green-900/20" 
          : "border-gray-300 dark:border-gray-700 hover:border-[#86BC25] dark:hover:border-[#86BC25] bg-white dark:bg-black"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      role="button"
      aria-label="Upload receipts drag and drop area"
      tabIndex={0}
      onKeyDown={(e) => {
        // Allow triggering via Enter/Space if focused on div
        if (e.key === 'Enter' || e.key === ' ') {
            // Logic handled by label click usually, but input is absolute covering. 
            // Since input handles events, we ensure it's keyboard accessible via default behavior.
            // The focus-within ensures visual cue.
        }
      }}
    >
      <input
        ref={ref}
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*,application/pdf"
        multiple
        disabled={isProcessing}
        aria-label="Upload files input"
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center animate-pulse" aria-live="polite">
          <div className="w-12 h-12 rounded-full border-4 border-[#86BC25]/30 border-t-[#86BC25] animate-spin mb-4"></div>
          <p className="text-sm font-medium text-[#86BC25]">Analyzing travel receipts...</p>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-500 group-hover:text-[#86BC25] transition-colors" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Upload Travel Receipts</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            Drag & drop Uber, Ola, Rapido, Cityflo, or generic travel invoices here.
          </p>
          <p className="sr-only">Or press Alt + U to focus this area.</p>
        </>
      )}
    </div>
  );
});

FileUpload.displayName = "FileUpload";