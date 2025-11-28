import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { planetVertex, planetFragment } from '@/shaders/planetSurface';
import { atmosphereVertex, atmosphereFragment } from '@/shaders/atmosphereShader';
import { scanlineVertex, scanlineFragment } from '@/shaders/scanlineShader';

export function NeonPlanet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const scanlineRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (planetRef.current) {
      (planetRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      planetRef.current.rotation.y += 0.002;
    }
    
    if (scanlineRef.current) {
      (scanlineRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t * 1.0;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0025;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.003;
    }
  });

  return (
    <group position={[3, 0, 0]}>
      {/* Planet Surface with Custom Shader */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial
          vertexShader={planetVertex}
          fragmentShader={planetFragment}
          uniforms={{ uTime: { value: 0 } }}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} scale={1.25}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          side={THREE.BackSide}
          transparent
        />
      </mesh>

      {/* Scanline Overlay */}
      <mesh ref={scanlineRef}>
        <sphereGeometry args={[2.51, 64, 64]} />
        <shaderMaterial
          vertexShader={scanlineVertex}
          fragmentShader={scanlineFragment}
          uniforms={{ uTime: { value: 0 } }}
          transparent
        />
      </mesh>

      {/* Tech Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#00eaff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
