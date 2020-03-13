const DAMPENING_FACTOR = 1;
// Waterfall 
const ROTATION_SPEED = [0.3, 1];
const INITIAL_POSITION_Z = [-20, 20]; // Sideways
const INITIAL_POSITION_Y = [25, 50]; // Up
const INITIAL_POSITION_X = [-30, 0]; // Forward

const FALL_SPEED = [-3, -1];
const CULL_POSITION_Y = -25;
const OBJECT_POOL_SIZE = 25;
// Camera
const L_CAMERA_POSITION = [25, 0, 0];
const L_CAMERA_LOOK_AT = [0, 0, 0];
const L_CAMERA_UP = [0.0, 1.0, 0.0];
// Lights
const L_AMBIENT_LIGHT = rgb(255, 255, 255, 1);

const cubeString = `
v 1.000000 1.000000 -1.000000 0.403922 0.568627 0.403922
v 1.000000 -1.000000 -1.000000 0.403922 0.568627 0.403922
v 1.000000 1.000000 1.000000 0.886275 0.694118 0.231373
v 1.000000 -1.000000 1.000000 0.886275 0.694118 0.231373
v -1.000000 1.000000 -1.000000 0.403922 0.568627 0.403922
v -1.000000 -1.000000 -1.000000 0.403922 0.568627 0.403922
v -1.000000 1.000000 1.000000 0.886275 0.694118 0.231373
v -1.000000 -1.000000 1.000000 0.992157 0.364706 0.321569
v -1.000000 -1.000000 -1.000000 0.886275 0.694118 0.231373
v -1.000000 -1.000000 -1.000000 0.992157 0.364706 0.321569
v -1.000000 -1.000000 1.000000 0.886275 0.694118 0.231373
v -1.000000 -1.000000 1.000000 0.403922 0.568627 0.403922
v 1.000000 -1.000000 -1.000000 0.992157 0.364706 0.321569
v 1.000000 -1.000000 -1.000000 0.886275 0.694118 0.231373
v 1.000000 1.000000 -1.000000 0.886275 0.694118 0.231373
v 1.000000 1.000000 -1.000000 0.992157 0.364706 0.321569
v -1.000000 1.000000 1.000000 0.403922 0.568627 0.403922
v -1.000000 1.000000 1.000000 0.992157 0.364706 0.321569
v 1.000000 1.000000 1.000000 0.403922 0.568627 0.403922
v 1.000000 1.000000 1.000000 0.992157 0.364706 0.321569
v 1.000000 -1.000000 1.000000 0.403922 0.568627 0.403922
v 1.000000 -1.000000 1.000000 0.992157 0.364706 0.321569
v -1.000000 1.000000 -1.000000 0.886275 0.694118 0.231373
v -1.000000 1.000000 -1.000000 0.992157 0.364706 0.321569

f 24 20 16
f 19 12 21
f 7 9 11
f 13 8 10
f 15 4 14
f 5 2 6
f 24 18 20
f 19 17 12
f 7 23 9
f 13 22 8
f 15 3 4
f 5 1 2
`;
const titleVertexShader = `
    precision highp float;

    attribute vec4 aVertexPosition;
    attribute vec2 aVertexTexture;
    attribute vec3 aVertexColor;

    uniform vec3 uAmbientLight;

    uniform vec3 uCameraPosition;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;

    varying vec3 vLighting;
    varying vec3 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

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

// Entry point
title_webgl();

function title_webgl(){
  var canvas = document.querySelector('#title-webgl');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Your browser does not support WebGL');
    // TODO: Redirect to static page.
    return;
  }
  
  // Compile and link shader
  const shaderProgram = linkShader(gl, titleVertexShader, titleFragmentShader);
  
  // Lookup shader memory locations
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition:  gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexTexture:   gl.getAttribLocation(shaderProgram, 'aVertexTexture'),
      vertexColor:     gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix:          gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix:           gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      cameraPosition:            gl.getUniformLocation(shaderProgram, 'uCameraPosition'),
      ambientLight:              gl.getUniformLocation(shaderProgram, 'uAmbientLight'),
    },
  };
  
  // Global matrices
  const globalMatrices = {
    projectionMatrix: mat4.create(),
    viewMatrix: mat4.create(),
  };

  // Define perspective matrix
  mat4.perspective(
      globalMatrices.projectionMatrix,
      45 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
      0.1,
      350.0);

  // Build camera position, orientation
  mat4.lookAt(
      globalMatrices.viewMatrix,
      L_CAMERA_POSITION,
      L_CAMERA_LOOK_AT,
      L_CAMERA_UP
  );

  // Construct objects
  const cubeObject = buildObject(gl, globalMatrices, cubeString);
  console.log(cubeObject);
  // Make copies with unique matrices
  let objectPool = [];
  for(let i = 0; i < OBJECT_POOL_SIZE; i++){
    objectPool.push(makeCopy(cubeObject, globalMatrices));
  }

  // Use shader program
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, globalMatrices.projectionMatrix);
  gl.uniform3fv(programInfo.uniformLocations.ambientLight, L_AMBIENT_LIGHT);
  
  var then, delta = 0;
  // Loop renderer forever
  function render(now) {
    delta = (now - then) / 1000; // in seconds
    then = now;
    // Check whether window was resized
    if(canvasSizeChanged(gl)){
      // Update viewport
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Update perspective matrix for when the window is resized
      mat4.perspective(
          globalMatrices.projectionMatrix,
          45 * Math.PI / 180,
          gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
          0.1,
          350.0);

      // Push the uniform
      gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, globalMatrices.projectionMatrix);
    }

    // Draw the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to transparent
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    objectPool.forEach(function(obj){
      // Move object
      animate(obj, delta, now);

      // Update modelView matrices
      mat4.mul(obj.matrices.modelViewMatrix, globalMatrices.viewMatrix, obj.matrices.modelMatrix);

      // Push uniforms
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, obj.matrices.modelViewMatrix);
      
      // Bind VAOs
      updateMeshAttributePointers(gl, programInfo, obj.buffers);

      if(!isNaN(delta))
        gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_SHORT, 0);
      

    });
    

    // Queue next frame
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function makeCopy(object, globalMatrices){
  mesh = object.mesh;
  buffers = object.buffers;
  matrices = genMeshMatrices(globalMatrices);
  var rotation = {
    modifier: 0, // angle
    axis: vec3.create(),
    currentAngle: 0,
    current: quat.create()
  };
  var translation = {
    modifier: vec3.create(),
    initial: vec3.create(),
    current: vec3.create()
  };

  // Set initial position
  translation.initial = vec3.fromValues(
    random(INITIAL_POSITION_X), 
    random(INITIAL_POSITION_Y),
    random(INITIAL_POSITION_Z));
  vec3.copy(translation.current, translation.initial);

  // Set rotation speed
  rotation.modifier = random(ROTATION_SPEED);

  // Set rotation axis
  vec3.random(rotation.axis);

  // Set translation amount
  translation.modifier = vec3.fromValues(
    0, 
    random(FALL_SPEED),
    0);
    
  return {
    mesh,
    buffers,
    matrices,
    rotation,
    translation
  };
}

/** Spherical lerp continuously based on initial rotation */
function animate(object, delta, now){
  if(isNaN(delta))
    return;

  // If it reaches a certain height, reset
  if(object.translation.current[1] < CULL_POSITION_Y)
    vec3.copy(object.translation.current, object.translation.initial);

  // Compute translation this frame
  object.translation.current[1] += object.translation.modifier[1] * delta

  // Compute rotation this frame
  object.rotation.currentAngle = (object.rotation.currentAngle + object.rotation.modifier * delta) % 360;
  quat.setAxisAngle(object.rotation.current, object.rotation.axis, object.rotation.currentAngle);
  
  // Compute rotation/translation matrix
  mat4.fromRotationTranslation(
    object.matrices.modelMatrix, 
    object.rotation.current, 
    object.translation.current);
}

function genMeshBuffers(gl, mesh){
  var vertexBuffer = gl.createBuffer();
  var colorBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();
  
  // Buffer vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(mesh.vertices),
      gl.STATIC_DRAW);

  // Buffer vertex colors
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(mesh.colors),
      gl.STATIC_DRAW);
  
  // Buffer indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(mesh.indices),
      gl.STATIC_DRAW);
  
  return {
    vertexBuffer,
    colorBuffer,
    indexBuffer
  }
}

function genMeshMatrices(globalMatrices){
  var modelMatrix = mat4.create();
  var modelViewMatrix = mat4.create();
  
  // Define model matrices
  mat4.identity(modelMatrix);
  
  // Build the model matrices
  mat4.mul(modelViewMatrix, globalMatrices.viewMatrix, modelMatrix);

  return {
    modelMatrix,
    modelViewMatrix,
  };
}

function updateMeshAttributePointers(gl, programInfo, buffers){
  // Bind VERTEX POSITION ATTRIBUTE
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      3,
      gl.FLOAT,
      false,
      0,
      0);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexColor);
}

function buildObject(gl, globalMatrices, objectString){
  const mesh = customParseOBJ(objectString);
  const buffers = genMeshBuffers(gl, mesh);
  const matrices = genMeshMatrices(globalMatrices);

  return {
    mesh,
    buffers,
    matrices
  };
}

