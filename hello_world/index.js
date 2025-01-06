class Vec2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) { return new Vec2D(this.x + other.x, this.y + other.y); }
    sub(other) { return new Vec2D(this.x - other.x, this.y - other.y); }
    mul_single(value) { return new Vec2D(this.x * value, this.y * value); }
}

function
create_shader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success) { return shader; }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function
create_program(gl, vertex_shader, fragment_shader) {
    let program = gl.createProgram();

    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) { return program; }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function
draw_quadrilateral(gl, top_left, top_right, bottom_left, bottom_right, color) {
    /* NOTE(abid): Set the fill color. */
    gl.uniform4f(gl.color_uniform_location, ...color);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        top_left.x, top_left.y,
        top_right.x, top_right.y,
        bottom_left.x, bottom_left.y,

        top_right.x, top_right.y,
        bottom_left.x, bottom_left.y,
        bottom_right.x, bottom_right.y
    ]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /* NOTE(abid): Bind attribute to the buffer. */
    gl.enableVertexAttribArray(gl.position_attribute_location);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.position_buffer);
    let size = 2;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0; /* Means we move `size * sizeof(type)` */
    let buffer_offset = 0;
    gl.vertexAttribPointer(gl.position_attribute_location, size, type, normalize, stride, buffer_offset);

    /* NOTE(abid): Tells WebGL to draw triangle after 3 runs of vertex shader (3 values of `gl_Position`). */
    let primitive_type = gl.TRIANGLES; 
    let offset = 0;
    let count = 6;
    gl.drawArrays(primitive_type, offset, count);
}

function
draw_guide_lines(gl) {
    draw_line(gl, new Vec2D(5, 5), new Vec2D(5, 600), [0, 0.5, 0.5, 1]);
    draw_line(gl, new Vec2D(5, 5), new Vec2D(1200, 5), [0, 0.5, 0.5, 1]);
}

function
draw_line(gl, start, end, color) {
    gl.uniform4f(gl.color_uniform_location, ...color);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        start.x, start.y,
        end.x, end.y,
    ]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.enableVertexAttribArray(gl.position_attribute_location);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.position_buffer);
    let size = 2;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0; /* Means we move `size * sizeof(type)` */
    let buffer_offset = 0;
    gl.vertexAttribPointer(gl.position_attribute_location, size, type, normalize, stride, buffer_offset);

    let primitive_type = gl.LINES;
    let offset = 0;
    let count = 2;
    gl.drawArrays(primitive_type, offset, count);
}

function
main() {
    let slide_x = document.getElementById("trans_x");
    let slide_y = document.getElementById("trans_y");
    slide_x.value = 0;
    slide_y.value = 0;

    let canvas = document.querySelector("#visualization");
    var gl = canvas.getContext("webgl");
    if(!gl) { console.error("WebGL could not be initialized!"); }
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    let vertex_shader_source = document.querySelector("#vertex-shader-2d").text;
    let fragment_shader_source = document.querySelector("#fragment-shader-2d").text;

    /* NOTE(abid): Compile and link. */
    let vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_source);
    let fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);
    let program = create_program(gl, vertex_shader, fragment_shader);

    gl.position_attribute_location = gl.getAttribLocation(program, "a_position");
    gl.resolution_uniform_location = gl.getUniformLocation(program, "u_resolution");
    gl.color_uniform_location = gl.getUniformLocation(program, "u_color");
    gl.position_buffer = gl.createBuffer();

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(gl.resolution_uniform_location, gl.canvas.width, gl.canvas.height);

    let translation = new Vec2D(parseFloat(slide_x.value), parseFloat(slide_x.value));
    let p1 = new Vec2D(50, 50);
    let p2 = new Vec2D(150, 150);
    let p3 = new Vec2D(70, 10);
    let p4 = new Vec2D(160, 130);
    let tran_p1 = p1.add(translation);
    let tran_p2 = p2.add(translation);
    let tran_p3 = p3.add(translation);
    let tran_p4 = p4.add(translation);

    draw_guide_lines(gl);
    draw_quadrilateral(gl, tran_p1, tran_p2, tran_p3, tran_p4, [1, 0, 0.5, 1]);

    function
    slider_update_listener(idx) {
        return function() {
            draw_guide_lines(gl);
            translation[idx] = parseFloat(this.value);

            let tran_p1 = p1.add(translation);
            let tran_p2 = p2.add(translation);
            let tran_p3 = p3.add(translation);
            let tran_p4 = p4.add(translation);
            draw_quadrilateral(gl, tran_p1, tran_p2, tran_p3, tran_p4, [1, 0, 0.5, 1]);
        }
    }

    slide_x.addEventListener("input", slider_update_listener("x"));
    slide_y.addEventListener("input", slider_update_listener("y"));
}

main();
