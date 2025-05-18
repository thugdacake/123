import { Bluetooth, Users, Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationProps {
  title: string;
  message: string;
  icon?: string;
  visible: boolean;
}

export default function Notification({ 
  title, 
  message, 
  icon = "bell",
  visible
}: NotificationProps) {
  const [notificationClass, setNotificationClass] = useState("");
  
  useEffect(() => {
    if (visible) {
      setNotificationClass("opacity-100 translate-y-2");
    } else {
      setNotificationClass("opacity-0 -translate-y-2");
    }
  }, [visible]);
  
  const getIcon = () => {
    switch (icon) {
      case "bluetooth":
        return <Bluetooth className="w-4 h-4" />;
      case "users":
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };
  
  const getIconBgColor = () => {
    switch (icon) {
      case "bluetooth":
        return "bg-tokyo-pink";
      case "users":
        return "bg-tokyo-purple";
      default:
        return "bg-blue-500";
    }
  };
  
  return (
    <div className="notifications-container absolute top-9 left-0 right-0 flex flex-col items-center pointer-events-none">
      <div className={`notification bg-tokyo-darkElevated px-4 py-3 rounded-lg shadow-lg mb-2 flex items-center max-w-[90%] transform transition-all duration-300 ${notificationClass}`}>
        <div className={`notification-icon mr-3 w-8 h-8 rounded-full ${getIconBgColor()} flex items-center justify-center`}>
          {getIcon()}
        </div>
        <div className="notification-content">
          <div className="notification-title text-sm font-medium">{title}</div>
          <div className="notification-message text-xs text-gray-400">{message}</div>
        </div>
      </div>
    </div>
  );
}
