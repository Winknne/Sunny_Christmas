import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TreeMode } from '../types';

// Exporting so App.tsx can use it as initial state
export const DEFAULT_PHOTO_URLS = [
  'https://images.unsplash.com/photo-1621112904887-419379ce6824?q=80&w=500&auto=format&fit=crop', // Couple Selfie vibe
  'https://images.unsplash.com/photo-1525059337994-6f2a1311b4d4?q=80&w=500&auto=format&fit=crop', // Girl portrait
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=500&auto=format&fit=crop', // Event/Light stick vibe
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop', // Guy portrait
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=500&auto=format&fit=crop', // Group/Couple gathering
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500&auto=format&fit=crop', // Restaurant/Date vibe
];

interface PhotoFrameProps {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  mode: TreeMode;
  index: number;
}

const PhotoFrame: React.FC<PhotoFrameProps> = ({ url, position, rotation, scale, mode, index }) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(url);
  
  // Random scatter position
  const scatterPos = useMemo(() => {
     const r = 6 + Math.random() * 4;
     const theta = Math.random() * Math.PI * 2;
     const phi = Math.acos(2 * Math.random() - 1);
     return new THREE.Vector3(
       r * Math.sin(phi) * Math.cos(theta),
       r * Math.sin(phi) * Math.sin(theta),
       r * Math.cos(phi)
     );
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const isTree = mode === 'tree';
      const targetPos = isTree ? new THREE.Vector3(...position) : scatterPos;
      
      // Interpolate Position
      meshRef.current.position.lerp(targetPos, delta * 2);

      // Interpolate Rotation
      if (isTree) {
          const targetRot = new THREE.Euler(...rotation);
          meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRot.x + Math.sin(state.clock.elapsedTime + index) * 0.05, delta);
          meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRot.y + Math.cos(state.clock.elapsedTime * 0.5 + index) * 0.05, delta);
          meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRot.z, delta);
      } else {
          meshRef.current.rotation.x += delta * 0.2;
          meshRef.current.rotation.y += delta * 0.3;
      }
      
      // Scale pop
      const targetS = isTree ? scale : scale * 1.5;
      meshRef.current.scale.lerp(new THREE.Vector3(targetS, targetS, targetS), delta * 2);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Golden Frame - Extra Shiny */}
      <mesh position={[0, 0, -0.02]} receiveShadow castShadow>
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshStandardMaterial 
          color="#FFD700"
          roughness={0.15}
          metalness={1.0}
          emissive="#AA8800"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* The Photo with Golden Sheen Overlay */}
      <mesh position={[0, 0.15, 0.02]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.1}
          metalness={0.5} 
          emissive="#FFD700" 
          emissiveIntensity={0.15} // Golden glow from within the photo
          color="#fff8e1" // Warm golden tint
        />
      </mesh>
      
      {/* Decorative Gold Clip */}
      <mesh position={[0, 0.8, 0.02]} rotation={[0,0, -0.1]}>
         <boxGeometry args={[0.4, 0.15, 0.06]} />
         <meshStandardMaterial 
            color="#FFD700" 
            metalness={1} 
            roughness={0.1} 
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
         />
      </mesh>
    </group>
  );
};

interface PhotoOrnamentsProps {
  mode: TreeMode;
  photos: string[];
}

export const PhotoOrnaments: React.FC<PhotoOrnamentsProps> = ({ mode, photos }) => {
  const photoData = useMemo(() => {
    // Fallback to default if empty, though parent usually handles this
    const urlsToUse = photos.length > 0 ? photos : DEFAULT_PHOTO_URLS;

    return urlsToUse.map((url, i) => {
       const count = urlsToUse.length;
       const t = i / count;
       
       // Spiral up the tree
       const y = -2.5 + (t * 5.5); 
       const relY = (y + 3.5) / 7.0;
       const radius = 2.5 * (1 - relY) + 0.6; // Slightly further out to catch light
       const angle = t * Math.PI * 4;
       
       const x = Math.cos(angle) * radius;
       const z = Math.sin(angle) * radius;
       
       const rotY = -angle + Math.PI / 2;
       const rotZ = (Math.random() - 0.5) * 0.2;

       return {
         url,
         position: [x, y, z] as [number, number, number],
         rotation: [0, rotY, rotZ] as [number, number, number],
         scale: 0.9 // Slightly larger
       };
    });
  }, [photos]);

  return (
    <group>
      {photoData.map((photo, i) => (
        <PhotoFrame 
          key={`${photo.url}-${i}`} // Include URL in key to force texture reload if url changes
          index={i}
          mode={mode}
          url={photo.url}
          position={photo.position}
          rotation={photo.rotation}
          scale={photo.scale}
        />
      ))}
    </group>
  );
};