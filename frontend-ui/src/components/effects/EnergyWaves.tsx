import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnergyWavesProps {
  isDark?: boolean;
}

export const EnergyWaves: React.FC<EnergyWavesProps> = ({ isDark = true }) => {
  const wave1Ref = useRef<THREE.Mesh>(null);
  const wave2Ref = useRef<THREE.Mesh>(null);
  const wave3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (wave1Ref.current && wave1Ref.current.material instanceof THREE.Material) {
      wave1Ref.current.rotation.z = time * 0.1;
      wave1Ref.current.material.opacity = 0.15 + Math.sin(time * 0.5) * 0.05;
    }
    
    if (wave2Ref.current && wave2Ref.current.material instanceof THREE.Material) {
      wave2Ref.current.rotation.z = -time * 0.15;
      wave2Ref.current.material.opacity = 0.12 + Math.sin(time * 0.7 + 1) * 0.05;
    }
    
    if (wave3Ref.current && wave3Ref.current.material instanceof THREE.Material) {
      wave3Ref.current.rotation.z = time * 0.08;
      wave3Ref.current.material.opacity = 0.1 + Math.sin(time * 0.6 + 2) * 0.05;
    }
  });

  const waveColor = isDark ? '#10b981' : '#059669';

  return (
    <group position={[0, 0, -30]}>
      {/* Wave ring 1 */}
      <mesh ref={wave1Ref}>
        <torusGeometry args={[15, 0.3, 16, 100]} />
        <meshBasicMaterial
          color={waveColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Wave ring 2 */}
      <mesh ref={wave2Ref}>
        <torusGeometry args={[20, 0.25, 16, 100]} />
        <meshBasicMaterial
          color={isDark ? '#22c55e' : '#16a34a'}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Wave ring 3 */}
      <mesh ref={wave3Ref}>
        <torusGeometry args={[25, 0.2, 16, 100]} />
        <meshBasicMaterial
          color={isDark ? '#34d399' : '#0d9488'}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
