const titleVertexShader = `
    precision highp float;

    attribute vec4 aVertexPosition;
    attribute vec2 aVertexTexture;
    attribute vec3 aVertexColor;

    uniform vec3 uAmbientLight;

    uniform vec3 uCameraPosition;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;

    varying vec3 vLighting;
    varying vec3 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;

      vLighting = uAmbientLight;
      vColor = aVertexColor;
    }
  `;

const titleFragmentShader = `
    precision highp float;

    varying vec3 vLighting;
    varying vec3 vColor;
    
    void main(void) { 
      gl_FragColor = vec4(vColor * vLighting, 1.0);
    }
  `;
