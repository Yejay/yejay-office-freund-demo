"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {theme === "light" ? (
          <Sun
            key="light"
            size={ICON_SIZE}
            className="text-gray-500 dark:text-neutral-400"
          />
        ) : theme === "dark" ? (
          <Moon
            key="dark"
            size={ICON_SIZE}
            className="text-gray-500 dark:text-neutral-400"
          />
        ) : (
          <Laptop
            key="system"
            size={ICON_SIZE}
            className="text-gray-500 dark:text-neutral-400"
          />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 min-w-40 bg-white shadow-md rounded-lg p-1 space-y-0.5 dark:bg-neutral-800 dark:border dark:border-neutral-700"
          style={{ top: '100%' }}
          role="menu"
          aria-orientation="vertical"
        >
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className="w-full flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
            role="menuitem"
          >
            <Sun size={ICON_SIZE} className="text-gray-500 dark:text-neutral-400" />
            <span>Light</span>
            {theme === 'light' && (
              <span className="ml-auto text-blue-600 dark:text-blue-500">✓</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className="w-full flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
            role="menuitem"
          >
            <Moon size={ICON_SIZE} className="text-gray-500 dark:text-neutral-400" />
            <span>Dark</span>
            {theme === 'dark' && (
              <span className="ml-auto text-blue-600 dark:text-blue-500">✓</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className="w-full flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
            role="menuitem"
          >
            <Laptop size={ICON_SIZE} className="text-gray-500 dark:text-neutral-400" />
            <span>System</span>
            {theme === 'system' && (
              <span className="ml-auto text-blue-600 dark:text-blue-500">✓</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export { ThemeSwitcher };