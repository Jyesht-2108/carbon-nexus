import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingLeavesProps {
  count?: number;
  isDark?: boolean;
}

export const FloatingLeaves: React.FC<FloatingLeavesProps> = ({ count = 40, isDark = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const leaves = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ] as [number, number, number],
        speed: Math.random() * 0.015 + 0.008,
        scale: Math.random() * 0.6 + 0.4,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        swayOffset: Math.random() * Math.PI * 2,
        color: Math.random()
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const leaf = leaves[i];
        const time = state.clock.elapsedTime;
        
        // Gentle falling motion
        child.position.y -= leaf.speed;
        
        // Swaying motion
        child.position.x += Math.sin(time * 0.5 + leaf.swayOffset) * 0.02;
        child.position.z += Math.cos(time * 0.5 + leaf.swayOffset) * 0.02;
        
        // Rotation
        child.rotation.y += leaf.rotationSpeed;
        child.rotation.x += leaf.rotationSpeed * 0.5;
        child.rotation.z = Math.sin(time + leaf.swayOffset) * 0.3;
        
        // Reset when too low
        if (child.position.y < -50) {
          child.position.y = 50;
          child.position.x = (Math.random() - 0.5) * 100;
          child.position.z = (Math.random() - 0.5) * 100;
        }
      });
    }
  });

  const getLeafColor = (colorValue: number) => {
    if (isDark) {
      // Dark mode: vibrant greens and nature colors
      if (colorValue < 0.3) return '#10b981'; // Emerald
      if (colorValue < 0.6) return '#22c55e'; // Green
      if (colorValue < 0.8) return '#84cc16'; // Lime
      return '#34d399'; // Teal green
    } else {
      // Light mode: deeper greens
      if (colorValue < 0.3) return '#059669'; // Dark emerald
      if (colorValue < 0.6) return '#16a34a'; // Dark green
      if (colorValue < 0.8) return '#65a30d'; // Dark lime
      return '#0d9488'; // Dark teal
    }
  };

  return (
    <group ref={groupRef}>
      {leaves.map((leaf, i) => (
        <group key={i} position={leaf.position} scale={leaf.scale}>
          {/* Leaf shape using plane with custom geometry */}
          <mesh rotation={[0, 0, 0]}>
            <planeGeometry args={[1.2, 0.8]} />
            <meshStandardMaterial
              color={getLeafColor(leaf.color)}
              emissive={getLeafColor(leaf.color)}
              emissiveIntensity={isDark ? 0.3 : 0.1}
              side={THREE.DoubleSide}
              transparent
              opacity={isDark ? 0.7 : 0.6}
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          
          {/* Leaf vein (center line) */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
            <meshStandardMaterial
              color={isDark ? '#065f46' : '#064e3b'}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
