import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uColorBase: new THREE.Color('#002816'),
    uColorTip: new THREE.Color('#D4AF37'),
  },
  `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    varying float vRandom;
    varying float vDepth;
    varying float vProgress;

    // Simplex noise (truncated for brevity, assumes standard implementation or similar)
    // Using a simple pseudo-random for shake here to save GLSL lines in this view
    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vRandom = aRandom;
      vProgress = uProgress;

      vec3 finalPos = mix(aScatterPos, aTreePos, uProgress);
      
      // Simple wind effect
      float wind = sin(uTime * 2.0 + finalPos.y * 0.5) * 0.05 * (1.0 - uProgress);
      finalPos.x += wind;

      // Explosion/Implosion effect curve
      // When uProgress is around 0.5, expand slightly? No, linear is cleaner for "Morph"
      
      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_PointSize = (50.0 * aRandom + 10.0) * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    varying float vRandom;
    varying float vProgress;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.5);

      vec3 color = mix(uColorBase, uColorTip, vRandom * 0.4);
      
      // Add extra gold sparkle when fully formed
      float sparkle = step(0.98, vRandom) * step(0.9, vProgress);
      color += vec3(1.0, 0.8, 0.2) * sparkle * sin(gl_FragCoord.x);

      gl_FragColor = vec4(color + vec3(0.1)*strength, strength);
    }
  `
);

extend({ FoliageMaterial });

interface FoliageProps {
  count?: number;
  progress: number;
  customProgressRef?: React.MutableRefObject<number>;
}

export const Foliage: React.FC<FoliageProps> = ({ count = 8000, progress, customProgressRef }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, scatterPositions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scat = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    const radius = 3.8;
    const height = 9;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = i * 2.39996; // Golden angle roughly
      const y = t * height - height / 2;
      const r = (1 - t) * radius + (Math.random() * 0.8);
      
      pos[i * 3] = r * Math.cos(angle);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(angle);

      // Scatter Sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const sr = 10 + Math.random() * 10;
      
      scat[i * 3] = sr * Math.sin(phi) * Math.cos(theta);
      scat[i * 3 + 1] = sr * Math.sin(phi) * Math.sin(theta);
      scat[i * 3 + 2] = sr * Math.cos(phi);

      rnd[i] = Math.random();
    }
    return { positions: pos, scatterPositions: scat, randoms: rnd };
  }, [count]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      // Use Ref if available, else prop
      const p = customProgressRef ? customProgressRef.current : progress;
      materialRef.current.uniforms.uProgress.value = p;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTreePos" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatterPos" count={scatterPositions.length / 3} array={scatterPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={randoms.length} array={randoms} itemSize={1} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <foliageMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};