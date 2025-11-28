import { motion } from 'framer-motion';

export function LottieLoader({ size = 40 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: '#00F6FF',
          borderRightColor: '#0EF1C7',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 246, 255, 0.2), transparent)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export function LottieCheckmark({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="#0EF1C7"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M7 12l3 3 7-7"
          stroke="#00F6FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          fill="rgba(0, 246, 255, 0.1)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />
      </svg>
    </motion.div>
  );
}

export function LottiePulse({ size = 16 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full bg-neon-cyan"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0.3, 0.8],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, #00F6FF, transparent)',
          filter: 'blur(4px)',
        }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export function LottieTyping() {
  return (
    <div className="flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-neon-cyan"
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
          style={{
            boxShadow: '0 0 8px rgba(0, 246, 255, 0.6)',
          }}
        />
      ))}
    </div>
  );
}

export function LottieGlowRing({ size = 60 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: '2px solid rgba(0, 246, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 246, 255, 0.4)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          border: '1px solid rgba(14, 241, 199, 0.4)',
          boxShadow: '0 0 15px rgba(14, 241, 199, 0.3)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 1, 0.6],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
        }}
      />
    </div>
  );
}
