import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useSpring } from '@react-spring/core';
import * as THREE from 'three';
import { Foliage } from './Foliage';
import { Ornaments, GiftBoxes } from './Ornaments';
import { MagicRibbon } from './MagicRibbon';
import { GingerbreadMen, CandyCanes, Mittens } from './SpecialOrnaments';
import { Star } from './Star';
import { Snow } from './Snow';
import { MysticAura } from './MysticAura';
import { useAppStore } from '../store';
import { AppState } from '../types';

export const Experience: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />
        <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.4} 
            minDistance={5} 
            maxDistance={20}
            autoRotate
            autoRotateSpeed={0.5}
        />

        {/* Lighting for Luxury */}
        <ambientLight intensity={0.2} color="#001a10" />
        <spotLight 
            position={[10, 20, 10]} 
            angle={0.3} 
            penumbra={1} 
            intensity={2} 
            color="#ffeeb1" 
            castShadow 
            shadow-bias={-0.0001}
        />
        <spotLight 
            position={[-10, 5, -10]} 
            angle={0.5} 
            penumbra={1} 
            intensity={1} 
            color="#48a876" 
        />
        <pointLight position={[0, -2, 0]} intensity={0.5} color="#gold" />

        <Environment preset="city" />

        {/* Content */}
        <SceneContentWithSpring />
        
        {/* Floor Reflection */}
        <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" />

        {/* Post Processing */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.4}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

// Extracted to properly use the hook and render loop
const SceneContentWithSpring: React.FC = () => {
    const { state } = useAppStore();
    
    // We use a spring that animates a value 0-1
    const { val } = useSpring({
        val: state === AppState.TREE_SHAPE ? 1 : 0,
        config: { mass: 2, tension: 40, friction: 20 }
    });

    // We use a ref to store the current animated value to avoid React re-renders of the whole scene
    const progressRef = useRef(0);

    useFrame(() => {
        progressRef.current = val.get();
    });

    return (
        <group>
             <FoliageWithRef progressRef={progressRef} />
             <OrnamentsWithRef progressRef={progressRef} />
             <SpecialOrnamentsWithRef progressRef={progressRef} />
             <StarWithRef progressRef={progressRef} />
             <MagicRibbonWithRef progressRef={progressRef} />
             <MysticAuraWithRef progressRef={progressRef} />
             <Snow />
        </group>
    );
};

// -- Adapters for the components to use Ref --

const FoliageWithRef = ({ progressRef }: { progressRef: React.MutableRefObject<number> }) => {
    return <AnimatedFoliage springVal={progressRef} />;
}

const OrnamentsWithRef = ({ progressRef }: { progressRef: React.MutableRefObject<number> }) => {
    return <AnimatedOrnaments springVal={progressRef} />
}

const SpecialOrnamentsWithRef = ({ progressRef }: { progressRef: React.MutableRefObject<number> }) => {
  return (
    <>
      <GingerbreadMen customProgressRef={progressRef} />
      <CandyCanes customProgressRef={progressRef} />
      <Mittens customProgressRef={progressRef} />
    </>
  )
}

const StarWithRef = ({ progressRef }: { progressRef: React.MutableRefObject<number> }) => {
    return <AnimatedStar springVal={progressRef} />
}

const MagicRibbonWithRef = ({ progressRef }: { progressRef: React.MutableRefObject<number> }) => {
  return <MagicRibbon customProgressRef={progressRef} />
}

const MysticAuraWithRef = ({ progressRef }: { progressRef: React.MutableRefObject<number> }) => {
  return <MysticAura customProgressRef={progressRef} />
}


// --- Implementation of the "Animated" versions inline to keep file count low but logic separated ---

const AnimatedFoliage = ({ springVal }: { springVal: React.MutableRefObject<number> }) => {
    // This is essentially the Foliage component but reading from Ref
    return <Foliage progress={0} customProgressRef={springVal} />; 
}

const AnimatedOrnaments = ({ springVal }: { springVal: React.MutableRefObject<number> }) => {
    return (
        <>
            <Ornaments progress={0} customProgressRef={springVal} />
            <GiftBoxes progress={0} customProgressRef={springVal} />
        </>
    )
}

const AnimatedStar = ({ springVal }: { springVal: React.MutableRefObject<number> }) => {
    return <Star progress={0} customProgressRef={springVal} />
}