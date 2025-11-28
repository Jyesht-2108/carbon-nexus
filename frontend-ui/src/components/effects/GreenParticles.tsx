import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GreenParticlesProps {
  count?: number;
  isDark?: boolean;
}

export const GreenParticles: React.FC<GreenParticlesProps> = ({ count = 1200, isDark = true }) => {
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
      
      // Nature-inspired colors
      const colorMix = Math.random();
      if (isDark) {
        if (colorMix < 0.3) {
          // Bright green
          colors[i3] = 0.13;
          colors[i3 + 1] = 0.77;
          colors[i3 + 2] = 0.34;
        } else if (colorMix < 0.6) {
          // Emerald
          colors[i3] = 0.06;
          colors[i3 + 1] = 0.73;
          colors[i3 + 2] = 0.51;
        } else if (colorMix < 0.85) {
          // Lime
          colors[i3] = 0.52;
          colors[i3 + 1] = 0.8;
          colors[i3 + 2] = 0.09;
        } else {
          // Cyan-green
          colors[i3] = 0.2;
          colors[i3 + 1] = 0.83;
          colors[i3 + 2] = 0.6;
        }
      } else {
        if (colorMix < 0.3) {
          // Dark green
          colors[i3] = 0.09;
          colors[i3 + 1] = 0.64;
          colors[i3 + 2] = 0.29;
        } else if (colorMix < 0.6) {
          // Dark emerald
          colors[i3] = 0.02;
          colors[i3 + 1] = 0.59;
          colors[i3 + 2] = 0.41;
        } else if (colorMix < 0.85) {
          // Dark lime
          colors[i3] = 0.4;
          colors[i3 + 1] = 0.64;
          colors[i3 + 2] = 0.05;
        } else {
          // Dark teal
          colors[i3] = 0.05;
          colors[i3 + 1] = 0.58;
          colors[i3 + 2] = 0.53;
        }
      }
      
      sizes[i] = Math.random() * 2.5 + 0.5;
    }
    
    return [positions, colors, sizes];
  }, [count, isDark]);

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Gentle upward drift (like energy rising)
        positions[i3 + 1] += 0.03;
        
        // Slight wave motion
        positions[i3] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.008;
        positions[i3 + 2] += Math.cos(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.008;
        
        // Reset when too high
        if (positions[i3 + 1] > 30) {
          positions[i3 + 1] = -30;
          positions[i3] = (Math.random() - 0.5) * 80;
          positions[i3 + 2] = (Math.random() - 0.5) * 80;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.0001;
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
        size={0.4}
        vertexColors
        transparent
        opacity={isDark ? 0.7 : 0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
