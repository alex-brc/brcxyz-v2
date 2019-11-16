const DAMPENING_FACTOR = 1;
const DRAG_MULTIPLIER = 80;

// Camera
const L_CAMERA_POSITION = [10, 0.5, 0];
const L_CAMERA_LOOK_AT = [0, 0.5, 0];
const L_CAMERA_UP = [0.0, 1.0, 0.0];

// Directional lights
const L_POINT_LIGHT_SOURCE = [-5, 10, 3];
// const L_POINT_LIGHT_COLOR = rgb(240, 0, 144, 0.45);
const L_POINT_LIGHT_COLOR = rgb(255, 255, 255, 0.80);

// Colors
// const L_AMBIENT_LIGHT = rgb(240, 0, 144, 0.15);
const L_AMBIENT_LIGHT = rgb(255, 255, 255, 0.15);

const lighterVertexShader = `
    precision lowp float;

    attribute vec4 aVertexPosition;
    attribute vec2 aVertexTexture;
    attribute vec3 aVertexNormal;
    attribute vec3 aVertexColor;
    attribute vec3 aAmbientOcclusion;

    uniform vec3 uCameraPosition;
    uniform mat4 uNormalMatrix;    
    uniform mat4 uModelViewMatrix; 
    uniform mat4 uProjectionMatrix;

    varying vec3 vertexNormal;
    varying vec3 vertexColor;
    varying vec3 ambientOcclusion;
    varying vec3 fragmentPosition;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      
      fragmentPosition = vec3(uModelViewMatrix * aVertexPosition);  
      vertexNormal = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
      vertexColor = aVertexColor;
      ambientOcclusion = aAmbientOcclusion;
    }
  `;

const lighterFragmentShader = `
    precision lowp float;

    varying vec3 vertexNormal;
    varying vec3 vertexColor; 
    varying vec3 ambientOcclusion;
    varying vec3 fragmentPosition;

    uniform vec3 uCameraPosition;

    uniform vec3 uAmbientLight;
    uniform vec3 uPointLightColor;
    uniform vec3 uPointLightSource;
    
    void main(void) {

      // Diffuse lighting 
      vec3 lightDir = normalize(uPointLightSource);
      float diffuseValue = max(dot(vertexNormal, lightDir), 0.0);
      vec3 diffuseLighting = diffuseValue * uPointLightColor;

      vec3 baseColor = vertexColor * ambientOcclusion;
      vec3 totalLighting = baseColor * (uAmbientLight + diffuseLighting);
  
      gl_FragColor = vec4(totalLighting, 1.0);
    }
  `;

lighter_mesh();

function lighter_mesh(){
  var canvas = document.querySelector('#lighter-mesh');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Your browser does not support WebGL');
    // TODO: Redirect to static page.
    return;
  }
  
  // Compile and link shader
  const shaderProgram = linkShader(gl, lighterVertexShader, lighterFragmentShader);
  // Lookup shader memory locations
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition:      gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexTexture:       gl.getAttribLocation(shaderProgram, 'aVertexTexture'),
      vertexNormal:        gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      vertexColor:         gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      ambientOcclusion:    gl.getAttribLocation(shaderProgram, 'aAmbientOcclusion'),
    },
    uniformLocations: {
      projectionMatrix:   gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix:    gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix:       gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      cameraPosition:     gl.getUniformLocation(shaderProgram, 'uCameraPosition'),
      ambientLight:       gl.getUniformLocation(shaderProgram, 'uAmbientLight'),
      pointLightSource:   gl.getUniformLocation(shaderProgram, 'uPointLightSource'),
      pointLightColor:    gl.getUniformLocation(shaderProgram, 'uPointLightColor'),
    },
  };
  
  // Read mesh OBJ
  let mesh = readMeshFile("mesh/lighter_colored.obj", "mesh/lighter.aoc");
  // Buffer objects
  const buffers = genMeshBuffers(
    gl, 
    mesh.vertices, 
    mesh.colors, 
    mesh.aoc, 
    mesh.normals, 
    mesh.indices);
  
  // Update and bind VAO
  updateMeshAttributePointers(
    gl, 
    programInfo, 
    buffers.vertexBuffer, 
    buffers.colorBuffer, 
    buffers.aocBuffer, 
    buffers.normalBuffer);
  
  // Make matrices
  const projectionMatrix = mat4.create();
  const modelViewMatrix = mat4.create();
  const modelMatrix = mat4.create();
  const viewMatrix = mat4.create();
  const normalMatrix = mat4.create();
  
  // Define model matrix, for now identity
  mat4.identity(modelMatrix);
  
  // Define perspective matrix
  mat4.perspective(
      projectionMatrix,
      45 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
      0.1,
      350.0);

  // Build camera position, orientation
  mat4.lookAt(
      viewMatrix,
      L_CAMERA_POSITION,
      L_CAMERA_LOOK_AT,
      L_CAMERA_UP
  );
  
  // Model view is view matrix * model matrix which is Id
  mat4.copy(modelViewMatrix, viewMatrix);
  
  // Build the normal matrix
  mat4.invert(
      normalMatrix,
      modelViewMatrix);
  mat4.transpose(
      normalMatrix,
      normalMatrix);

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
  gl.uniform3fv(
      programInfo.uniformLocations.ambientLight,
      L_AMBIENT_LIGHT
  );
  gl.uniform3fv(
      programInfo.uniformLocations.pointLightSource,
      L_POINT_LIGHT_SOURCE
  );
  gl.uniform3fv(
      programInfo.uniformLocations.pointLightColor,
      L_POINT_LIGHT_COLOR
  );
  gl.uniform3fv(
      programInfo.uniformLocations.cameraPosition,
      L_CAMERA_POSITION
  );
  
  // Setup mouse rotating mesh
  var dragging = false;
  var inertia = 0;
  var lastMousePos = { x: 0, y: 0 };
  var rotationQuat = quat.create();
  var quatId = quat.create();
  quat.identity(quatId);
  function rotateMesh(){
    // Update model matrix with rotation
    mat4.fromQuat(rotationMatrix, rotationQuat);
    mat4.mul(modelMatrix, rotationMatrix, modelMatrix);
    mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);

    // Update normal matrix
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Push uniforms
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  }

  function mouseDown(e) {
    dragging = true;
  }
  
  function mouseUp(e) {
    dragging = false;
    inertia = 1;
  }
  
  function mouseMove(e) {
    var delta = {
      x: e.offsetX-lastMousePos.x,
      y: e.offsetY-lastMousePos.y
    };

    if(dragging) {
      quat.fromEuler(
        rotationQuat, 
          0, 
          delta.x * Math.PI / canvas.width * DRAG_MULTIPLIER,
         -delta.y * Math.PI / canvas.height * DRAG_MULTIPLIER);
      
      rotateMesh();
    }

    lastMousePos = { x: e.offsetX, y: e.offsetY };
  }
  
  // Desktop events
  $(canvas).on('mousedown', mouseDown);
  $(document).on('mouseup', mouseUp);
  $(canvas).on('mousemove', mouseMove);
  // Mobile events
  $(canvas).on('touchstart', mouseDown);
  $(document).on('touchend', mouseUp);
  $(canvas).on('touchmove', mouseMove);
  
  // Loop renderer forever
  let deltaT = 0;
  let then = 0;
  let currentBuffer = 0;
  let rotationMatrix = mat4.create();
  function render(now) {
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
          350.0);

      // Push the uniform
      gl.uniformMatrix4fv(
          programInfo.uniformLocations.projectionMatrix,
          false,
          projectionMatrix);
    }
    
    if(inertia > 0.0001){
      rotateMesh();
      inertia *= DAMPENING_FACTOR;
      quat.slerp(rotationQuat, quatId, rotationQuat, DAMPENING_FACTOR);
    }
    
    // Draw the scene
    drawMesh(gl, mesh.indices.length);

    // Queue next frame
    requestAnimationFrame(render);
    deltaT = (now - then) / 1000;
    then = now;
  }
  requestAnimationFrame(render);
}

function drawMesh(gl, numElements) {
  gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to transparent
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0);
}

function genMeshBuffers(gl, vertices, colors, aoc, normals, indices){
  var vertexBuffer = gl.createBuffer();
  var colorBuffer = gl.createBuffer();
  var aocBuffer = gl.createBuffer();
  var textureBuffer = gl.createBuffer();
  var normalBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();
  
  // Buffer vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.STATIC_DRAW);
  
  // Buffer vertex colors
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(colors),
      gl.STATIC_DRAW);
  
  // Buffer ambient occlusion values
  gl.bindBuffer(gl.ARRAY_BUFFER, aocBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(aoc),
      gl.STATIC_DRAW);

  // Buffer normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(normals),
      gl.STATIC_DRAW);
  
  // Buffer indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW);
  
  return {
    vertexBuffer,
    colorBuffer,
    aocBuffer,
    normalBuffer,
    indexBuffer
  }
}

function updateMeshAttributePointers(gl, programInfo, vertexBuffer, colorBuffer, aocBuffer, normalBuffer, textureBuffer){
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
  
  // Bind VERTEX COLOR ATTRIBUTE
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      3,
      gl.FLOAT,
      false,
      0,
      0);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexColor);
  
  // Bind AMBIENT OCCLUSION ATTRIBUTE
  gl.bindBuffer(gl.ARRAY_BUFFER, aocBuffer);
  gl.vertexAttribPointer(
      programInfo.attribLocations.ambientOcclusion,
      3,
      gl.FLOAT,
      false,
      0,
      0);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.ambientOcclusion);

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