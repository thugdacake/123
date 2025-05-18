import { Home, Search, Bluetooth, Sliders } from "lucide-react";
import { useLocation } from "wouter";

interface NavBarProps {
  activeScreen: string;
}

export default function NavBar({ activeScreen }: NavBarProps) {
  const [, setLocation] = useLocation();
  
  const navItems = [
    { id: "home", icon: Home, label: "Início", path: "/" },
    { id: "search", icon: Search, label: "Buscar", path: "/search" },
    { id: "bluetooth", icon: Bluetooth, label: "Bluetooth", path: "/bluetooth" },
    { id: "equalizer", icon: Sliders, label: "Equalizer", path: "/equalizer" }
  ];
  
  return (
    <nav className="nav-bar flex justify-around items-center h-14 px-4">
      {navItems.map((item) => (
        <button 
          key={item.id}
          className={`nav-item flex flex-col items-center ${
            activeScreen === item.id ? "text-tokyo-pink" : "text-gray-500"
          }`}
          onClick={() => setLocation(item.path)}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
