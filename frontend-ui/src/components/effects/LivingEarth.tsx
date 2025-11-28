import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LivingEarthProps {
  isDark?: boolean;
}

export const LivingEarth: React.FC<LivingEarthProps> = ({ isDark = true }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.1;
      const pulse = 1 + Math.sin(time * 0.8) * 0.05;
      earthRef.current.scale.set(pulse, pulse, pulse);
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * 0.15;
    }
    
    if (ringsRef.current) {
      ringsRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      ringsRef.current.rotation.y = time * 0.2;
    }
  });

  const earthColor = isDark ? '#10b981' : '#059669';
  const glowColor = isDark ? '#34d399' : '#0d9488';

  return (
    <group position={[0, 0, -25]}>
      {/* Earth core */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial
          color={earthColor}
          emissive={earthColor}
          emissiveIntensity={isDark ? 0.4 : 0.2}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[4.3, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isDark ? 0.15 : 0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[4.1, 16, 16]} />
        <meshBasicMaterial
          color={glowColor}
          wireframe
          transparent
          opacity={isDark ? 0.25 : 0.15}
        />
      </mesh>
      
      {/* Energy rings */}
      <group ref={ringsRef}>
        {[5.5, 6.5, 7.5].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2.5, 0, i * 0.4]}>
            <torusGeometry args={[radius, 0.08, 8, 64]} />
            <meshBasicMaterial
              color={i === 0 ? earthColor : glowColor}
              transparent
              opacity={isDark ? (0.3 - i * 0.05) : (0.2 - i * 0.04)}
            />
          </mesh>
        ))}
      </group>
      
      {/* Orbiting energy particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 6;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 1.5) * 2,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial
              color={isDark ? '#84cc16' : '#65a30d'}
              emissive={isDark ? '#84cc16' : '#65a30d'}
              emissiveIntensity={isDark ? 0.8 : 0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
};
