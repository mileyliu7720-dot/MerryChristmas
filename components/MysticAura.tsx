import React, { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const AuraMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uColorA: new THREE.Color('#4c1d95'), // Violet 900
    uColorB: new THREE.Color('#2563eb'), // Blue 600
  },
  `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aRandom; // x: size, y: speed, z: offset
    attribute vec3 aPosition;
    varying float vAlpha;
    varying float vMix;

    void main() {
      vec3 pos = aPosition;
      
      // Breathing/Floating animation
      float time = uTime * aRandom.y;
      
      // Expand when tree is scattered (uProgress -> 0)
      float expansion = 1.0 + (1.0 - uProgress) * 0.8;
      pos *= expansion;

      // Gentle swirl
      float angle = time * 0.2;
      float x = pos.x * cos(angle) - pos.z * sin(angle);
      float z = pos.x * sin(angle) + pos.z * cos(angle);
      pos.x = x;
      pos.z = z;

      // Vertical drift
      pos.y += sin(time + aRandom.z) * 0.5;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (60.0 * aRandom.x + 20.0) * (1.0 / -mvPosition.z);

      // Pass color mix factor based on height and time
      vMix = 0.5 + 0.5 * sin(pos.y * 0.3 + uTime * 0.5);
      
      // Fade edges
      vAlpha = smoothstep(15.0, 0.0, length(pos));
    }
  `,
  `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vAlpha;
    varying float vMix;

    void main() {
      // Soft particle texture
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0); // Sharper falloff for glowy look

      vec3 color = mix(uColorA, uColorB, vMix);
      
      gl_FragColor = vec4(color, strength * vAlpha * 0.6);
    }
  `
);

extend({ AuraMaterial });

interface MysticAuraProps {
  customProgressRef?: React.MutableRefObject<number>;
}

export const MysticAura: React.FC<MysticAuraProps> = ({ customProgressRef }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const count = 1500;

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 3);
    const radius = 6.0;
    const height = 14.0;

    for (let i = 0; i < count; i++) {
      // Cylinder distribution
      const r = Math.random() * radius + 2.0; // Keep away from center slightly
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * height;

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(theta);

      rnd[i * 3] = Math.random(); // Size
      rnd[i * 3 + 1] = 0.2 + Math.random() * 0.5; // Speed
      rnd[i * 3 + 2] = Math.random() * Math.PI * 2; // Offset
    }
    return { positions: pos, randoms: rnd };
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      if (customProgressRef) {
        materialRef.current.uniforms.uProgress.value = customProgressRef.current;
      }
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aPosition" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <auraMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};