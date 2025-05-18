import { X } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

interface AppHeaderProps {
  onClose: () => void;
}

export default function AppHeader({ onClose }: AppHeaderProps) {
  return (
    <header className="app-header flex justify-between items-center px-5 py-4 sticky top-0 bg-tokyo-dark z-10 dark:bg-tokyo-dark light:bg-tokyo-light">
      <div className="logo flex items-center">
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 100 100" 
          className="w-8 h-8 mr-2 rounded-md"
        >
          <rect width="100" height="100" rx="8" fill="hsl(336, 100%, 65%)" />
          <path d="M30 30h40v40h-10v-30h-30z" fill="white" />
          <path d="M30 50h20v20h-20z" fill="white" />
        </svg>
        <h1 className="font-heading font-bold text-xl text-tokyo-pink">Tokyo Box</h1>
      </div>
      <div className="header-actions flex items-center space-x-2">
        <ThemeToggle />
        <button 
          id="close-app" 
          className="btn-icon w-9 h-9 rounded-full flex items-center justify-center bg-tokyo-darkHighlight hover:bg-opacity-80"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
