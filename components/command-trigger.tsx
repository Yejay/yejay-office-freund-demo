'use client';

import { Search } from 'lucide-react';

/**
 * Command Palette Trigger Button
 *
 * Displays a search input-style button in the navbar that opens the command palette.
 * Shows placeholder text and keyboard shortcut hint.
 */
export function CommandTrigger() {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.HSOverlay) {
      window.HSOverlay.open('#hs-pro-dnsm');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex items-center gap-2 px-3 py-2 w-full max-w-md rounded-lg border border-gray-200 bg-white/50 hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900 dark:border-gray-700 transition-colors"
    >
      <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      <span className="flex-1 text-left text-sm text-gray-500 dark:text-gray-400">
        Search or type a command
      </span>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
