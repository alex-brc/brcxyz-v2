// Camera
const T_CAMERA_POSITION = [10, -1.5, 4];
const T_CAMERA_LOOK_AT = [-4, 2.5, -4];
const T_CAMERA_UP = [0.0, 0.0, 1.0];

// Directional lights
const T_DIRECTIONAL_LIGHT_REVERSE_A = [5, -5, 0.1];
const T_DIRECTIONAL_LIGHT_COLOR_A = rgb(255, 10, 201, 0.1);
const T_DIRECTIONAL_LIGHT_REVERSE_B = [-5, -3, 0.1];
const T_DIRECTIONAL_LIGHT_COLOR_B = rgb(0, 200, 255, 0.1);

// Colors
const T_BASE_COLOR = [1, 1, 1, 1];
const T_AMBIENT_LIGHT = [0.0, 0.0, 0.0];

// Mesh parameters
const GRID_SIZE = 19;
const NUM_VERTICES_SQ = 35;
const SIDEWAYS_SHIFT_AMOUNT = 0.12;
const MIN_SHIFT = 0.07;
const MAX_SHIFT = 0.08;
const MAX_HEIGHT = 0.55;

// Animation
const V_SHIFT = 0.12;
const V_SHIFT_PS = 1.6; // radians/s, before multiplying by Z value
const SHIFT_THRESH = 0; // only shift vertices with Z > this

const trianglesVertexShader = `
    precision lowp float;

    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;

    uniform float uTime;

    uniform vec3 uCameraPosition;
    uniform mat4 uNormalMatrix;    
    uniform mat4 uModelViewMatrix; 
    uniform mat4 uProjectionMatrix;

    uniform vec3 uAmbientLight;
    uniform vec3 uDirectionalLightColorA;
    uniform vec3 uDirectionalLightReverseA;
    uniform vec3 uDirectionalLightColorB;
    uniform vec3 uDirectionalLightReverseB;

    varying vec3 vLighting;
    varying float vDistanceToCamera;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

      // Get lighting per vertex
      vec4 vertexNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      // Vary light intensity with time for coolness points
      float lightAmplificationA = max(cos(uTime / 2.0 + 20.0), 0.0);
      lightAmplificationA = pow(lightAmplificationA,3.0);
      float directionalLightA = max(dot(vertexNormal.xyz, uDirectionalLightReverseA), 0.0);
      vec3 vLightingA = (1.0 + 0.5 * lightAmplificationA) * uDirectionalLightColorA * directionalLightA;

      float lightAmplificationB = max(sin(uTime / 2.0 + 22.0), 0.0);
      lightAmplificationB = pow(lightAmplificationB,3.0);
      float directionalLightB = max(dot(vertexNormal.xyz, uDirectionalLightReverseB), 0.0);
      vec3 vLightingB = (1.0 + 0.5 * lightAmplificationB) * uDirectionalLightColorB * directionalLightB;

      vLighting = uAmbientLight + vLightingA + vLightingB;

      // Get distance from camera to vertex
      vDistanceToCamera = distance(uCameraPosition, aVertexPosition.xyz);
    }
  `;

const trianglesFragmentShader = `
    precision lowp float;

    varying vec3 vLighting;
    varying float vDistanceToCamera;

    uniform vec3 uCameraPosition;
    uniform vec4 uColor;
    
    void main(void) {
      // "Linear fog" transparency, fade out the farther bits
      float fogStart = 6.0;
      float fogEnd = 18.0;

      float fog = (vDistanceToCamera - fogStart)/(fogEnd - fogStart);
      fog = 1.0 - clamp(fog, 0.0, 1.0);

      gl_FragColor = vec4(uColor.rgb * vLighting * fog, uColor.a * fog);
    }
  `;

purple_triangles();


function purple_triangles() {
  var canvas = document.querySelector('#purple-triangles');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Your browser does not support WebGL');
    // TODO: Redirect to static page.
    return;
  }

  // Compile and link shader
  const shaderProgram = linkShader(gl, trianglesVertexShader, trianglesFragmentShader);
  // Lookup shader memory locations
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal:   gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix:   gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix:    gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix:       gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      cameraPosition:     gl.getUniformLocation(shaderProgram, 'uCameraPosition'),
      color:              gl.getUniformLocation(shaderProgram, 'uColor'),
      ambientLight:       gl.getUniformLocation(shaderProgram, 'uAmbientLight'),  
      time:               gl.getUniformLocation(shaderProgram, 'uTime'),  
      directionalLightReverseA:  gl.getUniformLocation(shaderProgram, 'uDirectionalLightReverseA'),
      directionalLightColorA:    gl.getUniformLocation(shaderProgram, 'uDirectionalLightColorA'),
      directionalLightReverseB:  gl.getUniformLocation(shaderProgram, 'uDirectionalLightReverseB'),
      directionalLightColorB:    gl.getUniformLocation(shaderProgram, 'uDirectionalLightColorB'),
    },
  };

  // Generate mesh
  let mesh = generateMesh();

  // Buffer objects
  const buffers = genBuffers(gl, mesh.vertices, mesh.normals);

  // Make matrices
  const projectionMatrix = mat4.create();
  const modelViewMatrix = mat4.create();
  const normalMatrix = mat4.create();

  // Define perspective matrix
  mat4.perspective(
      projectionMatrix,
      45 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
      0.1,
      100.0);

  // Build camera position, orientation
  mat4.lookAt(
      modelViewMatrix,
      T_CAMERA_POSITION,
      T_CAMERA_LOOK_AT,
      T_CAMERA_UP
  );

  mat4.invert(
      normalMatrix,
      modelViewMatrix);
  mat4.transpose(
      normalMatrix,
      normalMatrix);

  // Update and bind VAO
  updateAttributePointers(gl, programInfo, buffers.vertices[0], buffers.normals[0]);

  // Use shader program
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  gl.uniform4fv(
      programInfo.uniformLocations.color,
      T_BASE_COLOR // red
  );
  gl.uniform3fv(
      programInfo.uniformLocations.ambientLight,
      T_AMBIENT_LIGHT
  );
  gl.uniform3fv(
      programInfo.uniformLocations.directionalLightReverseA,
      T_DIRECTIONAL_LIGHT_REVERSE_A
  );
  gl.uniform3fv(
      programInfo.uniformLocations.directionalLightColorA,
      T_DIRECTIONAL_LIGHT_COLOR_A
  );
  gl.uniform3fv(
      programInfo.uniformLocations.directionalLightReverseB,
      T_DIRECTIONAL_LIGHT_REVERSE_B
  );
  gl.uniform3fv(
      programInfo.uniformLocations.directionalLightColorB,
      T_DIRECTIONAL_LIGHT_COLOR_B
  );
  gl.uniform3fv(
      programInfo.uniformLocations.cameraPosition,
      T_CAMERA_POSITION
  );
  
  // Loop renderer forever
  let deltaT = 0;
  let currentBuffer = 0;
  function render(now) {
    // Get now in seconds
    now *= 0.001;

    // Check whether window was resized
    if(updateCanvasSize(gl)){
      // Update viewport
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Update perspective matrix for when the window is resized
      mat4.perspective(
          projectionMatrix,
          45 * Math.PI / 180,
          gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
          0.1,
          100.0);

      // Push the uniform
      gl.uniformMatrix4fv(
          programInfo.uniformLocations.projectionMatrix,
          false,
          projectionMatrix);
    }

    // Shift vertices and recompute normals
    let newVertices = [];
    for(let i = 0; i < mesh.vertices.length; i += 3){
      if(mesh.vertices[i+2] > SHIFT_THRESH){
        let currentTheta = mesh.vertices[i+2] * (1321.0 + now * V_SHIFT_PS);
        newVertices.push(mesh.vertices[i]);
        newVertices.push(mesh.vertices[i+1]);
        newVertices.push(mesh.vertices[i+2] + V_SHIFT * Math.cos(currentTheta));
      }else{

        newVertices.push(mesh.vertices[i]);
        newVertices.push(mesh.vertices[i+1]);
        newVertices.push(mesh.vertices[i+2]);
      }
    }
    let newNormals = computeNormalsUnindexed(newVertices, false);

    // Update time uniform
    gl.uniform1f(programInfo.uniformLocations.time, now);

    // Draw the scene from the previous buffer
    drawScene(gl, mesh.vertices.length / 3);

    // Triple buffer
    currentBuffer = (currentBuffer + 1) % 3;
    // Buffer the new data
    bufferData(gl, programInfo,
      buffers.vertices[currentBuffer], newVertices, 
      buffers.normals[currentBuffer], newNormals);

    // Queue next frame
    requestAnimationFrame(render);
    then = now;
  }
  requestAnimationFrame(render);
}


function genBuffers(gl, vertices, normals) {
  // Create 3 buffers each for vertices and normals
  let vertexBuffers = [];
  let normalBuffers = [];
  for(let i = 0; i < 3; i++){
    // Make and fill all buffers
    vertexBuffers.push(gl.createBuffer());
    normalBuffers.push(gl.createBuffer());

    // Buffer vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.DYNAMIC_DRAW);

    // Buffer normals
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[i]);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(normals),
        gl.DYNAMIC_DRAW);
  }

  return {
    vertices: vertexBuffers,
    normals: normalBuffers,
  };
}

function drawScene(gl, numElements) {
  gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to transparent
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, numElements);
}

function bufferData(gl, programInfo, vertexBuffer, vertices, normalBuffer, normals) {
  // Buffer vertex data
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER,
      0,
      new Float32Array(vertices));

  // Buffer normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER,
      0,
      new Float32Array(normals));

  // We need to update VAOs
  updateAttributePointers(gl, programInfo, vertexBuffer, normalBuffer);
}

function updateAttributePointers(gl, programInfo, vertexBuffer, normalBuffer){
  // Bind VERTEX POSITION ATTRIBUTE
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);

  // Bind VERTEX NORMAL ATTRIBUTE
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      3,
      gl.FLOAT,
      false,
      0,
      0);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexNormal);
}

/**
 * Generate a randomised triangle mesh for the canvas
 */
function generateMesh(){
  // Generate vertices
  const points = makePoints();
  // Generate Delaunay triangles
  const triangles = makeTriangles(points.points2d).triangles;

  // We need sharp triangles, so indexing isn't really helpful here
  // Gather vertices by triangles
  const vertices = gather(points.points3d, triangles).flat();

  // Now compute vertex normals
  const normals = computeNormalsUnindexed(vertices);

  // Return vertices and normals
  return {
    vertices: vertices,
    normals: normals,
  };
}



// Mesh Utils
function makePoints() {
  // Create a grid of points
  let grid = [];
  let vertices = [];
  const distance = GRID_SIZE / (NUM_VERTICES_SQ - 1);
  const centeringFactor = -1.0 * GRID_SIZE / 2;
  const delta = MAX_SHIFT - MIN_SHIFT;

  var shift = 0;
  let x, y, z, x2, y2, r, t;
  for (x = 0; x <= GRID_SIZE; x += distance){
    for (y = 0; y <= GRID_SIZE; y += distance) {
      // Start with a vector pointing towards positive x
      t = MIN_SHIFT + delta * Math.random();
      // Rotate by random [0, 2pi] radians
      r = 2 * Math.PI * Math.random();
      // Make points shifted by random amount
      x2 = x + t * Math.cos(r) + centeringFactor;
      y2 = y + t * Math.sin(r) + centeringFactor;
      // Also generate random height
      z = MAX_HEIGHT * Math.random();
      grid.push([x2, y2]);
      vertices.push([x2, y2 + shift, z]);
    }
    shift += SIDEWAYS_SHIFT_AMOUNT
  }
  return {
      points2d: grid,
      points3d: vertices,
  };
}
function makeTriangles(points){
  return Delaunator.from(points);
}

