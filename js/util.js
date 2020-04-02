function random(params){
  if(params.length == 1){
    return Math.random() * params[0];
  }
  if(params.length == 2){
    return Math.random()*(params[1]-params[0]) + params[0];
  }
  return Math.random();
}

function rgb(r, g, b, intensity){
  let result = [];
  result.push(r / 255.0 * intensity);
  result.push(g / 255.0 * intensity);
  result.push(b / 255.0 * intensity);
  return result;
}

// Client updates
function canvasSizeChanged(gl){
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

function customParseOBJ(meshString){
  var meshLines = meshString.split("\n");
  var vertices = [];
  var colors = [];
  var vIndices = [];
  
  for(var i = 0; i < meshLines.length; i++){
    var tokens = meshLines[i].split(' ');
    if(tokens.length > 0){
      switch(tokens[0]){
        case "v": // Vertex
          vertices.push(parseFloat(tokens[1]));
          vertices.push(parseFloat(tokens[2]));
          vertices.push(parseFloat(tokens[3]));

          // We have colors
          colors.push(parseFloat(tokens[4]));
          colors.push(parseFloat(tokens[5]));
          colors.push(parseFloat(tokens[6]));
          break;

        case "f": // Face: f v1 v2 v3 (no extras)
          vIndices.push(parseInt(tokens[1]) - 1);
          vIndices.push(parseInt(tokens[2]) - 1);
          vIndices.push(parseInt(tokens[3]) - 1);
          break;

        default: 
          break;
      }
    }
  }
  
  return {
    vertices: vertices,
    colors: colors,
    indices: vIndices
  };
}