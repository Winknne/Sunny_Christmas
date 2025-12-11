import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode } from '../types';

const vertexShader = `
  uniform float uTime;
  uniform float uMorphFactor; // 0.0 = scattered, 1.0 = tree
  
  attribute vec3 aTreePos;
  attribute vec3 aScatterPos;
  attribute float aRandom;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Morph between positions
    vec3 targetPos = mix(aScatterPos, aTreePos, uMorphFactor);
    
    // Add breathing/wind effect (more intense when scattered)
    float windStrength = mix(0.1, 0.02, uMorphFactor);
    float movement = sin(uTime * 2.0 + aRandom * 10.0) * windStrength;
    targetPos.x += movement;
    targetPos.z += movement;
    
    // Calculate final position
    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (8.0 * (1.0 + aRandom)) * (10.0 / -mvPosition.z);
    
    // Pass color to fragment
    // Mix between dark emerald and a hint of gold based on random factor
    vec3 emerald = vec3(0.0, 0.25, 0.15);
    vec3 gold = vec3(1.0, 0.84, 0.0);
    
    // Highlight tips
    vColor = mix(emerald, gold, pow(aRandom, 8.0) * 0.5);
    vAlpha = 0.8 + 0.2 * sin(uTime + aRandom * 10.0);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft particle circle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);
    if (r > 0.5) discard;
    
    // Soft edge glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  mode: TreeMode;
  count?: number;
}

export const Foliage: React.FC<FoliageProps> = ({ mode, count = 3000 }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const morphFactor = useRef(0);

  // Generate Geometry Data
  const { positions, treePositions, scatterPositions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const treePos = new Float32Array(count * 3);
    const scatterPos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    const layers = 6;
    const height = 7;
    
    for (let i = 0; i < count; i++) {
      // 1. Tree Positions (Cone Volume)
      // Distribute points in stacked cones to form tree shape
      const layerH = height / layers;
      const y = (Math.random() * height) - 3.5; // Spread vertically
      const relY = (y + 3.5) / height; // 0 to 1 (bottom to top)
      const maxRadius = 2.5 * (1.0 - relY); // Taper upward
      
      // Random point in circle at this height
      const r = Math.sqrt(Math.random()) * maxRadius; // Uniform distribution
      const theta = Math.random() * 2 * Math.PI;
      
      const tx = r * Math.cos(theta);
      const ty = y;
      const tz = r * Math.sin(theta);

      treePos[i * 3] = tx;
      treePos[i * 3 + 1] = ty;
      treePos[i * 3 + 2] = tz;

      // 2. Scatter Positions (Sphere Volume)
      const sr = 6 + Math.random() * 4; // Scatter radius 6-10
      const sTheta = Math.random() * 2 * Math.PI;
      const sPhi = Math.acos(2 * Math.random() - 1);
      
      scatterPos[i * 3] = sr * Math.sin(sPhi) * Math.cos(sTheta);
      scatterPos[i * 3 + 1] = sr * Math.sin(sPhi) * Math.sin(sTheta);
      scatterPos[i * 3 + 2] = sr * Math.cos(sPhi);

      // 3. Initial Display Positions (match scatter initially or 0)
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      // 4. Random attribute
      rnd[i] = Math.random();
    }

    return { 
      positions: pos, 
      treePositions: treePos, 
      scatterPositions: scatterPos, 
      randoms: rnd 
    };
  }, [count]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Smoothly interpolate morph factor
      const target = mode === 'tree' ? 1.0 : 0.0;
      morphFactor.current = THREE.MathUtils.lerp(morphFactor.current, target, delta * 1.5);
      
      materialRef.current.uniforms.uMorphFactor.value = morphFactor.current;
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Required by threejs logic even if shader overrides
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMorphFactor: { value: 1 } // Start as tree
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
