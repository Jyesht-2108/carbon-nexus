import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MoleculeProps {
  count?: number;
  isDark?: boolean;
}

export const CarbonMolecules: React.FC<MoleculeProps> = ({ count = 50, isDark = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const molecules = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const isCO2 = Math.random() > 0.3; // 70% CO2, 30% CO
      temp.push({
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ] as [number, number, number],
        speed: Math.random() * 0.02 + 0.01,
        scale: Math.random() * 0.4 + 0.3,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        isCO2
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const molecule = molecules[i];
        child.position.y += molecule.speed;
        child.rotation.y += molecule.rotationSpeed;
        child.rotation.x += molecule.rotationSpeed * 0.5;
        
        if (child.position.y > 50) {
          child.position.y = -50;
        }
      });
    }
  });

  // Colors that work on both backgrounds
  const carbonColor = isDark ? '#2a2a2a' : '#1a1a1a';
  const oxygenColor = isDark ? '#ff4444' : '#cc0000';
  const bondColor = isDark ? '#00ffff' : '#0099cc';
  const emissiveColor = isDark ? '#00ffff' : '#006699';

  return (
    <group ref={groupRef}>
      {molecules.map((molecule, i) => (
        <group key={i} position={molecule.position} scale={molecule.scale}>
          {molecule.isCO2 ? (
            // CO2 molecule (linear: O=C=O)
            <>
              {/* Carbon atom (center) */}
              <mesh>
                <sphereGeometry args={[0.6, 20, 20]} />
                <meshStandardMaterial 
                  color={carbonColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.4 : 0.2}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              
              {/* Oxygen atom 1 */}
              <mesh position={[1.5, 0, 0]}>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial 
                  color={oxygenColor}
                  emissive={oxygenColor}
                  emissiveIntensity={isDark ? 0.3 : 0.15}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
              
              {/* Oxygen atom 2 */}
              <mesh position={[-1.5, 0, 0]}>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial 
                  color={oxygenColor}
                  emissive={oxygenColor}
                  emissiveIntensity={isDark ? 0.3 : 0.15}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
              
              {/* Double bonds */}
              <mesh position={[0.75, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
                <meshStandardMaterial 
                  color={bondColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.6 : 0.3}
                  transparent
                  opacity={isDark ? 0.7 : 0.5}
                />
              </mesh>
              <mesh position={[0.75, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
                <meshStandardMaterial 
                  color={bondColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.6 : 0.3}
                  transparent
                  opacity={isDark ? 0.7 : 0.5}
                />
              </mesh>
              <mesh position={[-0.75, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
                <meshStandardMaterial 
                  color={bondColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.6 : 0.3}
                  transparent
                  opacity={isDark ? 0.7 : 0.5}
                />
              </mesh>
              <mesh position={[-0.75, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
                <meshStandardMaterial 
                  color={bondColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.6 : 0.3}
                  transparent
                  opacity={isDark ? 0.7 : 0.5}
                />
              </mesh>
            </>
          ) : (
            // CO molecule (C≡O)
            <>
              {/* Carbon atom */}
              <mesh position={[-0.6, 0, 0]}>
                <sphereGeometry args={[0.6, 20, 20]} />
                <meshStandardMaterial 
                  color={carbonColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.4 : 0.2}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              
              {/* Oxygen atom */}
              <mesh position={[0.6, 0, 0]}>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial 
                  color={oxygenColor}
                  emissive={oxygenColor}
                  emissiveIntensity={isDark ? 0.3 : 0.15}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
              
              {/* Triple bond */}
              <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                <meshStandardMaterial 
                  color={bondColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.6 : 0.3}
                  transparent
                  opacity={isDark ? 0.7 : 0.5}
                />
              </mesh>
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                <meshStandardMaterial 
                  color={bondColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.6 : 0.3}
                  transparent
                  opacity={isDark ? 0.7 : 0.5}
                />
              </mesh>
              <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                <meshStandardMaterial 
                  color={bondColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isDark ? 0.6 : 0.3}
                  transparent
                  opacity={isDark ? 0.7 : 0.5}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
};
