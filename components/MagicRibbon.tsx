import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MagicRibbonProps {
  progress?: number;
  customProgressRef?: React.MutableRefObject<number>;
}

export const MagicRibbon: React.FC<MagicRibbonProps> = ({ progress = 0, customProgressRef }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 3500; // Increased density significantly

  const { data, dummy } = useMemo(() => {
    const temp = [];
    const dummyObj = new THREE.Object3D();
    const radius = 4.2; // Slightly wider than the tree
    const height = 10;
    const spiralLoops = 3.5;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      
      // Calculate Ribbon Position (Tree Shape)
      // Angle goes around multiple times
      const angle = t * Math.PI * 2 * spiralLoops;
      
      // Height goes from bottom to top
      const yBase = (t * height) - height / 2;
      
      // Add 'band' width logic. Instead of just a line, give it some thickness in Y
      // Using a sine wave to make the ribbon undulate slightly
      const bandWidth = (Math.random() - 0.5) * 0.6; 
      const y = yBase + bandWidth;

      const rBase = (1 - t) * radius; 
      // Add slight depth thickness
      const r = rBase + (Math.random() - 0.5) * 0.2;

      const treePos: [number, number, number] = [
        r * Math.cos(angle),
        y,
        r * Math.sin(angle)
      ];

      // Scatter Position
      const sr = 15 + Math.random() * 10;
      const sAngle = Math.random() * Math.PI * 2;
      const sY = (Math.random() - 0.5) * 25;
      const scatterPos: [number, number, number] = [
        sr * Math.cos(sAngle), 
        sY, 
        sr * Math.sin(sAngle)
      ];

      temp.push({
        treePos,
        scatterPos,
        scale: Math.random() * 0.5 + 0.2, // Varied particle sizes
        speed: Math.random() * 0.5 + 0.2,
        offset: Math.random() * Math.PI * 2
      });
    }
    return { data: temp, dummy: dummyObj };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    const p = customProgressRef ? customProgressRef.current : progress;

    data.forEach((item, i) => {
      // Interpolate position
      const x = THREE.MathUtils.lerp(item.scatterPos[0], item.treePos[0], p);
      const y = THREE.MathUtils.lerp(item.scatterPos[1], item.treePos[1], p);
      const z = THREE.MathUtils.lerp(item.scatterPos[2], item.treePos[2], p);

      // Add sparkling movement
      const hover = Math.sin(time * item.speed + item.offset) * 0.1;
      
      // Orbit when scattered, static when tree
      const orbitSpeed = (1 - p) * 0.2;
      const finalX = x * Math.cos(time * orbitSpeed) - z * Math.sin(time * orbitSpeed);
      const finalZ = x * Math.sin(time * orbitSpeed) + z * Math.cos(time * orbitSpeed);

      dummy.position.set(finalX, y + hover, finalZ);
      
      // Scale down slightly when scattered to look like dust, larger when ribbon
      const scaleMult = 0.05 + (0.05 * p); 
      dummy.scale.setScalar(item.scale * scaleMult);
      
      dummy.rotation.set(time, time, time);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#e0f7fa"
        emissive="#ffffff"
        emissiveIntensity={2}
        toneMapped={false}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
};