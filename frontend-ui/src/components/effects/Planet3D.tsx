import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function GlowingPlanet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Create custom shader material for the planet
  const planetMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#00F6FF') },
        color2: { value: new THREE.Color('#0EF1C7') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Create gradient based on position
          float gradient = (vPosition.y + 1.0) * 0.5;
          vec3 color = mix(color1, color2, gradient);
          
          // Add some noise/texture
          float noise = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time) * 0.1;
          color += noise;
          
          // Fresnel effect for edge glow
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          color += fresnel * 0.5;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    });
  }, []);

  // Animate the planet
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
      planetRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      planetMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.y += 0.001;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.003;
    }
  });

  return (
    <group>
      {/* Main Planet */}
      <Sphere ref={planetRef} args={[1, 64, 64]}>
        <primitive object={planetMaterial} attach="material" />
      </Sphere>

      {/* Outer Glow */}
      <Sphere ref={glowRef} args={[1.3, 32, 32]}>
        <meshBasicMaterial
          color="#00F6FF"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Inner Glow */}
      <Sphere args={[1.15, 32, 32]}>
        <meshBasicMaterial
          color="#0EF1C7"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Orbiting Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial
          color="#00F6FF"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Particles around planet */}
      <Points />
    </group>
  );
}

function Points() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#75E7FB"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function Planet3D() {
  return (
    <div className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none z-0 opacity-30">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00F6FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#0EF1C7" />
        
        <GlowingPlanet />
        
        {/* Subtle camera movement */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
