export const scanlineVertex = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const scanlineFragment = `
  uniform float uTime;
  varying vec2 vUv;
  
  void main() {
    float line = sin(vUv.y * 200.0 + uTime * 10.0) * 0.1;
    vec3 color = vec3(0.0, 0.8, 1.0) * line;
    gl_FragColor = vec4(color, 0.15);
  }
`;
