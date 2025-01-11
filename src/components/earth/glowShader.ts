import * as THREE from "three";

function getAtmosphereMat() {
  const atmosphereShader = {
    uniforms: {
      // c: { value: 0.71 },
      // p: { value: 5.5 },
      c: { value: 0.8 },
      p: { value: 5.5 },
      viewVector: { value: new THREE.Vector3(0, 0, 11) },
    },
    vertexShader: `
    uniform float c;
    uniform float p;
    uniform vec3 viewVector;
    varying float intensity;
    
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vViewPosition = normalize(viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz);
      intensity = pow(c - dot(vNormal, vViewPosition), p);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    varying float intensity;
    void main() {
      vec3 atmosphereColor = vec3(0.10, 0.25, 0.27);
      gl_FragColor = vec4(atmosphereColor * intensity, 1);
    }
  `,
  };
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: atmosphereShader.uniforms,
    vertexShader: atmosphereShader.vertexShader,
    fragmentShader: atmosphereShader.fragmentShader,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return atmosphereMaterial
}
export { getAtmosphereMat };