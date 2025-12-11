import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ArixTree } from './Tree';
import { TreeMode } from '../types';

interface SceneProps {
  mode: TreeMode;
  photos: string[];
}

const Scene: React.FC<SceneProps> = ({ mode, photos }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} // Quality scaling
      gl={{ antialias: false, toneMapping: 3 }} // ACESFilmicToneMapping
    >
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={45} />
      
      <color attach="background" args={['#010502']} />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#010502', 5, 20]} />

      <Suspense fallback={null}>
        {/* High Definition Environment Map for Reflections */}
        <Environment preset="city" blur={0.8} background={false} />
        
        <group position={[0, -0.5, 0]}>
          <ArixTree mode={mode} photos={photos} />
        </group>

        {/* Dramatic Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1.5} 
          castShadow 
          color="#fff0d6"
        />
        <pointLight position={[-10, -5, -10]} intensity={0.5} color="#00ff88" />
        
        {/* Floor Reflections */}
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      </Suspense>

      <OrbitControls 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={mode === 'scattered' ? 0.2 : 0.5}
      />

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        {/* Bloom for the glowy, magical luxury feel */}
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.02} /> 
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;