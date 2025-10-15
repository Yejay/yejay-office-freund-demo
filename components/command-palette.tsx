'use client';

/**
 * Command Palette - Preline Pro Implementation
 *
 * A modern command palette with fuzzy search and keyboard shortcuts.
 * Based on Preline Pro's modal design with dynamic content.
 *
 * Features:
 * - cmd+k / ctrl+k to open
 * - Fuzzy search with Fuse.js
 * - Keyboard navigation (arrows, enter, escape)
 * - Grouped commands (Actions, Navigation, Settings, AI)
 * - Future-ready for "Nelli" AI assistant
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Type declaration for Preline's HSOverlay
interface HSOverlayAPI {
  open: (selector: string) => void;
  close: (selector: string) => void;
}

declare global {
  interface Window {
    HSOverlay?: HSOverlayAPI;
  }
}
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useClerk } from '@clerk/nextjs';
import Fuse from 'fuse.js';
import { commandRegistry } from '@/lib/commands/registry';
import type { Command } from '@/lib/commands/types';

interface CommandPaletteProps {
  onCreateInvoice?: () => void;
  onExportInvoices?: () => void;
}

export function CommandPalette({
  onCreateInvoice,
  onExportInvoices
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commandRegistry);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { signOut, openUserProfile } = useClerk();

  // Initialize Fuse.js for fuzzy search
  const fuse = useRef(new Fuse(commandRegistry, {
    keys: ['label', 'keywords', 'description'],
    threshold: 0.3,
    includeScore: true,
  }));

  // Execute command
  const executeCommand = useCallback(async (command: Command) => {
    try {
      // Handle commands that need props or special logic
      switch (command.id) {
        case 'new-invoice':
          if (onCreateInvoice) {
            onCreateInvoice();
          } else {
            // Fallback: route hint to create flow on dashboard
            router.push('/dashboard?new=invoice');
          }
          break;
        case 'export-invoices':
          if (onExportInvoices) {
            onExportInvoices();
          } else {
            // Fallback: basic CSV export placeholder
            alert('Export coming soon. Hook up onExportInvoices to enable CSV download.');
          }
          break;
        case 'goto-dashboard':
          router.push('/dashboard');
          break;
        case 'goto-billing':
          router.push('/billing');
          break;
        case 'view-profile':
          if (openUserProfile) {
            openUserProfile();
          } else {
            router.push('/');
          }
          break;
        case 'toggle-theme':
          setTheme(theme === 'dark' ? 'light' : 'dark');
          break;
        case 'sign-out':
          await signOut();
          router.push('/');
          break;
        case 'ask-nelli':
          alert('Nelli AI Assistant\n\nComing soon! 🤖\n\nNelli will help you manage invoices, answer questions, and automate tasks.');
          break;
        default:
          // Execute the command's action
          await command.action();
      }
    } catch (error) {
      console.error('Error executing command:', error);
    } finally {
      // Close modal and reset
      if (typeof window !== 'undefined' && window.HSOverlay) {
        window.HSOverlay.close('#hs-pro-dnsm');
      }
      setSearchQuery('');
    }
  }, [onCreateInvoice, onExportInvoices, router, theme, setTheme, signOut, openUserProfile]);

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCommands(commandRegistry);
      setSelectedIndex(0);
      return;
    }

    const results = fuse.current.search(searchQuery);
    setFilteredCommands(results.map(r => r.item));
    setSelectedIndex(0);
  }, [searchQuery]);

  // Global keyboard shortcut (cmd+k / ctrl+k)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        // Use Preline's HSOverlay API to open modal
        if (typeof window !== 'undefined' && window.HSOverlay) {
          window.HSOverlay.open('#hs-pro-dnsm');

          // Focus input after modal animation
          setTimeout(() => inputRef.current?.focus(), 150);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard navigation (arrow keys, enter, escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if modal is open
      const modal = document.getElementById('hs-pro-dnsm');
      if (!modal || !modal.classList.contains('open')) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (typeof window !== 'undefined' && window.HSOverlay) {
            window.HSOverlay.close('#hs-pro-dnsm');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, executeCommand]);

  // Group commands by category
  const groupedCommands = {
    actions: filteredCommands.filter(c => c.group === 'actions'),
    navigation: filteredCommands.filter(c => c.group === 'navigation'),
    settings: filteredCommands.filter(c => c.group === 'settings'),
    ai: filteredCommands.filter(c => c.group === 'ai'),
  };

  // Calculate flat index for keyboard navigation
  const getFlatIndex = (command: Command) => {
    return filteredCommands.indexOf(command);
  };

  return (
    <div
      id="hs-pro-dnsm"
      className="hs-overlay hs-overlay-backdrop-open:backdrop-blur-md hidden size-full fixed top-0 start-0 z-[999] overflow-x-hidden overflow-y-auto pointer-events-none"
      role="dialog"
      tabIndex={-1}
      aria-label="Command Palette"
    >
      <div className="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto h-[calc(100%-56px)] min-h-[calc(100%-56px)] flex items-center">
        <div className="max-h-full relative w-full flex flex-col bg-white rounded-xl pointer-events-auto shadow-xl dark:bg-neutral-800">

          {/* Input */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
              <svg className="shrink-0 size-4 text-gray-400 dark:text-white/60" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="border-b border-gray-200 dark:border-neutral-700">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2.5 sm:py-3 ps-10 pe-8 block w-full bg-white border-transparent rounded-t-lg text-sm focus:outline-none focus:ring-0 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-400"
                placeholder="Search or type a command..."
                autoComplete="off"
              />
            </div>
          </div>
          {/* End Input */}

          {/* Body */}
          <div className="h-[500px] p-4 overflow-y-auto overflow-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">

            {/* Quick Actions Pills (show when no search) */}
            {!searchQuery && groupedCommands.actions.length > 0 && (
              <div className="pb-4 mb-4 border-b border-gray-200 dark:border-neutral-700">
                <span className="block text-xs text-gray-500 mb-2 dark:text-neutral-500">
                  Quick Actions
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {groupedCommands.actions.map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      className="inline-flex items-center gap-x-1.5 text-xs text-gray-800 bg-white border border-gray-200 hover:bg-gray-100 py-1.5 px-2.5 rounded-full focus:outline-none focus:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    >
                      <cmd.icon className="shrink-0 size-3.5" />
                      {cmd.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Group */}
            {groupedCommands.actions.length > 0 && (
              <div className="pb-4 mb-4 border-b border-gray-200 dark:border-neutral-700">
                <span className="block text-xs text-gray-500 mb-2 dark:text-neutral-500">
                  Actions
                </span>
                <ul className="-mx-2.5">
                  {groupedCommands.actions.map(cmd => (
                    <li key={cmd.id}>
                      <button
                        onClick={() => executeCommand(cmd)}
                        className={`w-full py-2 px-3 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
                          getFlatIndex(cmd) === selectedIndex ? 'bg-gray-100 dark:bg-neutral-700' : ''
                        }`}
                      >
                        <cmd.icon className="shrink-0 size-5 text-gray-600 dark:text-neutral-400" />
                        <div className="flex-1 text-left">
                          <span className="text-sm text-gray-800 dark:text-neutral-200">
                            {cmd.label}
                          </span>
                          {cmd.description && (
                            <p className="text-xs text-gray-400 dark:text-neutral-500">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <span className="text-xs text-gray-400 dark:text-neutral-500">
                            {cmd.shortcut}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation Group */}
            {groupedCommands.navigation.length > 0 && (
              <div className="pb-4 mb-4 border-b border-gray-200 dark:border-neutral-700">
                <span className="block text-xs text-gray-500 mb-2 dark:text-neutral-500">
                  Navigation
                </span>
                <ul className="-mx-2.5">
                  {groupedCommands.navigation.map(cmd => (
                    <li key={cmd.id}>
                      <button
                        onClick={() => executeCommand(cmd)}
                        className={`w-full py-2 px-3 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
                          getFlatIndex(cmd) === selectedIndex ? 'bg-gray-100 dark:bg-neutral-700' : ''
                        }`}
                      >
                        <cmd.icon className="shrink-0 size-5 text-gray-600 dark:text-neutral-400" />
                        <div className="flex-1 text-left">
                          <span className="text-sm text-gray-800 dark:text-neutral-200">
                            {cmd.label}
                          </span>
                          {cmd.description && (
                            <p className="text-xs text-gray-400 dark:text-neutral-500">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Settings Group */}
            {groupedCommands.settings.length > 0 && (
              <div className="pb-4 mb-4 border-b border-gray-200 dark:border-neutral-700">
                <span className="block text-xs text-gray-500 mb-2 dark:text-neutral-500">
                  Settings
                </span>
                <ul className="-mx-2.5">
                  {groupedCommands.settings.map(cmd => (
                    <li key={cmd.id}>
                      <button
                        onClick={() => executeCommand(cmd)}
                        className={`w-full py-2 px-3 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
                          getFlatIndex(cmd) === selectedIndex ? 'bg-gray-100 dark:bg-neutral-700' : ''
                        }`}
                      >
                        <cmd.icon className="shrink-0 size-5 text-gray-600 dark:text-neutral-400" />
                        <div className="flex-1 text-left">
                          <span className="text-sm text-gray-800 dark:text-neutral-200">
                            {cmd.label}
                          </span>
                          {cmd.description && (
                            <p className="text-xs text-gray-400 dark:text-neutral-500">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Group */}
            {groupedCommands.ai.length > 0 && (
              <div className="pb-4 mb-4 last:pb-0 last:mb-0 last:border-0 border-b border-gray-200 dark:border-neutral-700">
                <span className="block text-xs text-gray-500 mb-2 dark:text-neutral-500">
                  AI Assistant
                </span>
                <ul className="-mx-2.5">
                  {groupedCommands.ai.map(cmd => (
                    <li key={cmd.id}>
                      <button
                        onClick={() => executeCommand(cmd)}
                        className={`w-full py-2 px-3 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
                          getFlatIndex(cmd) === selectedIndex ? 'bg-gray-100 dark:bg-neutral-700' : ''
                        }`}
                      >
                        <cmd.icon className="shrink-0 size-5 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1 text-left">
                          <span className="text-sm text-gray-800 dark:text-neutral-200">
                            {cmd.label}
                          </span>
                          {cmd.description && (
                            <p className="text-xs text-gray-400 dark:text-neutral-500">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                          Soon
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty State */}
            {filteredCommands.length === 0 && searchQuery && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  No commands found for &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                  Try &quot;invoice&quot;, &quot;billing&quot;, or &quot;theme&quot;
                </p>
              </div>
            )}
          </div>
          {/* End Body */}

          {/* Footer */}
          <div className="py-3 px-4 flex flex-wrap justify-between items-center gap-2 border-t border-gray-200 dark:border-neutral-700">
            <div className="inline-flex items-center gap-x-2">
              <kbd className="size-5 flex justify-center items-center bg-white border border-gray-200 text-xs text-gray-400 shadow-sm rounded-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                Esc
              </kbd>
              <span className="text-xs text-gray-400 dark:text-neutral-500">
                to close
              </span>
            </div>

            <div className="inline-flex items-center gap-x-4">
              <div className="inline-flex items-center gap-x-1">
                <kbd className="size-5 flex justify-center items-center bg-white border border-gray-200 text-xs text-gray-400 shadow-sm rounded-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                  ⌘
                </kbd>
                <kbd className="size-5 flex justify-center items-center bg-white border border-gray-200 text-xs text-gray-400 shadow-sm rounded-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                  K
                </kbd>
                <span className="text-xs text-gray-400 dark:text-neutral-500 ml-1">
                  to open
                </span>
              </div>

              <div className="inline-flex items-center gap-x-1">
                <kbd className="px-1.5 py-0.5 flex justify-center items-center bg-white border border-gray-200 text-xs text-gray-400 shadow-sm rounded-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                  ↑↓
                </kbd>
                <span className="text-xs text-gray-400 dark:text-neutral-500 ml-1">
                  navigate
                </span>
              </div>

              <div className="inline-flex items-center gap-x-1">
                <kbd className="px-1.5 py-0.5 flex justify-center items-center bg-white border border-gray-200 text-xs text-gray-400 shadow-sm rounded-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                  ↵
                </kbd>
                <span className="text-xs text-gray-400 dark:text-neutral-500 ml-1">
                  select
                </span>
              </div>
            </div>
          </div>
          {/* End Footer */}
        </div>
      </div>
    </div>
  );
}
