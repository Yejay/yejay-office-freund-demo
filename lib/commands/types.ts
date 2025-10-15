import { LucideIcon } from 'lucide-react';

export type CommandGroup = 'actions' | 'navigation' | 'settings' | 'ai';

export type Command = {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  keywords: string[];
  group: CommandGroup;
  action: () => void | Promise<void>;
  shortcut?: string;
};

export type CommandRegistry = Command[];
