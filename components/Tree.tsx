import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { TreeMode } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { PhotoOrnaments } from './PhotoOrnaments';

const EMERALD_COLOR = "#004028";

// ------------------------------------------------------------------
// Base Tree Inner Core (For depth occlusion)
// ------------------------------------------------------------------
const InnerTreeCore: React.FC<{ mode: TreeMode }> = ({ mode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = mode === 'tree' ? 1 : 0.1;

  useFrame((state, delta) => {
    if (meshRef.current) {
        // Shrink core when scattered to hide it
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta);
        if (mode === 'tree') {
             meshRef.current.rotation.y += delta * 0.05;
        }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]} castShadow>
      <coneGeometry args={[2.0, 7, 32]} />
      <meshStandardMaterial 
        color="#001a10" 
        roughness={0.9} 
        metalness={0.1}
      />
    </mesh>
  );
};

// ------------------------------------------------------------------
// Star Topper Component (Kept as separate hero element)
// ------------------------------------------------------------------
const StarTopper: React.FC<{ mode: TreeMode }> = ({ mode }) => {
   const ref = useRef<THREE.Group>(null);
   const targetPos = new THREE.Vector3(0, 3.4, 0);
   const scatterPos = new THREE.Vector3(0, 8, 0);

   useFrame((state, delta) => {
     if(ref.current) {
        ref.current.position.lerp(mode === 'tree' ? targetPos : scatterPos, delta * 1.5);
        ref.current.rotation.y += delta * 0.5;
     }
   });

   return (
     <group ref={ref}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
          <mesh>
            <octahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial 
              color="#FFFDD0" 
              emissive="#FFD700" 
              emissiveIntensity={2} 
              toneMapped={false}
            />
          </mesh>
          <pointLight color="#FFD700" intensity={2} distance={6} decay={2} />
          {/* Halo Effect */}
          <mesh scale={[1.5, 1.5, 1.5]}>
             <sphereGeometry args={[0.3, 16, 16]} />
             <meshBasicMaterial color="#FFD700" transparent opacity={0.1} side={THREE.BackSide} />
          </mesh>
        </Float>
     </group>
   )
}

// ------------------------------------------------------------------
// Main Tree Composition
// ------------------------------------------------------------------
export const ArixTree: React.FC<{ mode: TreeMode; photos: string[] }> = ({ mode, photos }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Whole group bobbing
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = mode === 'tree' 
        ? Math.sin(t * 0.5) * 0.1 - 0.5 
        : 0; 
        
      if (mode === 'tree') {
         groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
      } else {
         groupRef.current.rotation.y += 0.001;
      }
    }
  });

  return (
    <group ref={groupRef}>
      
      {/* 1. Dark Inner Core for Volume Occlusion */}
      <InnerTreeCore mode={mode} />

      {/* 2. High Fidelity Particle Foliage */}
      <Foliage mode={mode} count={4000} />

      {/* 3. Instanced Ornament System */}
      <Ornaments mode={mode} />

      {/* 4. Golden Photo Memories */}
      <PhotoOrnaments mode={mode} photos={photos} />

      {/* 5. Hero Star */}
      <StarTopper mode={mode} />

      {/* 6. Ambient Sparkles */}
      <Sparkles 
        count={mode === 'tree' ? 100 : 300} 
        scale={mode === 'tree' ? 8 : 18} 
        size={4} 
        speed={0.4} 
        opacity={0.6} 
        color="#FFD700"
      />
    </group>
  );
};