import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function MovingStars() {
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

      // Cyan/teal color variations
      const colorVariation = Math.random();
      if (colorVariation > 0.7) {
        // Bright cyan
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.96;
        colors[i * 3 + 2] = 1.0;
      } else if (colorVariation > 0.4) {
        // Teal
        colors[i * 3] = 0.05;
        colors[i * 3 + 1] = 0.94;
        colors[i * 3 + 2] = 0.78;
      } else {
        // White
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
    }

    return [positions, colors];
  }, []);

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
