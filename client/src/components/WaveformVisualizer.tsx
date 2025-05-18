import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  progressWidth: number;
}

export default function WaveformVisualizer({ isPlaying, progressWidth }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>([]);
  const totalBars = 40;
  
  // Generate random bar heights on load
  useEffect(() => {
    const newBars = Array.from({ length: totalBars }, () => Math.random() * 80 + 10);
    setBars(newBars);
  }, []);
  
  // Calculate which bars should be highlighted based on progress
  const highlightedBars = Math.floor((progressWidth / 100) * totalBars);
  
  return (
    <div className="waveform-container h-20 mb-4 bg-tokyo-darkHighlight rounded-lg overflow-hidden">
      <div className="waveform h-full flex items-center justify-between px-2">
        {bars.map((height, idx) => (
          <div 
            key={idx}
            className={`waveform-bar w-1 ${
              idx < highlightedBars ? "bg-tokyo-pink" : "bg-gray-700"
            } rounded-full ${isPlaying ? "animate-waveform" : ""}`}
            style={{ 
              height: `${height}%`, 
              animationDelay: `-${idx * 0.1}s`,
              animationPlayState: isPlaying ? "running" : "paused"
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
