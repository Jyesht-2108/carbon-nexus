export const atmosphereVertex = `
  varying vec3 vNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragment = `
  varying vec3 vNormal;
  
  void main() {
    float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1)), 6.0);
    gl_FragColor = vec4(0.0, 1.0, 2.0, 1.0) * intensity;
  }
`;
