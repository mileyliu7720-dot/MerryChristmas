import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DualPosition } from '../types';

interface SpecialOrnamentProps {
  customProgressRef?: React.MutableRefObject<number>;
}

// Reusable logic for scattering and morphing items
const useMorphItems = (
    count: number, 
    scaleBase: number, 
    customProgressRef: React.MutableRefObject<number> | undefined,
    seedOffset: number
) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const data = useMemo(() => {
        const temp: DualPosition[] = [];
        const radius = 3.7; // Sitting just outside foliage
        const height = 8.5;

        for (let i = 0; i < count; i++) {
            // Distribute somewhat randomly but avoiding top/bottom extremes
            const t = 0.1 + (Math.random() * 0.7); 
            const y = (t * height) - height / 2;
            const r = (1 - t) * radius + 0.2;
            
            const angle = (i * 137.5 + seedOffset) * (Math.PI / 180);
            
            const treePos: [number, number, number] = [r * Math.cos(angle), y, r * Math.sin(angle)];

            const sr = 12 + Math.random() * 8;
            const sAngle = Math.random() * Math.PI * 2;
            const sY = (Math.random() - 0.5) * 18;
            const scatterPos: [number, number, number] = [sr * Math.cos(sAngle), sY, sr * Math.sin(sAngle)];

            // Randomize rotation naturally
            // Y: Full 360 random rotation
            // X/Z: Slight tilt to simulate hanging weight
            const randRotX = (Math.random() - 0.5) * 0.5;
            const randRotY = Math.random() * Math.PI * 2;
            const randRotZ = (Math.random() - 0.5) * 0.5;

            temp.push({
                treePosition: treePos,
                scatterPosition: scatterPos,
                rotation: [randRotX, randRotY, randRotZ], 
                scale: scaleBase + (Math.random() * 0.1)
            });
        }
        return temp;
    }, [count, scaleBase, seedOffset]);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const time = clock.getElapsedTime();
        const p = customProgressRef ? customProgressRef.current : 1;

        data.forEach((item, i) => {
            const x = THREE.MathUtils.lerp(item.scatterPosition[0], item.treePosition[0], p);
            const y = THREE.MathUtils.lerp(item.scatterPosition[1], item.treePosition[1], p);
            const z = THREE.MathUtils.lerp(item.scatterPosition[2], item.treePosition[2], p);

            const floatFactor = 1.0 - p;
            dummy.position.set(x, y + Math.sin(time + i) * floatFactor, z);

            // Rotate based on state
            // When scattered (p=0), tumble randomly. When tree (p=1), settle into fixed random rotation.
            const targetRotX = item.rotation[0];
            const targetRotY = item.rotation[1]; 
            const targetRotZ = item.rotation[2];

            // Random tumbling when scattered
            const tumbleX = time * (i % 2 === 0 ? 1 : -1) * floatFactor;
            const tumbleZ = time * 0.5 * floatFactor;

            dummy.rotation.set(
                targetRotX + tumbleX, 
                targetRotY, 
                targetRotZ + tumbleZ
            );
            
            dummy.scale.setScalar(item.scale * (0.5 + 0.5 * p)); // Shrink a bit when scattered
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return meshRef;
};

export const GingerbreadMen: React.FC<SpecialOrnamentProps> = ({ customProgressRef }) => {
    const count = 18;
    const meshRef = useMorphItems(count, 0.25, customProgressRef, 0);

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        // Simple Gingerbread silhouette
        shape.moveTo(0, 0.8); // Top of head
        shape.bezierCurveTo(0.4, 0.8, 0.4, 0.4, 0.2, 0.3); // Head Right
        shape.lineTo(0.5, 0.2); // Arm pit
        shape.lineTo(0.7, 0.3); // Hand top
        shape.bezierCurveTo(0.8, 0.2, 0.8, 0.1, 0.7, 0); // Hand tip
        shape.lineTo(0.3, -0.1); // Arm bottom
        shape.lineTo(0.3, -0.5); // Leg top
        shape.lineTo(0.4, -0.9); // Foot right
        shape.bezierCurveTo(0.2, -1.0, 0, -1.0, -0.2, -1.0); // Feet bottom curve
        shape.lineTo(-0.4, -0.9); // Foot left
        shape.lineTo(-0.3, -0.5); // Leg top
        shape.lineTo(-0.3, -0.1); // Arm bottom
        shape.lineTo(-0.7, 0); // Hand tip
        shape.bezierCurveTo(-0.8, 0.1, -0.8, 0.2, -0.7, 0.3);
        shape.lineTo(-0.5, 0.2); // Arm pit
        shape.lineTo(-0.2, 0.3); // Head Left
        shape.bezierCurveTo(-0.4, 0.4, -0.4, 0.8, 0, 0.8); // Head Top
        
        return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
    }, []);

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow receiveShadow>
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </instancedMesh>
    );
};

export const CandyCanes: React.FC<SpecialOrnamentProps> = ({ customProgressRef }) => {
    const count = 20;
    const meshRef = useMorphItems(count, 0.3, customProgressRef, 120);

    const geometry = useMemo(() => {
        // Curve for candy cane
        class CaneCurve extends THREE.Curve<THREE.Vector3> {
            getPoint(t: number) {
                // simple hook shape
                if (t < 0.7) {
                    // Straight part
                    return new THREE.Vector3(0, (t / 0.7) * 2, 0); 
                } else {
                    // Hook part
                    const angle = ((t - 0.7) / 0.3) * Math.PI;
                    return new THREE.Vector3(
                        -0.4 * (1 - Math.cos(angle)), 
                        2 + 0.4 * Math.sin(angle), 
                        0
                    );
                }
            }
        }
        const path = new CaneCurve();
        return new THREE.TubeGeometry(path, 20, 0.08, 8, false);
    }, []);

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow receiveShadow>
            <meshStandardMaterial color="#c21529" roughness={0.3} metalness={0.4} />
        </instancedMesh>
    );
};

export const Mittens: React.FC<SpecialOrnamentProps> = ({ customProgressRef }) => {
    const count = 15;
    const meshRef = useMorphItems(count, 0.22, customProgressRef, 240);

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        // Mitten Shape
        shape.moveTo(0, 0); // Wrist left
        shape.lineTo(0.5, 0); // Wrist right
        shape.lineTo(0.55, 0.4); 
        shape.lineTo(0.8, 0.5); // Thumb start
        shape.bezierCurveTo(0.9, 0.6, 0.8, 0.8, 0.6, 0.7); // Thumb tip
        shape.lineTo(0.5, 0.5); // Thumb crotch
        shape.lineTo(0.5, 0.8); 
        shape.bezierCurveTo(0.5, 1.1, 0, 1.1, 0, 0.8); // Top of mitten
        shape.lineTo(0, 0);

        return new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
    }, []);

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow receiveShadow>
            <meshStandardMaterial color="#8a0b14" roughness={0.9} />
        </instancedMesh>
    );
};