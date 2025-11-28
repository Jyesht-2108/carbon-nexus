import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EmissionParticlesProps {
  count?: number;
  isDark?: boolean;
}

export const EmissionParticles: React.FC<EmissionParticlesProps> = ({ count = 1000, isDark = true }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Positions - spread around
      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = Math.random() * 60 - 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 80;
      
      // Colors - theme aware
      const colorMix = Math.random();
      if (isDark) {
        // Dark mode: cyan to red gradient
        if (colorMix < 0.4) {
          // Cyan
          colors[i3] = 0;
          colors[i3 + 1] = 1;
          colors[i3 + 2] = 1;
        } else if (colorMix < 0.7) {
          // Orange
          colors[i3] = 1;
          colors[i3 + 1] = 0.5;
          colors[i3 + 2] = 0;
        } else {
          // Red
          colors[i3] = 1;
          colors[i3 + 1] = 0.2;
          colors[i3 + 2] = 0.2;
        }
      } else {
        // Light mode: darker colors for visibility
        if (colorMix < 0.4) {
          // Dark blue
          colors[i3] = 0;
          colors[i3 + 1] = 0.4;
          colors[i3 + 2] = 0.6;
        } else if (colorMix < 0.7) {
          // Dark orange
          colors[i3] = 0.8;
          colors[i3 + 1] = 0.3;
          colors[i3 + 2] = 0;
        } else {
          // Dark red
          colors[i3] = 0.6;
          colors[i3 + 1] = 0;
          colors[i3 + 2] = 0;
        }
      }
      
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    return [positions, colors, sizes];
  }, [count, isDark]);

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Rise up like smoke/emissions
        positions[i3 + 1] += 0.05;
        
        // Slight drift
        positions[i3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        positions[i3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.01;
        
        // Reset when too high
        if (positions[i3 + 1] > 30) {
          positions[i3 + 1] = -30;
          positions[i3] = (Math.random() - 0.5) * 80;
          positions[i3 + 2] = (Math.random() - 0.5) * 80;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
