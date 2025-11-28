export const planetVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const planetFragment = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;
  
  // Animated noise
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    float glow = pow(0.6 - dot(vNormal, vec3(0, 0, 1)), 4.0);
    float n = noise(vUv * 10.0 + uTime * 0.15);
    
    vec3 baseColor = vec3(0.0, 0.8, 1.0);
    vec3 finalColor = baseColor + glow * 2.0 + n * 0.25;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
