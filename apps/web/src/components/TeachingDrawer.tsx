import React, { useEffect } from 'react';
import { useGameStore } from '../state/game';

const TeachingDrawer: React.FC = () => {
  const { ui, toggleTeachingDrawer, requestTeachingTip } = useGameStore();

  useEffect(() => {
    if (ui.isTeachingDrawerOpen && !ui.currentTip) {
      requestTeachingTip();
    }
  }, [ui.isTeachingDrawerOpen, ui.currentTip, requestTeachingTip]);

  if (!ui.isTeachingDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={toggleTeachingDrawer}
      />
      
      {/* Drawer */}
      <div className="relative w-80 h-full bg-felt-800 shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-felt-600">
            <h2 className="text-xl font-bold text-white">Teaching Assistant</h2>
            <button
              onClick={toggleTeachingDrawer}
              className="p-2 text-felt-200 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Current Tip */}
            {ui.currentTip && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-felt-100 mb-2">Current Tip</h3>
                <div className="bg-felt-700 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-felt-100 leading-relaxed">{ui.currentTip}</p>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-felt-100 mb-3">Quick Tips</h3>
              <div className="space-y-3">
                <div className="bg-felt-700 rounded-lg p-3">
                  <h4 className="font-medium text-felt-100 mb-1">Basic Strategy</h4>
                  <p className="text-sm text-felt-200">Aim for 4 melds + 1 pair. Look for pungs (3 identical) and chis (3 consecutive).</p>
                </div>
                
                <div className="bg-felt-700 rounded-lg p-3">
                  <h4 className="font-medium text-felt-100 mb-1">Watch Discards</h4>
                  <p className="text-sm text-felt-200">Pay attention to what others discard. It tells you what they don't need.</p>
                </div>
                
                <div className="bg-felt-700 rounded-lg p-3">
                  <h4 className="font-medium text-felt-100 mb-1">Keep It Simple</h4>
                  <p className="text-sm text-felt-200">Don't go for complex hands until you master the basics.</p>
                </div>
              </div>
            </div>

            {/* Game Rules */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-felt-100 mb-3">Game Rules</h3>
              <div className="space-y-2 text-sm text-felt-200">
                <p><strong>Winning Hand:</strong> 14 tiles = 4 melds + 1 pair</p>
                <p><strong>Chi:</strong> 3 consecutive tiles (same suit)</p>
                <p><strong>Pon:</strong> 3 identical tiles</p>
                <p><strong>Kong:</strong> 4 identical tiles</p>
                <p><strong>Minimum:</strong> 3 fan to win</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={requestTeachingTip}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Get New Tip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingDrawer;