'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.className = savedTheme;
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {isDark ? (
        <>
          <SunIcon className="w-4 h-4" />
          Light Mode
        </>
      ) : (
        <>
          <MoonIcon className="w-4 h-4" />
          Dark Mode
        </>
      )}
    </Button>
  );
}