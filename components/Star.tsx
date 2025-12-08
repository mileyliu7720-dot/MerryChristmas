import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarProps {
    progress: number;
    customProgressRef?: React.MutableRefObject<number>;
}

export const Star: React.FC<StarProps> = ({ progress, customProgressRef }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Create a 5-pointed star shape
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.0;
    const innerRadius = 0.45;
    
    // Start from top
    shape.moveTo(0, outerRadius);
    
    for (let i = 1; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        // Use sin for x and cos for y to align top point with Y axis
        const x = Math.sin(angle) * radius;
        const y = Math.cos(angle) * radius;
        shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.05,
    bevelSegments: 3
  }), []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const p = customProgressRef ? customProgressRef.current : progress;
      
      const scatterY = 12 + Math.sin(time) * 3;
      const treeY = 4.8;
      
      const currentY = THREE.MathUtils.lerp(scatterY, treeY, p);
      
      // Make Star Smaller: Changed lerp max from 1.2 to 0.75
      const currentScale = THREE.MathUtils.lerp(0.01, 0.75, p); 
      
      meshRef.current.position.y = currentY;
      meshRef.current.scale.setScalar(currentScale);
      
      // Star spin
      meshRef.current.rotation.y = time * 0.8;
    }
  });

  return (
    <group ref={meshRef} position={[0, 5, 0]}>
      {/* Center the extruded mesh on Z axis (depth is 0.3 + bevels) */}
      <mesh castShadow position={[0, 0, -0.15]}>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700"
            emissiveIntensity={1.5}
            toneMapped={false}
            roughness={0.15}
            metalness={1}
        />
      </mesh>
      {/* Light Source */}
      <pointLight intensity={2} distance={6} decay={2} color="#ffd700" />
    </group>
  );
};