const QUATERNION_ID = quat.create();
quat.identity(QUATERNION_ID);
const INDEXED = false;
const DAMPENING_FACTOR = 1;
const DRAG_MULTIPLIER = 30;
const INITIAL_ROTATION = 0.2;
// Camera
const L_CAMERA_POSITION = [10, 0.5, 0];
const L_CAMERA_LOOK_AT = [0, 0, 0];
const L_CAMERA_UP = [0.0, 1.0, 0.0];
// Lights
const L_DIRECTIONAL_LIGHT_REVERSE_A = normalize([-1.0, -0.25, -0.5]);
const L_DIRECTIONAL_LIGHT_COLOR_A = rgb(255, 10, 201, 0.7);
const L_DIRECTIONAL_LIGHT_REVERSE_B = normalize([1.0, -0.25, -0.5]);
const L_DIRECTIONAL_LIGHT_COLOR_B = rgb(0, 200, 255, 0.7);
const L_AMBIENT_LIGHT = rgb(30, 33, 47, 0.7);

const logoVertexShader = `
    precision lowp float;

    attribute vec4 aVertexPosition;
    attribute vec2 aVertexTexture;
    attribute vec3 aVertexNormal;

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

    void main(void) {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
      vec4 vertexNormal = uNormalMatrix * vec4(aVertexNormal, 0.0);

      float directionalLightA = max(dot(vertexNormal.xyz, uDirectionalLightReverseA), 0.0);
      vec3 vLightingA = uDirectionalLightColorA * directionalLightA;

      float directionalLightB = max(dot(vertexNormal.xyz, uDirectionalLightReverseB), 0.0);
      vec3 vLightingB = uDirectionalLightColorB * directionalLightB;

      vLighting = max(uAmbientLight, vLightingA + vLightingB);
    }
  `;

const logoFragmentShader = `
    precision lowp float;

    varying vec3 vLighting;
    
    void main(void) { 
      gl_FragColor = vec4(vLighting, 1.0);
    }
  `;

logo_mesh();

function logo_mesh(){
  var canvas = document.querySelector('#logo-mesh');
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
  const outerObject = buildObject(gl, globalMatrices, "mesh/Outer.obj");
  const middleObject = buildObject(gl, globalMatrices, "mesh/Middle.obj");
  const innerObject = buildObject(gl, globalMatrices, "mesh/Inner.obj");

  // Set initial rotation
  quat.fromEuler(outerObject.matrices.rotationQuat, 0, INITIAL_ROTATION, -INITIAL_ROTATION); 
  quat.fromEuler(middleObject.matrices.rotationQuat, -INITIAL_ROTATION, 0, INITIAL_ROTATION);
  quat.fromEuler(innerObject.matrices.rotationQuat, INITIAL_ROTATION, -INITIAL_ROTATION, 0);

  // Use shader program
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, outerObject.matrices.modelViewMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, outerObject.matrices.normalMatrix);
  // Update uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, globalMatrices.projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, globalMatrices.viewMatrix);
  gl.uniform3fv(programInfo.uniformLocations.ambientLight, L_AMBIENT_LIGHT);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightReverseA, L_DIRECTIONAL_LIGHT_REVERSE_A);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightColorA, L_DIRECTIONAL_LIGHT_COLOR_A);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightReverseB, L_DIRECTIONAL_LIGHT_REVERSE_B);
  gl.uniform3fv(programInfo.uniformLocations.directionalLightColorB, L_DIRECTIONAL_LIGHT_COLOR_B);
  gl.uniform3fv(programInfo.uniformLocations.cameraPosition, L_CAMERA_POSITION);
  
  // Setup mouse rotating mesh
  var dragging = false;
  var inertia = 0;
  var lastMousePos = { x: 0, y: 0 };

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
      // Outer object rotation - follows mouse
      quat.fromEuler(outerObject.matrices.rotationQuat, 
          0, 
          delta.x / canvas.width * DRAG_MULTIPLIER,
         -delta.y / canvas.height * DRAG_MULTIPLIER); 
      // Middle object rotation - perpendicular to mouse movement
      quat.fromEuler(middleObject.matrices.rotationQuat, 
         -delta.y / canvas.height * DRAG_MULTIPLIER,
          0, 
          delta.x / canvas.width * DRAG_MULTIPLIER);
      // Inner object rotation
      quat.fromEuler(innerObject.matrices.rotationQuat, 
          delta.y / canvas.height * DRAG_MULTIPLIER,
         -delta.x / canvas.width * DRAG_MULTIPLIER,
          0);
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
  function render(now) {
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

    function drawMesh(object){
      // Bind VAOs
      updateMeshAttributePointers(gl, programInfo, object.buffers);

      // Rotate meshes
      rotateMesh(gl, programInfo, globalMatrices, object);
      inertia *= DAMPENING_FACTOR;

      if(INDEXED)
        gl.drawElements(gl.TRIANGLES, object.mesh.indices.length, gl.UNSIGNED_SHORT, 0);
      else
        gl.drawArrays(gl.TRIANGLES, 0, object.mesh.vertices.length / 3);
    }

    drawMesh(outerObject);
    drawMesh(middleObject);
    drawMesh(innerObject);
    
    // Queue next frame
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function genMeshBuffers(gl, mesh){
  var vertexBuffer = gl.createBuffer();
  var textureBuffer = gl.createBuffer();
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
  
  // Buffer indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(mesh.indices),
      gl.STATIC_DRAW);
  
  return {
    vertexBuffer,
    normalBuffer,
    indexBuffer
  }
}

function genMeshMatrices(globalMatrices){
  var modelMatrix = mat4.create();
  var modelViewMatrix = mat4.create();
  var normalMatrix = mat4.create();
  var rotationQuat = quat.create();
  
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
    rotationQuat
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
}

function rotateMesh(gl, programInfo, globalMatrices, object){
  // Compute rotation
  quat.slerp(object.matrices.rotationQuat, QUATERNION_ID, object.matrices.rotationQuat, DAMPENING_FACTOR);

  // Update model matrices with rotation
  const rotationMatrix = mat4.create();
  mat4.fromQuat(rotationMatrix, object.matrices.rotationQuat);

  // Apply rotation to model matrix
  mat4.mul(object.matrices.modelMatrix, rotationMatrix, object.matrices.modelMatrix);

  // Update normal matrices
  mat4.mul(object.matrices.modelViewMatrix, globalMatrices.viewMatrix, object.matrices.modelMatrix);
  mat4.invert(object.matrices.normalMatrix, object.matrices.modelViewMatrix);
  mat4.transpose(object.matrices.normalMatrix, object.matrices.normalMatrix);

  // Push uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, object.matrices.modelMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, object.matrices.normalMatrix);

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

