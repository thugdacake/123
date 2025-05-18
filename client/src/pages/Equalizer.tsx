import { useState } from "react";
import { useEqualizer } from "@/hooks/useEqualizer";
import EqualizerBands from "@/components/EqualizerBands";

export default function Equalizer() {
  const { 
    presets, 
    currentPreset, 
    applyPreset,
    saveCurrentAsPreset,
    effects,
    toggleEffect,
    audioDistance,
    setAudioDistance
  } = useEqualizer();
  
  const [newPresetName, setNewPresetName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      saveCurrentAsPreset(newPresetName.trim());
      setNewPresetName("");
      setShowSaveDialog(false);
    }
  };
  
  return (
    <div id="equalizer-screen" className="screen px-5 pt-2 pb-20">
      <div className="screen-header mb-6">
        <h2 className="font-heading font-semibold text-xl mb-1">Equalizador</h2>
        <p className="text-sm text-gray-400">Personalize o som da sua música</p>
      </div>
      
      {/* Equalizer Presets */}
      <div className="equalizer-presets mb-6">
        <div className="section-header flex justify-between items-center mb-3">
          <h3 className="font-heading font-semibold">Predefinições</h3>
          <button 
            className="text-sm text-tokyo-pink"
            onClick={() => setShowSaveDialog(true)}
          >
            Salvar atual
          </button>
        </div>
        <div className="presets-list flex space-x-2 overflow-x-auto pb-2">
          {presets.map((preset) => (
            <button 
              key={preset.id}
              className={`preset-item flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                currentPreset === preset.id 
                  ? "bg-tokyo-pink text-white" 
                  : "border border-tokyo-darkHighlight"
              }`}
              onClick={() => applyPreset(preset.id)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Equalizer Bands */}
      <EqualizerBands />
      
      {/* Audio Effects */}
      <div className="audio-effects">
        <h3 className="font-heading font-semibold mb-3">Efeitos de Áudio</h3>
        <div className="effects-list space-y-4 bg-tokyo-darkElevated rounded-xl p-4">
          <div className="effect-item flex items-center justify-between">
            <div>
              <div className="effect-name font-medium">3D Audio</div>
              <div className="effect-description text-xs text-gray-400">Simular áudio tridimensional</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={effects.threeDimensional}
                onChange={() => toggleEffect('threeDimensional')}
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-tokyo-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="effect-item flex items-center justify-between">
            <div>
              <div className="effect-name font-medium">Efeitos Ambientais</div>
              <div className="effect-description text-xs text-gray-400">Reverberação baseada no ambiente</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={effects.environmental}
                onChange={() => toggleEffect('environmental')}
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-tokyo-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="effect-item">
            <div className="mb-2">
              <div className="setting-name font-medium">Distância de Áudio</div>
              <div className="setting-description text-xs text-gray-400">Alcance do áudio 3D para outros jogadores</div>
            </div>
            <div className="range-slider">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.1"
                value={audioDistance}
                onChange={(e) => setAudioDistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="range-labels flex justify-between text-xs text-gray-400 mt-1">
                <span>1m</span>
                <span>{audioDistance.toFixed(1)}m</span>
                <span>10m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="bg-tokyo-darkElevated p-4 rounded-lg w-[80%]">
            <h3 className="font-heading font-semibold mb-4">Salvar Predefinição</h3>
            <input 
              type="text"
              placeholder="Nome da predefinição"
              className="w-full mb-4 p-2 rounded bg-tokyo-darkHighlight text-white border border-gray-700"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 rounded bg-gray-700 text-white"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 rounded bg-tokyo-pink text-white"
                onClick={handleSavePreset}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
