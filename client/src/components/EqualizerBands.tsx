import { useEffect, useState } from "react";
import { useEqualizer } from "@/hooks/useEqualizer";

interface EqualizerBand {
  freq: string;
  value: number;
  display: string;
}

export default function EqualizerBands() {
  const { bands, updateBand } = useEqualizer();
  const [bandControls, setBandControls] = useState<EqualizerBand[]>([]);
  
  useEffect(() => {
    const controls = bands.map(band => {
      let displayValue;
      if (band.value > 0) {
        displayValue = `+${band.value} dB`;
      } else if (band.value < 0) {
        displayValue = `${band.value} dB`;
      } else {
        displayValue = "0 dB";
      }
      
      return {
        freq: band.freq,
        value: band.value,
        display: displayValue
      };
    });
    
    setBandControls(controls);
  }, [bands]);
  
  const handleSliderChange = (index: number, value: number) => {
    updateBand(index, value);
  };
  
  const getHeightPercentage = (value: number) => {
    // Convert from -12...+12 dB to 0...100%
    return ((value + 12) / 24) * 100;
  };
  
  return (
    <div className="equalizer-bands mb-6 px-4 py-6 bg-tokyo-darkHighlight rounded-xl">
      <div className="bands-container flex justify-between h-40">
        {bandControls.map((band, index) => (
          <div key={band.freq} className="band-slider flex flex-col items-center justify-between">
            <div className={`band-value text-xs ${band.value !== 0 ? "text-tokyo-pink" : ""}`}>
              {band.display}
            </div>
            <div className="band-slider-container relative h-32 flex items-center">
              <div className="band-slider-bg w-1 h-full bg-gray-700 rounded-full"></div>
              <div 
                className="band-slider-fill w-1 absolute bottom-0 bg-tokyo-pink rounded-full" 
                style={{ height: `${getHeightPercentage(band.value)}%` }}
              ></div>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                step="1" 
                value={band.value} 
                onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                className="appearance-none absolute h-full w-8 opacity-0 cursor-pointer"
              />
              <div 
                className="band-slider-thumb absolute w-4 h-4 bg-white rounded-full shadow-lg" 
                style={{ 
                  bottom: `${getHeightPercentage(band.value)}%`, 
                  transform: "translateX(-50%) translateY(50%)" 
                }}
              ></div>
            </div>
            <div className="band-freq text-xs text-gray-400">{band.freq}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
