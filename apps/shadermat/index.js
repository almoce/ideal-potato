"use strict";
exports.__esModule = true;
var T = require("three");
var lil_gui_module_min_js_1 = require("three/examples/jsm/libs/lil-gui.module.min.js");
var OrbitControls_js_1 = require("three/examples/jsm/controls/OrbitControls.js");
var CSS2DRenderer_js_1 = require("three/examples/jsm/renderers/CSS2DRenderer.js");
var vertexshader = "\n    varying vec3 v_pos;\n    varying vec2 v_uv;\n    uniform float time;\n    void main() {\n        vec3 nPos = position;\n        v_uv = uv;\n        v_pos = position;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);\n    }\n";
var fragmentshader = "\n    varying vec3 v_pos;\n    varying vec2 v_uv;\n    uniform float time;\n    void main() {\n        float x = v_uv.x > 0.5 ? v_pos.x : v_uv.x;\n        vec2 center_uv = v_uv * 2.0 - 1.0;\n        float lx = 1. - length(center_uv);\n        lx = smoothstep(0.2, 0.8, lx);\n        vec3 color = vec3(x, 0.0, 0.0);\n        gl_FragColor = vec4(color, lx);\n    }\n    ";
var gui = new lil_gui_module_min_js_1["default"]();
var scene = new T.Scene();
var camera = new T.PerspectiveCamera(65, window.innerWidth / window.innerHeight);
var render = new T.WebGLRenderer();
var pointer = new T.Vector2();
camera.position.set(0, 0, 7);
var labelRenderer = new CSS2DRenderer_js_1.CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);
var control = new OrbitControls_js_1.OrbitControls(camera, labelRenderer.domElement);
render.setSize(window.innerWidth, window.innerHeight);
document.body.append(render.domElement);
scene.background = new T.Color('#999');
var shader = new T.ShaderMaterial({
    uniforms: {
        time: {
            value: 0.0
        }
    },
    transparent: true,
    vertexShader: vertexshader,
    fragmentShader: fragmentshader
});
var update = function (t) {
    render.render(scene, camera);
    labelRenderer.render(scene, camera);
    control.update();
    requestAnimationFrame(update);
    if (shader) {
        shader.uniforms.time.value = t * 0.007;
        // shader.uniforms.time.value = t * 0.1
    }
};
update(0);
var boxBuffer = new T.BufferGeometry();
var vertices = new Float32Array([
    // Triangle Face
    -1.0, -1.0, 1.0,
    0.0, -2.0, 1.0,
    1.0, 1.0, 1.0,
    // Triangle Face
    1.0, 1.0, 1.0,
    -1.5, 0.5, 1.0,
    -1.0, -1.0, 1.0 // 5
]);
var uvs = new Float32Array([
    0, 1,
    1, 1,
    1, 0,
    1, 0,
    0, 0,
    0, 1, // 5
]);
boxBuffer.setAttribute('position', new T.BufferAttribute(vertices, 3));
boxBuffer.setAttribute('uv', new T.BufferAttribute(uvs, 2));
var mesh = new T.Mesh(boxBuffer, shader);
{
    {
        var buff = new T.BufferGeometry();
        var arr_1 = new Float32Array(12);
        arr_1.forEach(function (i, idx) { return arr_1[idx] = vertices[idx]; });
        arr_1[9] = arr_1[0];
        arr_1[10] = arr_1[1];
        arr_1[11] = arr_1[2];
        arr_1.forEach(function (i, idx) { return (idx + 1) % 3 === 0 && (arr_1[idx] += 0.01); });
        buff.setAttribute('position', new T.BufferAttribute(arr_1, 3));
        var lineMesh = new T.Line(buff, new T.LineBasicMaterial());
        scene.add(lineMesh);
    }
    {
        var buff = new T.BufferGeometry();
        var arr_2 = new Float32Array(12);
        arr_2.forEach(function (i, idx) { return arr_2[idx] = vertices[idx + 9]; });
        arr_2[9] = arr_2[0];
        arr_2[10] = arr_2[1];
        arr_2[11] = arr_2[2];
        arr_2.forEach(function (i, idx) { return (idx + 1) % 3 === 0 && (arr_2[idx] += 0.01); });
        buff.setAttribute('position', new T.BufferAttribute(arr_2, 3));
        var lineMesh = new T.Line(buff, new T.LineBasicMaterial());
        scene.add(lineMesh);
    }
}
{
    // position debug
    var vector = new T.Vector3();
    var points = [];
    var _loop_1 = function (i) {
        vector.fromBufferAttribute(boxBuffer.attributes.position, i);
        var v = vector.clone();
        var exit = 0;
        points.forEach(function (n) { return n.equals(v) && exit++; });
        points.push(v);
        var div = document.createElement('div');
        {
            var span = document.createElement('span');
            span.innerText = "".concat(i);
            span.style.cssText = "color: #000; background: #fff; border-radius: 2px; margin-right: 5px; padding: 2px";
            div.appendChild(span);
        }
        {
            var span = document.createElement('span');
            span.innerText = "".concat(v.x, ", ").concat(v.y, ", ").concat(v.z);
            span.style.cssText = "color: #000; background: #fff; border-radius: 2px; padding: 2px;";
            div.appendChild(span);
        }
        div.style.cssText = "font-size: 12px; padding: 1px 2px;";
        var mesh_1 = new CSS2DRenderer_js_1.CSS2DObject(div);
        mesh_1.position.copy(v).multiplyScalar(1.1);
        mesh_1.position.y -= exit * 0.1;
        scene.add(mesh_1);
        gui.add({ v: "".concat(v.x, ", ").concat(v.y, ", ").concat(v.z) }, 'v').name(i);
    };
    for (var i = 0; i < boxBuffer.attributes.position.count; i++) {
        _loop_1(i);
    }
    for (var i in boxBuffer.attributes) {
        console.log(i, boxBuffer.attributes[i].array);
    }
}
scene.add(mesh);
{
    var size = 0.5;
    {
        var mesh_2 = new T.Mesh(new T.BoxBufferGeometry(size, size, size), shader);
        mesh_2.position.set(-2, 2, 0);
        scene.add(mesh_2);
    }
    {
        var mesh_3 = new T.Mesh(new T.SphereGeometry(size), shader);
        mesh_3.position.set(0, 2, 0);
        scene.add(mesh_3);
    }
    {
        var mesh_4 = new T.Mesh(new T.TorusKnotGeometry(size, size / 5), shader);
        mesh_4.position.set(2, 2, 0);
        scene.add(mesh_4);
    }
}
