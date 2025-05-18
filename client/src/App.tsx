import { useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import MobileContainer from "./components/MobileContainer";
import StatusBar from "./components/StatusBar";
import AppHeader from "./components/AppHeader";
import NavBar from "./components/NavBar";
import MiniPlayer from "./components/MiniPlayer";
import FullPlayer from "./components/FullPlayer";
import SharingModal from "./components/SharingModal";
import Notification from "./components/Notification";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Bluetooth from "./pages/Bluetooth";
import Equalizer from "./pages/Equalizer";
import GroupSession from "./pages/GroupSession";
import NotFound from "./pages/not-found";
import { useTheme } from "./context/ThemeContext";
import { usePlayer } from "./context/PlayerContext";

export default function App() {
  const { theme } = useTheme();
  const { 
    isPlayerExpanded, setIsPlayerExpanded,
    isPlaying, currentTrack
  } = usePlayer();
  const [activeScreen, setActiveScreen] = useState("home");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    icon: string;
    visible: boolean;
  } | null>(null);

  // Show notification example
  const showNotification = (title: string, message: string, icon = "bluetooth") => {
    setNotification({
      title,
      message,
      icon,
      visible: true
    });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setNotification(null), 300);
    }, 3000);
  };

  useEffect(() => {
    // Example notification on app load
    const timer = setTimeout(() => {
      showNotification(
        "Novo dispositivo encontrado",
        "Amanda's Phone está disponível para conexão"
      );
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCloseApp = () => {
    // In a real FiveM environment, this would trigger an NUI callback
    console.log("Close app requested");
    // window.parent.postMessage({ action: "closeApp" }, "*");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className={`min-h-screen w-full flex items-center justify-center p-4 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
          <MobileContainer theme={theme}>
            <StatusBar />
            
            <div className="main-content h-[calc(100%-7rem)] overflow-y-auto pb-16">
              <AppHeader onClose={handleCloseApp} />
              
              <div className="screens relative h-full">
                <Switch>
                  <Route path="/" component={() => {
                    setActiveScreen("home");
                    return <Home />
                  }} />
                  <Route path="/search" component={() => {
                    setActiveScreen("search");
                    return <Search />
                  }} />
                  <Route path="/bluetooth" component={() => {
                    setActiveScreen("bluetooth");
                    return <Bluetooth />
                  }} />
                  <Route path="/equalizer" component={() => {
                    setActiveScreen("equalizer");
                    return <Equalizer />
                  }} />
                  <Route path="/group-session" component={() => {
                    setActiveScreen("group");
                    return <GroupSession />
                  }} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            </div>
            
            {currentTrack && (
              <>
                <div className="fixed-bottom-elements w-full absolute bottom-0 left-0 bg-tokyo-darkElevated overflow-hidden rounded-b-[32px]">
                  <MiniPlayer 
                    onExpand={() => setIsPlayerExpanded(true)}
                  />
                  <NavBar activeScreen={activeScreen} />
                </div>
                
                <FullPlayer 
                  isExpanded={isPlayerExpanded}
                  onMinimize={() => setIsPlayerExpanded(false)}
                  onShareClick={() => setIsShareModalOpen(true)}
                />
              </>
            )}
            
            <SharingModal 
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              showNotification={showNotification}
            />
            
            {notification && (
              <Notification
                title={notification.title}
                message={notification.message}
                icon={notification.icon}
                visible={notification.visible}
              />
            )}
          </MobileContainer>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
