import { useState, useEffect, useCallback } from "react";

interface EqualizerBand {
  freq: string;
  value: number;
}

interface EqualizerPreset {
  id: string;
  name: string;
  values: number[];
}

interface AudioEffects {
  threeDimensional: boolean;
  environmental: boolean;
  directional: boolean;
  occlusion: boolean;
}

export function useEqualizer() {
  // Default bands based on config.lua frequencies
  const [bands, setBands] = useState<EqualizerBand[]>([
    { freq: "60 Hz", value: 0 },
    { freq: "230 Hz", value: 0 },
    { freq: "910 Hz", value: 0 },
    { freq: "3.6 kHz", value: 0 },
    { freq: "14 kHz", value: 0 }
  ]);

  // Default presets from config.lua
  const [presets, setPresets] = useState<EqualizerPreset[]>([
    { id: "flat", name: "Plano", values: [0, 0, 0, 0, 0] },
    { id: "bassBoost", name: "Reforço de Graves", values: [10, 5, 0, 0, 0] },
    { id: "vocalBoost", name: "Vocais", values: [-2, 0, 7, 4, -2] },
    { id: "trebleBoost", name: "Agudos", values: [0, 0, 0, 7, 9] },
    { id: "electronic", name: "Eletrônica", values: [4, 3, 0, 3, 5] }
  ]);

  // Audio effects states
  const [effects, setEffects] = useState<AudioEffects>({
    threeDimensional: true,
    environmental: true,
    directional: true,
    occlusion: true
  });

  // Audio distance setting for 3D audio
  const [audioDistance, setAudioDistance] = useState<number>(5.0);

  // Currently active preset
  const [currentPreset, setCurrentPreset] = useState<string>("flat");

  // Initialize from local storage if available
  useEffect(() => {
    try {
      const savedPreset = localStorage.getItem("equalizerPreset");
      if (savedPreset) setCurrentPreset(savedPreset);

      const savedBands = localStorage.getItem("equalizerBands");
      if (savedBands) setBands(JSON.parse(savedBands));

      const savedEffects = localStorage.getItem("audioEffects");
      if (savedEffects) setEffects(JSON.parse(savedEffects));

      const savedDistance = localStorage.getItem("audioDistance");
      if (savedDistance) setAudioDistance(parseFloat(savedDistance));
    } catch (e) {
      console.error("Error loading equalizer settings", e);
    }
  }, []);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem("equalizerBands", JSON.stringify(bands));
  }, [bands]);

  useEffect(() => {
    localStorage.setItem("equalizerPreset", currentPreset);
  }, [currentPreset]);

  useEffect(() => {
    localStorage.setItem("audioEffects", JSON.stringify(effects));
  }, [effects]);

  useEffect(() => {
    localStorage.setItem("audioDistance", audioDistance.toString());
  }, [audioDistance]);

  // Update a single band value
  const updateBand = useCallback((index: number, value: number) => {
    setBands(prevBands => {
      const newBands = [...prevBands];
      newBands[index] = { ...newBands[index], value };
      return newBands;
    });
    
    // When manually adjusting, set preset to "custom"
    setCurrentPreset("custom");
  }, []);

  // Apply a preset to all bands
  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    const updatedBands = bands.map((band, index) => ({
      ...band,
      value: preset.values[index]
    }));

    setBands(updatedBands);
    setCurrentPreset(presetId);
  }, [bands, presets]);

  // Save current band settings as a new preset
  const saveCurrentAsPreset = useCallback((name: string) => {
    const presetValues = bands.map(band => band.value);
    const presetId = `custom_${Date.now()}`;
    
    const newPreset: EqualizerPreset = {
      id: presetId,
      name,
      values: presetValues
    };

    setPresets(prev => [...prev, newPreset]);
    setCurrentPreset(presetId);
  }, [bands]);

  // Toggle audio effect
  const toggleEffect = useCallback((effectKey: keyof AudioEffects) => {
    setEffects(prev => ({
      ...prev,
      [effectKey]: !prev[effectKey]
    }));
  }, []);

  // Get the Web Audio API representation of the equalizer
  // This would be used in a real implementation with Web Audio API
  const getAudioNodes = useCallback(() => {
    // In a real implementation, this would return AudioNode objects
    // for each frequency band to be connected to a Web Audio context
    return bands.map(band => {
      return {
        frequency: parseFloat(band.freq.split(' ')[0]),
        gain: band.value
      };
    });
  }, [bands]);

  // Apply audio effects to a Web Audio graph
  // This is a stub for what would be real Web Audio API code
  const applyAudioEffects = useCallback(() => {
    if (effects.threeDimensional) {
      // Would set up spatial audio nodes
      console.log("3D audio enabled with distance", audioDistance);
    }

    if (effects.environmental) {
      // Would apply reverb/echo appropriate to environment
      console.log("Environmental effects enabled");
    }

    // Additional effects would be applied here
  }, [effects, audioDistance]);

  return {
    bands,
    updateBand,
    presets,
    currentPreset,
    applyPreset,
    saveCurrentAsPreset,
    effects,
    toggleEffect,
    audioDistance,
    setAudioDistance,
    getAudioNodes,
    applyAudioEffects
  };
}
