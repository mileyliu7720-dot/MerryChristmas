import React, { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const SnowMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#ffffff'),
    uHeight: 20.0,
  },
  `
    uniform float uTime;
    uniform float uHeight;
    attribute float aSpeed;
    attribute vec3 aRandom; // x: wobble freq, y: wobble amp, z: random phase

    varying float vAlpha;

    void main() {
      vec3 pos = position;
      
      // Infinite fall logic using modulus
      // Position starts at y, moves down by speed*time
      // We add an offset to ensure it covers the range, then mod by height, then center it
      float fall = uTime * aSpeed;
      float y = mod(position.y - fall + uHeight * 0.5, uHeight) - uHeight * 0.5;
      
      pos.y = y;
      
      // Horizontal wobble (Wind)
      pos.x += sin(uTime + aRandom.z) * aRandom.y;
      pos.z += cos(uTime * 0.8 + aRandom.z) * aRandom.y;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = (100.0 * aRandom.x + 20.0) * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;

      // Fade out at top and bottom boundaries for smoothness
      float boundary = uHeight * 0.45;
      float alpha = 1.0;
      if (abs(y) > boundary) {
        alpha = smoothstep(uHeight * 0.5, boundary, abs(y));
      }
      vAlpha = alpha;
    }
  `,
  `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
      // Soft circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      
      // Soft edge
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.5);

      gl_FragColor = vec4(uColor, strength * vAlpha * 0.8);
    }
  `
);

extend({ SnowMaterial });

export const Snow: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const count = 1500;

  const { positions, speeds, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const rnd = new Float32Array(count * 3);

    const range = 25;

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // Initial Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * range;

      spd[i] = 1.0 + Math.random() * 2.5; // Falling speed

      rnd[i * 3] = 0.5 + Math.random() * 0.5; // Size factor
      rnd[i * 3 + 1] = 0.1 + Math.random() * 0.3; // Wobble Amp
      rnd[i * 3 + 2] = Math.random() * Math.PI * 2; // Phase
    }
    return { positions: pos, speeds: spd, randoms: rnd };
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <snowMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};