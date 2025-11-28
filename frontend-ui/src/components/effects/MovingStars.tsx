import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MovingStarsProps {
  isDark?: boolean;
}

export function MovingStars({ isDark = true }: MovingStarsProps) {
  const starsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 6000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random position in a sphere
      const radius = 120 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Elegant color variations
      if (isDark) {
        const colorVariation = Math.random();
        if (colorVariation > 0.85) {
          // Bright white
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 1.0;
          colors[i * 3 + 2] = 1.0;
        } else if (colorVariation > 0.6) {
          // Soft blue-white
          colors[i * 3] = 0.85;
          colors[i * 3 + 1] = 0.9;
          colors[i * 3 + 2] = 1.0;
        } else if (colorVariation > 0.3) {
          // Pale cyan
          colors[i * 3] = 0.7;
          colors[i * 3 + 1] = 0.85;
          colors[i * 3 + 2] = 0.95;
        } else {
          // Dim white
          colors[i * 3] = 0.6;
          colors[i * 3 + 1] = 0.65;
          colors[i * 3 + 2] = 0.7;
        }
      } else {
        const colorVariation = Math.random();
        if (colorVariation > 0.7) {
          // Medium gray
          colors[i * 3] = 0.4;
          colors[i * 3 + 1] = 0.45;
          colors[i * 3 + 2] = 0.5;
        } else {
          // Dark gray
          colors[i * 3] = 0.2;
          colors[i * 3 + 1] = 0.25;
          colors[i * 3 + 2] = 0.3;
        }
      }
    }

    return [positions, colors];
  }, [isDark]);

  useFrame((state) => {
    if (starsRef.current) {
      // Slow rotation
      starsRef.current.rotation.y += 0.0002;
      starsRef.current.rotation.x += 0.0001;
      
      // Gentle drift
      starsRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.1) * 2;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
