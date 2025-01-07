import * as THREE from "three";

function getAtmosphereMat({ rimHex = 0x1db0b8, facingHex = 0x000000 } = {}) {
    const uniforms = {
        color1: { value: new THREE.Color(rimHex) },
        color2: { value: new THREE.Color(facingHex) },
        atmosphereBias: { value: 0.1 },
        atmosphereScale: { value: 2.0 },
        atmospherePower: { value: 6.0 },
    };
    const vs = `
  uniform float atmosphereBias;
  uniform float atmosphereScale;
  uniform float atmospherePower;
  
  varying float vReflectionFactor;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  
    vec3 I = worldPosition.xyz - cameraPosition;
  
    vReflectionFactor = atmosphereBias + atmosphereScale * pow( 1.0 + dot( normalize( I ), worldNormal ), atmospherePower );
  
    gl_Position = projectionMatrix * mvPosition;
  }
  `;
    const fs = `
  uniform vec3 color1;
  uniform vec3 color2;
  
  varying float vReflectionFactor;
  
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
  `;
    const atmosphereMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vs,
        fragmentShader: fs,
        transparent: true,
        depthWrite: false
    });
    return atmosphereMat;
}
export { getAtmosphereMat };
