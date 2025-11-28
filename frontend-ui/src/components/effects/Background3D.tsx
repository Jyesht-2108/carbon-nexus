import { Canvas } from '@react-three/fiber';
import { MovingStars } from './MovingStars';
import { useEffect, useState } from 'react';

export function Background3D() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

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
        {/* Subtle ambient lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Clean starfield */}
        <MovingStars isDark={isDark} />
      </Canvas>
    </div>
  );
}
