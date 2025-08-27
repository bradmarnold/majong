import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/game';
import { assetLoader } from '../lib/assets';

const SettingsModal: React.FC = () => {
  const { ui, toggleSettings, setBackground } = useGameStore();
  const [backgrounds, setBackgrounds] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load available backgrounds
    assetLoader.loadManifest().then(manifest => {
      setBackgrounds(manifest.backgrounds);
    });
  }, []);

  if (!ui.showSettings) {
    return null;
  }

  const backgroundOptions = [
    { key: 'felt', name: 'Green Felt', description: 'Classic casino green felt' },
    { key: 'light-wood', name: 'Light Wood', description: 'Natural oak finish' },
    { key: 'dark-wood', name: 'Dark Wood', description: 'Rich mahogany grain' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={toggleSettings}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-felt-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-felt-600">
            <h2 className="text-xl font-bold text-white">Game Settings</h2>
            <button
              onClick={toggleSettings}
              className="p-2 text-felt-200 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            
            {/* Background Selection */}
            <div>
              <h3 className="text-lg font-semibold text-felt-100 mb-3">Table Background</h3>
              <div className="space-y-3">
                {backgroundOptions.map(option => (
                  <div key={option.key} className="flex items-center gap-3">
                    <input
                      type="radio"
                      id={`bg-${option.key}`}
                      name="background"
                      value={option.key}
                      checked={ui.selectedBackground === option.key}
                      onChange={() => setBackground(option.key)}
                      className="w-4 h-4 text-green-600 bg-felt-700 border-felt-500 focus:ring-green-500"
                    />
                    <label htmlFor={`bg-${option.key}`} className="flex-1 cursor-pointer">
                      <div className="text-felt-100 font-medium">{option.name}</div>
                      <div className="text-felt-300 text-sm">{option.description}</div>
                    </label>
                    
                    {/* Preview thumbnail */}
                    {backgrounds[option.key] && (
                      <div className="w-16 h-10 rounded border border-felt-500 overflow-hidden">
                        <img
                          src={backgrounds[option.key]}
                          alt={option.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Rules Quick Reference */}
            <div>
              <h3 className="text-lg font-semibold text-felt-100 mb-3">Quick Rules</h3>
              <div className="bg-felt-700 rounded-lg p-3 space-y-2 text-sm text-felt-200">
                <div><strong>Goal:</strong> 14 tiles = 4 melds + 1 pair</div>
                <div><strong>Chi:</strong> 3 consecutive same suit</div>
                <div><strong>Pon:</strong> 3 identical tiles</div>
                <div><strong>Kong:</strong> 4 identical tiles</div>
                <div><strong>Minimum:</strong> 3 fan to win</div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="text-lg font-semibold text-felt-100 mb-3">Keyboard Shortcuts</h3>
              <div className="bg-felt-700 rounded-lg p-3 space-y-2 text-sm text-felt-200">
                <div className="flex justify-between">
                  <span>Draw tile</span>
                  <kbd className="px-2 py-1 text-xs bg-felt-600 rounded">D</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Discard selected</span>
                  <kbd className="px-2 py-1 text-xs bg-felt-600 rounded">Space</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Teaching help</span>
                  <kbd className="px-2 py-1 text-xs bg-felt-600 rounded">H</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Settings</span>
                  <kbd className="px-2 py-1 text-xs bg-felt-600 rounded">S</kbd>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-felt-600">
            <button
              onClick={toggleSettings}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;