const logoVertexShader = `
    precision lowp float;

    attribute vec4 aVertexPosition;
    attribute vec2 aVertexTexture;
    attribute vec3 aVertexNormal;
    attribute vec3 aVertexColor;

    uniform vec3 uAmbientLight;
    uniform vec3 uDirectionalLightColorA;
    uniform vec3 uDirectionalLightReverseA;
    uniform vec3 uDirectionalLightColorB;
    uniform vec3 uDirectionalLightReverseB;

    uniform vec3 uCameraPosition;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uNormalMatrix;

    varying vec3 vLighting;
    varying vec3 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
      vec4 vertexNormal = uNormalMatrix * vec4(aVertexNormal, 0.0);

      float directionalLightA = max(dot(vertexNormal.xyz, uDirectionalLightReverseA), 0.0);
      vec3 vLightingA = uDirectionalLightColorA * directionalLightA;

      float directionalLightB = max(dot(vertexNormal.xyz, uDirectionalLightReverseB), 0.0);
      vec3 vLightingB = uDirectionalLightColorB * directionalLightB;

      vLighting = max(uAmbientLight, vLightingA + vLightingB);
      vColor = aVertexColor;
    }
  `;

const logoFragmentShader = `
    precision lowp float;

    varying vec3 vLighting;
    varying vec3 vColor;
    
    void main(void) { 
      gl_FragColor = vec4(vColor * vLighting, 1.0);
    }
  `;
