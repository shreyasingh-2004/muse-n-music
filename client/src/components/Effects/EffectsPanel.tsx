// client/src/components/Effects/EffectsPanel.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Radio, Waves, Zap } from 'lucide-react';

type EffectType = 'reverb' | 'delay' | 'chorus' | 'distortion';

interface Effect {
  type: EffectType;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  level: number;
}

export default function EffectsPanel() {
  const [effects, setEffects] = useState<Effect[]>([
    { type: 'reverb', name: 'Reverb', icon: <Waves size={20} />, active: true, level: 0.5 },
    { type: 'delay', name: 'Delay', icon: <Radio size={20} />, active: false, level: 0.3 },
    { type: 'chorus', name: 'Chorus', icon: <Volume2 size={20} />, active: false, level: 0.4 },
    { type: 'distortion', name: 'Distortion', icon: <Zap size={20} />, active: false, level: 0.2 },
  ]);

  const toggleEffect = (type: EffectType) => {
    setEffects(prev =>
      prev.map(effect =>
        effect.type === type
          ? { ...effect, active: !effect.active }
          : effect
      )
    );
  };

  const updateLevel = (type: EffectType, level: number) => {
    setEffects(prev =>
      prev.map(effect =>
        effect.type === type ? { ...effect, level } : effect
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6"
    >
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Zap className="text-yellow-400" size={24} />
        Audio Effects
      </h3>

      <div className="space-y-6">
        {effects.map((effect) => (
          <div key={effect.type} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleEffect(effect.type)}
                  className={`p-2 rounded-lg transition-colors ${
                    effect.active
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {effect.icon}
                </button>
                <div>
                  <p className="font-medium text-white">{effect.name}</p>
                  <p className="text-sm text-gray-400">
                    {effect.active ? 'Active' : 'Inactive'} • {Math.round(effect.level * 100)}%
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  effect.active
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {effect.active ? 'ON' : 'OFF'}
              </div>
            </div>

            {effect.active && (
              <div className="pl-12">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effect.level * 100}
                  onChange={(e) => updateLevel(effect.type, parseInt(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-sm">
            Effects modify the sound in real-time. Try different combinations!
          </p>
        </div>
      </div>
    </motion.div>
  );
}