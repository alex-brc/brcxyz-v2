// Copied from gl-matrix.js, modified slightly.
function normalize(a){
  var out = [0, 0, 0];
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
  }
  return out;
}

function powerOf2(value) {
  return (value & (value - 1)) == 0;
}

/**
 * Sequential gather by indexArray from sourceArray.
 *
 * @param indexArray
 * @param sourceArray
 */
function gather(sourceArray, indexArray){
  let result = [];
  indexArray.forEach(function(e){
    result.push(sourceArray[e]);
  });
  return result;
}

/**
 * Sequential gather by indexArray from sourceArray, 
 * where sourceArray is flat
 *
 * @param indexArray
 * @param sourceArray
 */
function flatGather(sourceArray, indexArray){
  let result = [];
  indexArray.forEach(function(e){
    result.push(sourceArray[3*e]);
    result.push(sourceArray[3*e + 1]);
    result.push(sourceArray[3*e + 2]);
  });
  return result;
}

/**
 * Compute face normals for a set of indexed vertices
 *
 * @param vertices
 * @param indices
 * @returns {Array}
 */
function computeNormalsIndexed(vertices, indices){
  let normalsMultiple = [];
  for(let i = 0; i < vertices.length; i++){
    normalsMultiple.push([]);
  }
  let n;
  for(let i = 0; i < indices.length; i += 3){
    // Compute normals for this surface
    // All triangle elements should be in counter-clockwise direction
    n = surfaceNormal(
      vertices[indices[i]], 
      vertices[indices[i+1]], 
      vertices[indices[i+2]]);

    // Collect all normals for each vertex
    for(let j = 0; j < 3; j++)
      normalsMultiple[indices[i+j]].push(n);
  }

  // Average per-vertex normals
  let normals = [], average;
  normalsMultiple.forEach(function(e){
    average = [0,0,0];
    e.forEach(function(ep){
      average = vectorAdd(average, ep);
    });
    average = vectorScalarDiv(average, e.length);
    normals.push(average);
  });

  return normals;
}

/**
 * Compute normals for unindexed vertices, considering 3 consecutive
 * vertices to be a triangle.
 * @param vertices
 */
function computeNormalsUnindexed(vertices, yFlip){
  var flip = 1;
  if(yFlip)
    flip = -1;

  if(vertices.length % 3 !== 0)
    return null;

  let normals = [];
  let n;
  for(let i = 0; i < vertices.length; i += 9){
    // Find surface normal of current triangle
    n = surfaceNormal(
      [vertices[i], flip * vertices[i+1], vertices[i+2]],       
      [vertices[i+3], flip * vertices[i+4], vertices[i+5]],   
      [vertices[i+6], flip * vertices[i+7], vertices[i+8]]);         
    for(let j = 0; j < 3; j ++){                             
      normals.push(n[0]);
      normals.push(n[1]);
      normals.push(n[2]);
    }
  }

  return normals;
}

// Vector utils
/**
 * a - b
 *
 * Substracts b from a elementwise. Requires a.length==b.length
 */
function vectorDiff(a, b){
  if(a.length !== b.length)
    return null;

  let c = [];
  for(let i = 0; i < a.length; i++){
    c.push(a[i] - b[i]);
  }

  return c;
}
/**
 * a + b
 *
 * Add a and b elementwise. Requires a.length==b.length
 */
function vectorAdd(a, b){
  if(a.length !== b.length)
    return null;

  let c = [];
  for(let i = 0; i < a.length; i++){
    c.push(a[i] + b[i]);
  }

  return c;
}
/**
 * a / x
 */
function vectorScalarDiv(a, x){
  let c = [];
  for(let i = 0; i < a.length; i++){
    c.push(a[i] / x);
  }

  return c;
}
/**
 * a X b
 *
 * Requires a.length==b.length==3
 */
function crossProduct(a, b){
  if(a.length === b.length && a.length === 3){
    let c = [0,0,0];
    c[0] = a[1] * b[2] - a[2] * b[1];
    c[1] = a[0] * b[2] - a[2] * b[0];
    c[2] = a[0] * b[1] - a[1] * b[0];
    return c;
  }
  else
    return null;
}
/**
 * Returns the normalised n-dimensional vector a
 */
function normalise(a){
  // Get the modulus of A
  let mod = 0;
  a.forEach(function(e){
    mod += e * e;
  });
  mod = Math.sqrt(mod);
  // Divide each position of A by the modulus
  a.forEach(function(e,i){
    a[i] = e / mod;
  });

  return a;
}
/**
 * Find the surface normal to the triangle defined by
 * the vertices a,b,c
 * @param a
 * @param b
 * @param c
 * @returns {*}
 */
function surfaceNormal(a, b, c){
  let e1,e2;
  // Edge 1 = V2 - V1
  e1 = vectorDiff(b, a);
  // Edge 2 = V3 - V1
  e2 = vectorDiff(c, a);
  // Normal = (Edge 1 X Edge 2) -> normalise
  return normalise(crossProduct(e1,e2));
}

function rgb(r, g, b, intensity){
  let result = [];
  result.push(r / 255.0 * intensity);
  result.push(g / 255.0 * intensity);
  result.push(b / 255.0 * intensity);
  return result;
}

// Client updates
function updateCanvasSize(gl){
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = gl.canvas.clientWidth;
  var displayHeight = gl.canvas.clientHeight;

  // Check if the canvas is not the same size.
  let r = gl.canvas.width  !== displayWidth 
       || gl.canvas.height !== displayHeight;

  if (r) {
    // Make the canvas the same size
    gl.canvas.width  = displayWidth;
    gl.canvas.height = displayHeight;
  }

  return r;
}

// Shader utils
function linkShader(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function readMeshFile(meshFileString, indexed = true){
  var mesh = "";
  $.ajax({ 
    url: meshFileString, 
    dataType: 'text', 
    async: false, 
    success: function(data){ 
        mesh = data;
    } 
  });
       
  return parseOBJ(mesh, indexed);
}

function parseOBJ(meshString, indexed){
  var meshLines = meshString.split("\n");
  var vertices = [];
  var normals = [];
  var vIndices = [];
  var nIndices = [];
  var meshIds = [];
  var currentId = -1;
  
  for(var i = 0; i < meshLines.length; i++){
    var tokens = meshLines[i].split(' ');
    if(tokens.length > 0){
      switch(tokens[0]){
        case "o": // Start of a new mesh
          currentId++;
          break;
        case "v": // Vertex
          vertices.push(parseFloat(tokens[1]));
          vertices.push(parseFloat(tokens[2]));
          vertices.push(parseFloat(tokens[3]));
          meshIds.push(currentId);
          break;
        case "vn": // Normal
          normals.push(parseFloat(tokens[1]));
          normals.push(parseFloat(tokens[2]));
          normals.push(parseFloat(tokens[3]));
          break;
        case "vt": // Texture
          break;
        case "f": // Face: vI/tI/nI ././. ././. 
          var p1 = tokens[1].split('/');
          var p2 = tokens[2].split('/');
          var p3 = tokens[3].split('/');
          
          vIndices.push(parseInt(p1[0]) - 1);
          vIndices.push(parseInt(p2[0]) - 1);
          vIndices.push(parseInt(p3[0]) - 1);
          
          // Skip [1] - texture index

          nIndices.push(parseInt(p1[2]) - 1);
          nIndices.push(parseInt(p2[2]) - 1);
          nIndices.push(parseInt(p3[2]) - 1);
          break;
        default: 
          break;
      }
    }
  }
  
  var gatheredNormals = flatGather(normals, nIndices);
  
  if(indexed)
    return {
      vertices: vertices,
      normals: normals,
      meshIds: meshIds,
      indices: vIndices
    };
  else {
    // Duplicate vertices
    var gatheredVertices = flatGather(vertices, vIndices);
    // Recompute face normals
    var newNormals = computeNormalsUnindexed(gatheredVertices, true);

    return {
      vertices: gatheredVertices,
      normals: newNormals,
      indices: []
    };
  }
}