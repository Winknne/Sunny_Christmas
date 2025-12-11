import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, InstanceData, OrnamentType } from '../types';

const tempObject = new THREE.Object3D();
const tempPos = new THREE.Vector3();

interface OrnamentsProps {
  mode: TreeMode;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ mode }) => {
  // Separate refs for different geometries
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const sphereRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.InstancedMesh>(null);

  // Store current animated positions for smooth transition
  // We need a persistent state for physics interpolation
  const instances = useMemo(() => {
    const data: InstanceData[] = [];
    const counts = { box: 30, sphere: 80, star: 150 };
    
    const generate = (type: OrnamentType, count: number, weightBase: number) => {
      for (let i = 0; i < count; i++) {
        // Tree Logic
        const height = 6.5;
        const y = (Math.random() * height) - 3.2;
        const relY = (y + 3.5) / height;
        const radiusAtHeight = 2.4 * (1.0 - relY);
        // Place on surface of cone approx
        const theta = Math.random() * Math.PI * 2;
        const r = radiusAtHeight * (0.8 + Math.random() * 0.4); // Variation around surface
        const tx = r * Math.cos(theta);
        const tz = r * Math.sin(theta);

        // Scatter Logic
        const sr = 6 + Math.random() * 6;
        const stheta = Math.random() * Math.PI * 2;
        const sphi = Math.acos(2 * Math.random() - 1);
        const sx = sr * Math.sin(sphi) * Math.cos(stheta);
        const sy = sr * Math.sin(sphi) * Math.sin(stheta);
        const sz = sr * Math.cos(sphi);

        // Colors
        let color = '#ffffff';
        if (type === 'box') color = Math.random() > 0.5 ? '#8B0000' : '#FFD700'; // Deep Red or Gold
        if (type === 'sphere') color = Math.random() > 0.6 ? '#006400' : (Math.random() > 0.5 ? '#DAA520' : '#C0C0C0');
        if (type === 'star') color = '#FFFACD'; // Lemon Chiffon

        data.push({
          id: data.length,
          type,
          treePos: [tx, y, tz],
          scatterPos: [sx, sy, sz],
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
          scale: type === 'box' ? 0.25 : (type === 'sphere' ? 0.2 : 0.08),
          color,
          weight: weightBase + Math.random() * 0.2, // Jitter weight
        });
      }
    };

    generate('box', counts.box, 0.05); // Heavy, moves slow
    generate('sphere', counts.sphere, 0.1); // Medium
    generate('star', counts.star, 0.2); // Light, moves fast

    return data;
  }, []);

  // Separate data by type for meshes
  const { boxData, sphereData, starData } = useMemo(() => ({
    boxData: instances.filter(i => i.type === 'box'),
    sphereData: instances.filter(i => i.type === 'sphere'),
    starData: instances.filter(i => i.type === 'star'),
  }), [instances]);

  // Current interpolated positions ref to avoid re-creating arrays
  const currentPositions = useRef(instances.map(i => ({
    x: i.scatterPos[0], y: i.scatterPos[1], z: i.scatterPos[2]
  })));

  useFrame((state, delta) => {
    // Determine target based on mode
    const isTree = mode === 'tree';

    // Update Matrices
    const updateMesh = (ref: React.RefObject<THREE.InstancedMesh>, dataSet: InstanceData[]) => {
      if (!ref.current) return;

      dataSet.forEach((item, index) => {
        // Find global index in currentPositions
        const globalIdx = item.id; 
        const current = currentPositions.current[globalIdx];
        const target = isTree ? item.treePos : item.scatterPos;

        // Lerp factor based on weight
        // Heavier objects (low weight val in this logic? No, let's say weight is speed)
        // Let's invert: heavy (box) = slow lerp. light (star) = fast lerp.
        const speed = item.weight * delta * 8.0; 
        
        current.x = THREE.MathUtils.lerp(current.x, target[0], speed);
        current.y = THREE.MathUtils.lerp(current.y, target[1], speed);
        current.z = THREE.MathUtils.lerp(current.z, target[2], speed);

        // Apply
        tempObject.position.set(current.x, current.y, current.z);
        
        // Rotate ornaments slightly
        if (isTree) {
           tempObject.rotation.set(item.rotation[0], state.clock.elapsedTime * 0.2 + item.id, item.rotation[2]);
        } else {
           tempObject.rotation.set(
             state.clock.elapsedTime * item.weight, 
             state.clock.elapsedTime * item.weight, 
             state.clock.elapsedTime
           );
        }
        
        tempObject.scale.setScalar(item.scale);
        tempObject.updateMatrix();
        
        ref.current!.setMatrixAt(index, tempObject.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(boxRef, boxData);
    updateMesh(sphereRef, sphereData);
    updateMesh(starRef, starData);
  });

  return (
    <group>
      <instancedMesh ref={boxRef} args={[undefined, undefined, boxData.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B0000" roughness={0.3} metalness={0.6} />
      </instancedMesh>
      
      <instancedMesh ref={sphereRef} args={[undefined, undefined, sphereData.length]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#DAA520" roughness={0.2} metalness={0.9} />
      </instancedMesh>

      <instancedMesh ref={starRef} args={[undefined, undefined, starData.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#FFFACD" toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
