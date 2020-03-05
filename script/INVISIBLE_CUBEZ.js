const INDEXED = true;
const DAMPENING_FACTOR = 1;
// Waterfall 
const RANDOMISER_CAP_ROTATION = 0.5;
const RANDOMISER_CAP_POSITION_X = 0;
const RANDOMISER_CAP_POSITION_Z = 20;
const RANDOMISER_MIN_TRANSLATION = 0.001;
const RANDOMISER_MAX_TRANSLATION = 0.01;
const STARTING_POSITION_Y = 1;
const RESET_POSITION_Y = -100;
const OBJECT_POOL_SIZE = 10;
// Camera
const L_CAMERA_POSITION = [25, 0, 0];
const L_CAMERA_LOOK_AT = [0, 0, 0];
const L_CAMERA_UP = [0.0, 1.0, 0.0];
// Lights
const L_DIRECTIONAL_LIGHT_REVERSE_A = normalize([-1.0, 0.5, 2.0]);
const L_DIRECTIONAL_LIGHT_COLOR_A = rgb(255, 255, 255, 0.0);
const L_DIRECTIONAL_LIGHT_REVERSE_B = normalize([1.0, 0.5, 2.0]);
const L_DIRECTIONAL_LIGHT_COLOR_B = rgb(255, 255, 255, 0.0);
const L_AMBIENT_LIGHT = rgb(255, 255, 255, 1);

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

logo_mesh();

function logo_mesh(){
  var canvas = document.querySelector('#title-webgl');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Your browser does not support WebGL');
    // TODO: Redirect to static page.
    return;
  }
  
  // Compile and link shader
  const shaderProgram = linkShader(gl, logoVertexShader, logoFragmentShader);
  
  // Lookup shader memory locations
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition:  gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexTexture:   gl.getAttribLocation(shaderProgram, 'aVertexTexture'),
      vertexNormal:    gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      vertexColor:     gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix:          gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelMatrix:               gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
      viewMatrix:                gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
      normalMatrix:              gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      cameraPosition:            gl.getUniformLocation(shaderProgram, 'uCameraPosition'),
      ambientLight:              gl.getUniformLocation(shaderProgram, 'uAmbientLight'),
      directionalLightReverseA:  gl.getUniformLocation(shaderProgram, 'uDirectionalLightReverseA'),
      directionalLightColorA:    gl.getUniformLocation(shaderProgram, 'uDirectionalLightColorA'),
      directionalLightReverseB:  gl.getUniformLocation(shaderProgram, 'uDirectionalLightReverseB'),
      directionalLightColorB:    gl.getUniformLocation(shaderProgram, 'uDirectionalLightColorB'),
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
  const cubeObject = buildObject(gl, globalMatrices, "mesh/Cube.obj");
  // Make copies with unique matrices
  let objectPool = [];
  for(let i = 0; i < OBJECT_POOL_SIZE; i++){
    objectPool.push(makeCopy(cubeObject, globalMatrices));
  }

  // Use shader program
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, cubeObject.matrices.modelViewMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, cubeObject.matrices.normalMatrix);
  // Update uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, globalMatrices.projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, globalMatrices.viewMatrix);
  gl.uniform3fv(programInfo.uniformLocations.ambientLight, L_AMBIENT_LIGHT);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightReverseA, L_DIRECTIONAL_LIGHT_REVERSE_A);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightColorA, L_DIRECTIONAL_LIGHT_COLOR_A);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightReverseB, L_DIRECTIONAL_LIGHT_REVERSE_B);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightColorB, L_DIRECTIONAL_LIGHT_COLOR_B);
  gl.uniform3fv(programInfo.uniformLocations.cameraPosition, L_CAMERA_POSITION);
  
  var then, deltaT = 0;
  // Loop renderer forever
  function render(now) {
    deltaT = now - then;
    then = now;
    // Check whether window was resized
    if(updateCanvasSize(gl)){
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
      gl.uniformMatrix4fv(
          programInfo.uniformLocations.projectionMatrix,
          false,
          globalMatrices.projectionMatrix);
    }

    // Draw the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to transparent
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    objectPool.forEach(function(obj){
      // Rotate object
      rotateObject(obj);

      // Translate object
      // translateObject(obj);

      
      // Update normal matrices
      mat4.mul(obj.matrices.modelViewMatrix, globalMatrices.viewMatrix, obj.matrices.modelMatrix);
      mat4.invert(obj.matrices.normalMatrix, obj.matrices.modelViewMatrix);
      mat4.transpose(obj.matrices.normalMatrix, obj.matrices.normalMatrix);

      // Push uniforms
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, obj.matrices.modelMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, obj.matrices.normalMatrix);
      
      // Bind VAOs
      updateMeshAttributePointers(gl, programInfo, obj.buffers);

      if(INDEXED)
        gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_SHORT, 0);
      else
        gl.drawArrays(gl.TRIANGLES, 0, obj.mesh.vertices.length / 3);

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
  var translationVec = vec3.create();

  // Set initial position
  var rx = -Math.random()*RANDOMISER_CAP_POSITION_X;
  var rz = (Math.random()-0.5)*2*RANDOMISER_CAP_POSITION_Z;
  mat4.translate(matrices.modelMatrix, matrices.modelMatrix, vec3.fromValues(rx, STARTING_POSITION_Y, rz));

  // Set rotation amount
  rotation = {
    axis: vec3.create(),
    angle: Math.random() * RANDOMISER_CAP_ROTATION
  };
  vec3.random(rotation.axis);

  // Set translation amount
  var rt = Math.random()*(RANDOMISER_MAX_TRANSLATION-RANDOMISER_MIN_TRANSLATION) + RANDOMISER_MAX_TRANSLATION;
  translationVec = vec3.fromValues(0, rt, 0);

  return {
    mesh,
    buffers,
    matrices,
    rotation,
    translationVec
  };
}

/** Spherical lerp continuously based on initial rotation */
function rotateObject(object){
  // First, translate to origin 
  var toOrigin = vec3.create();
  var fromOrigin = vec3.create();
  mat4.getTranslation(fromOrigin, object.matrices.modelMatrix);
  vec3.scale(toOrigin, fromOrigin, -1.0);
  mat4.translate(object.matrices.modelMatrix, object.matrices.modelMatrix, toOrigin);
  
  // Compute rotation matrix
  const rotationMatrix = mat4.create();
  
  mat4.fromRotation(rotationMatrix, object.rotation.axis, object.rotation.angle);

  // Apply rotation to model matrix
  mat4.mul(object.matrices.modelMatrix, object.matrices.modelMatrix, rotationMatrix);

  // Translate to initial position
  mat4.translate(object.matrices.modelMatrix, object.matrices.modelMatrix, fromOrigin);
  
}

function translateObject(object, rotationMatrix){
  // Take translation vectort to object's coordinate space\
  const objectRotation = quat.create();
  mat4.getRotation(objectRotation, object.matrices.modelMatrix);
  
  // 
  

  // Compute translation matrix
  const translationMatrix = mat4.create();
  mat4.fromTranslation(translationMatrix, object.translationVec);

  // Apply translation matrixx
  mat4.mul(object.matrices.modelMatrix, object.matrices.modelMatrix, translationMatrix);

}

function genMeshBuffers(gl, mesh){
  var vertexBuffer = gl.createBuffer();
  var colorBuffer = gl.createBuffer();
  var normalBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();
  
  // Buffer vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(mesh.vertices),
      gl.STATIC_DRAW);

  // Buffer normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(mesh.normals),
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
    normalBuffer,
    colorBuffer,
    indexBuffer
  }
}

function genMeshMatrices(globalMatrices){
  var modelMatrix = mat4.create();
  var modelViewMatrix = mat4.create();
  var normalMatrix = mat4.create();
  
  // Define model matrices
  mat4.identity(modelMatrix);
  
  // Build the normal matrices
  mat4.mul(modelViewMatrix, globalMatrices.viewMatrix, modelMatrix);
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  return {
    modelMatrix,
    modelViewMatrix,
    normalMatrix,
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
  
  // Bind VERTEX NORMAL ATTRIBUTE
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      3,
      gl.FLOAT,
      false,
      0,
      0);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexNormal);
      
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

function buildObject(gl, globalMatrices, meshString){
  const mesh = readMeshFile(meshString, INDEXED);
  const buffers = genMeshBuffers(gl, mesh);
  const matrices = genMeshMatrices(globalMatrices);

  return {
    mesh,
    buffers,
    matrices
  };
}

