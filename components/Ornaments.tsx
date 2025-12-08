import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DualPosition } from '../types';

interface OrnamentProps {
  progress: number;
  customProgressRef?: React.MutableRefObject<number>;
}

export const Ornaments: React.FC<OrnamentProps> = ({ progress, customProgressRef }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Increased density significantly
  const count = 600;
  
  const data = useMemo(() => {
    const temp: DualPosition[] = [];
    const radius = 3.9;
    const height = 9;

    for (let i = 0; i < count; i++) {
      // Use square root distribution for uniform density on a cone surface
      // (Otherwise top gets too dense and bottom too sparse)
      const r_rand = Math.random();
      const t = 1 - Math.sqrt(r_rand); 
      
      const y = (t * height) - height / 2;
      const r = (1 - t) * radius; 
      const angle = Math.random() * Math.PI * 2;
      
      const treePos: [number, number, number] = [r * Math.cos(angle), y, r * Math.sin(angle)];

      const sr = 12 + Math.random() * 10;
      const sAngle = Math.random() * Math.PI * 2;
      const sY = (Math.random() - 0.5) * 20;
      
      const scatterPos: [number, number, number] = [sr * Math.cos(sAngle), sY, sr * Math.sin(sAngle)];

      temp.push({
        treePosition: treePos,
        scatterPosition: scatterPos,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.12 + Math.random() * 0.18 // Slightly smaller on average to accommodate density
      });
    }
    return temp;
  }, []);

  // Initialize colors: Mostly Deep Green, some Gold
  useLayoutEffect(() => {
    if (meshRef.current) {
        const tempColor = new THREE.Color();
        for (let i = 0; i < count; i++) {
            // ~80% Deep Green, ~20% Gold
            if (Math.random() < 0.8) {
                tempColor.set('#0B4F28'); // Deep Emerald/Forest Green
            } else {
                tempColor.set('#F5C71A'); // Bright Gold
            }
            meshRef.current.setColorAt(i, tempColor);
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    const p = customProgressRef ? customProgressRef.current : progress;

    data.forEach((item, i) => {
      const x = THREE.MathUtils.lerp(item.scatterPosition[0], item.treePosition[0], p);
      const y = THREE.MathUtils.lerp(item.scatterPosition[1], item.treePosition[1], p);
      const z = THREE.MathUtils.lerp(item.scatterPosition[2], item.treePosition[2], p);

      const floatFactor = 1.0 - p; 
      const hoverY = Math.sin(time * 1.5 + i) * 0.5 * floatFactor;
      const rotateSpeed = 0.5 * floatFactor;

      dummy.position.set(x, y + hoverY, z);
      dummy.rotation.x = item.rotation[0] + time * rotateSpeed;
      dummy.rotation.y = item.rotation[1] + time * rotateSpeed;
      dummy.rotation.z = item.rotation[2];
      
      // Scale pop when forming tree
      const scalePop = 1.0 + (Math.sin(p * Math.PI) * 0.2);
      dummy.scale.setScalar(item.scale * scalePop);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      {/* Set base color to white so instance colors show through correctly */}
      <meshStandardMaterial 
        color="#ffffff" 
        roughness={0.15} 
        metalness={0.9}
      />
    </instancedMesh>
  );
};

export const GiftBoxes: React.FC<OrnamentProps> = ({ progress, customProgressRef }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 65; // Slightly increased count
    
    const data = useMemo(() => {
      const temp: DualPosition[] = [];
      const radius = 3.6;
      const height = 9;
      
      // Golden Angle for uniform spiral distribution
      const phi = Math.PI * (3 - Math.sqrt(5)); // ~2.39996

      for (let i = 0; i < count; i++) {
        // Concentrate in lower-middle section (0 to 0.6 height ratio)
        // t=0 is bottom, t=1 is top
        const t = (i / count) * 0.6; 
        
        const y = (t * height) - height / 2;
        const r = (1 - t) * radius + 0.5; // Offset slightly outward
        
        // Spiral angle
        const angle = i * phi;
        
        const treePos: [number, number, number] = [r * Math.cos(angle), y, r * Math.sin(angle)];
  
        const sr = 10 + Math.random() * 8;
        const sAngle = Math.random() * Math.PI * 2;
        const sY = (Math.random() - 0.5) * 15;
        
        const scatterPos: [number, number, number] = [sr * Math.cos(sAngle), sY, sr * Math.sin(sAngle)];
  
        temp.push({
          treePosition: treePos,
          scatterPosition: scatterPos,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          // Reduced scale for smaller boxes
          scale: 0.2 + Math.random() * 0.25
        });
      }
      return temp;
    }, []);
  
    const dummy = useMemo(() => new THREE.Object3D(), []);
  
    useFrame(({ clock }) => {
      if (!meshRef.current) return;
      const time = clock.getElapsedTime();
      const p = customProgressRef ? customProgressRef.current : progress;
  
      data.forEach((item, i) => {
        const x = THREE.MathUtils.lerp(item.scatterPosition[0], item.treePosition[0], p);
        const y = THREE.MathUtils.lerp(item.scatterPosition[1], item.treePosition[1], p);
        const z = THREE.MathUtils.lerp(item.scatterPosition[2], item.treePosition[2], p);
  
        const floatFactor = 1.0 - p; 
        const hoverY = Math.cos(time + i) * 0.8 * floatFactor;
        
        dummy.position.set(x, y + hoverY, z);
        
        const currentRotX = THREE.MathUtils.lerp(item.rotation[0] + time, 0, p);
        const currentRotZ = THREE.MathUtils.lerp(item.rotation[2] + time, 0, p);
        
        // When assembled, slight gentle rock
        const settledRotY = item.rotation[1] + Math.sin(time + i) * 0.1;
        const currentRotY = THREE.MathUtils.lerp(item.rotation[1] + time * 0.2, settledRotY, p);

        dummy.rotation.set(currentRotX, currentRotY, currentRotZ);
        dummy.scale.setScalar(item.scale);
  
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      
      meshRef.current.instanceMatrix.needsUpdate = true;
    });
  
    return (
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color="#7a0a10" 
            roughness={0.3}
            metalness={0.4}
        />
      </instancedMesh>
    );
  };