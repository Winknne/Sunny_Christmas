import React, { useState } from 'react';
import Scene from './components/Scene';
import { UI } from './components/UI';
import { TreeMode } from './types';
import { DEFAULT_PHOTO_URLS } from './components/PhotoOrnaments';

const App = () => {
  const [mode, setMode] = useState<TreeMode>('tree');
  const [photos, setPhotos] = useState<string[]>(DEFAULT_PHOTO_URLS);

  return (
    <div className="relative w-full h-screen bg-[#050a08]">
      {/* 3D Scene Container */}
      <div className="absolute inset-0 z-0">
        <Scene mode={mode} photos={photos} />
      </div>

      {/* Interface Layer */}
      <UI mode={mode} setMode={setMode} setPhotos={setPhotos} />

      {/* Overlay Gradient for Cinematic Vignette feel at edges */}
      <div className="absolute inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,10,8,0.4)_100%)]" />
    </div>
  );
};

export default App;