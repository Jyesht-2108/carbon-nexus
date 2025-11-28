import { motion } from 'framer-motion';

/**
 * Fallback CSS-based 3D planet for environments without WebGL support
 * This provides a similar visual effect using pure CSS
 */
export function SimplePlanet3D() {
  return (
    <div className="fixed top-20 right-20 w-[400px] h-[400px] pointer-events-none z-0 opacity-25">
      <div className="relative w-full h-full">
        {/* Main Planet Sphere */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #00F6FF, #0EF1C7, #006B6B)',
            boxShadow: `
              0 0 60px rgba(0, 246, 255, 0.4),
              0 0 100px rgba(14, 241, 199, 0.3),
              inset 0 0 60px rgba(0, 246, 255, 0.2)
            `,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Surface texture overlay */}
          <div
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 10px,
                  rgba(0, 246, 255, 0.1) 10px,
                  rgba(0, 246, 255, 0.1) 11px
                )
              `,
            }}
          />
        </motion.div>

        {/* Outer Glow Layer */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 246, 255, 0.2), transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Orbiting Ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '280px',
            height: '280px',
            transform: 'translate(-50%, -50%) rotateX(75deg)',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              border: '2px solid rgba(0, 246, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 246, 255, 0.4)',
            }}
          />
        </motion.div>

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 150 + Math.random() * 50;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-neon-cyan"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: `${x}px`,
                marginTop: `${y}px`,
                boxShadow: '0 0 4px rgba(0, 246, 255, 0.8)',
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Atmospheric Glow */}
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(14, 241, 199, 0.15), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
      </div>
    </div>
  );
}
