import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CarbonVisualizationProps {
  isDark?: boolean;
}

export const CarbonVisualization: React.FC<CarbonVisualizationProps> = ({ isDark = true }) => {
  const torusRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.2;
      torusRef.current.rotation.y = time * 0.3;
    }
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y = time * 0.5;
      const scale = 1 + Math.sin(time * 2) * 0.1;
      sphereRef.current.scale.set(scale, scale, scale);
    }
    
    if (ringsRef.current) {
      ringsRef.current.rotation.y = time * 0.4;
      ringsRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    }
  });

  const sphereColor = isDark ? '#0a0a0a' : '#1a1a1a';
  const emissiveColor = isDark ? '#00ffff' : '#0099cc';
  const torusColor = isDark ? '#ff6b35' : '#cc5522';
  const ringColor = isDark ? '#00ffff' : '#0066aa';
  const indicatorColor = isDark ? '#ff3333' : '#cc0000';

  return (
    <group position={[0, 0, -20]}>
      {/* Central sphere - represents Earth/Carbon core */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          color={sphereColor}
          emissive={emissiveColor}
          emissiveIntensity={isDark ? 0.4 : 0.2}
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[3.1, 16, 16]} />
        <meshBasicMaterial
          color={emissiveColor}
          wireframe
          transparent
          opacity={isDark ? 0.3 : 0.2}
        />
      </mesh>
      
      {/* Torus - carbon cycle */}
      <mesh ref={torusRef} position={[0, 0, 0]}>
        <torusGeometry args={[5, 0.3, 16, 100]} />
        <meshStandardMaterial
          color={torusColor}
          emissive={torusColor}
          emissiveIntensity={isDark ? 0.5 : 0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={isDark ? 0.7 : 0.5}
        />
      </mesh>
      
      {/* Orbital rings */}
      <group ref={ringsRef}>
        {[6, 7, 8].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.5]}>
            <torusGeometry args={[radius, 0.05, 8, 64]} />
            <meshBasicMaterial
              color={ringColor}
              transparent
              opacity={isDark ? (0.3 - i * 0.05) : (0.2 - i * 0.03)}
            />
          </mesh>
        ))}
      </group>
      
      {/* Emission indicators - small spheres orbiting */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2) * 2,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color={indicatorColor}
              emissive={indicatorColor}
              emissiveIntensity={isDark ? 1 : 0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
};
