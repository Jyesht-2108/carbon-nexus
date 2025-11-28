import { motion } from 'framer-motion';

export function Abstract3D() {
  return (
    <>
      {/* Floating Orb - Top Right */}
      <motion.div
        className="fixed top-20 right-20 pointer-events-none z-0"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
        }}
      >
        <div className="relative w-64 h-64">
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(0, 246, 255, 0.4), rgba(14, 241, 199, 0.2), transparent)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute inset-8 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0, 246, 255, 0.3), transparent)',
              filter: 'blur(20px)',
            }}
          />
        </div>
      </motion.div>

      {/* Floating Ring - Bottom Left */}
      <motion.div
        className="fixed bottom-32 left-32 pointer-events-none z-0"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
          scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-15">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F6FF" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#0EF1C7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00F6FF" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="2"
              filter="url(#glow)"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="1"
              filter="url(#glow)"
              opacity="0.6"
            />
          </svg>
        </div>
      </motion.div>

      {/* Geometric Shape - Top Left */}
      <motion.div
        className="fixed top-40 left-40 pointer-events-none z-0"
        animate={{
          rotate: [0, -360],
          y: [0, 15, 0],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="relative w-32 h-32 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 122, 26, 0.3), rgba(255, 197, 61, 0.2))',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              filter: 'blur(15px)',
            }}
          />
        </div>
      </motion.div>
    </>
  );
}
