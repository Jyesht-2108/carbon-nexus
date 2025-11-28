import { Canvas } from '@react-three/fiber';
import { MovingStars } from './MovingStars';

export function Background3D() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        {/* Moving Starfield */}
        <MovingStars />
      </Canvas>
    </div>
  );
}
