import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
  theme: "dark" | "light";
}

export default function MobileContainer({ children, theme }: MobileContainerProps) {
  return (
    <div
      id="tokyo-box-app"
      data-theme={theme}
      className="relative w-full max-w-md mx-auto font-sans antialiased text-white"
    >
      <div className={`phone-container relative w-full h-[750px] mx-auto overflow-hidden rounded-[40px] shadow-2xl border-8 ${
        theme === "dark" 
          ? "border-tokyo-darkHighlight bg-tokyo-dark" 
          : "border-gray-200 bg-tokyo-light text-black"
      }`}>
        {children}
      </div>
    </div>
  );
}
