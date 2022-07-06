

import * as T from 'three'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';


const vertexshader = `
    varying vec3 v_pos;
    varying vec2 v_uv;
    uniform float time;
    void main() {
        vec3 nPos = position;
        v_uv = uv;
        v_pos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
    }
`

const fragmentshader = `
    varying vec3 v_pos;
    varying vec2 v_uv;
    uniform float time;
    void main() {
        float x = v_uv.x > 0.5 ? v_pos.x : v_uv.x;
        vec2 center_uv = v_uv * 2.0 - 1.0;
        float lx = 1. - length(center_uv);
        lx = smoothstep(0.2, 0.8, lx);
        vec3 color = vec3(x, 0.0, 0.0);
        gl_FragColor = vec4(color, lx);
    }
    `
    
const gui = new GUI()

const scene = new T.Scene()
const camera = new T.PerspectiveCamera(65, window.innerWidth / window.innerHeight)

const render = new T.WebGLRenderer()
const pointer = new T.Vector2()
camera.position.set(0, 0, 7)


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);
const control = new OrbitControls(camera, labelRenderer.domElement)

render.setSize(window.innerWidth, window.innerHeight)
document.body.append(render.domElement)

scene.background = new T.Color('#999')

const shader = new T.ShaderMaterial({
    uniforms: {
        time: {
            value: 0.0
        },
    },
    transparent: true,
    vertexShader: vertexshader,
    fragmentShader: fragmentshader
})

const update = (t) => {
    render.render(scene, camera)
    labelRenderer.render(scene, camera);
    control.update()
    requestAnimationFrame(update)
    if (shader) {
        shader.uniforms.time.value = t * 0.007;
        // shader.uniforms.time.value = t * 0.1
    }
}
update()


const boxBuffer = new T.BufferGeometry()

const vertices = new Float32Array([
    // Triangle Face
    -1.0, -1.0, 1.0, // 0
    0.0, -2.0, 1.0, // 1
    1.0, 1.0, 1.0, // 2

    // Triangle Face
    1.0, 1.0, 1.0, // 3
    -1.5, 0.5, 1.0, // 4
    -1.0, -1.0, 1.0 // 5
])

const uvs = new Float32Array([
    0, 1, // 0
    1, 1, // 1
    1, 0, // 2
    1, 0, // 3
    0, 0, // 4
    0, 1, // 5
])

boxBuffer.setAttribute('position', new T.BufferAttribute(vertices, 3));
boxBuffer.setAttribute('uv', new T.BufferAttribute(uvs, 2))

const mesh = new T.Mesh(boxBuffer, shader)

{
    {
        const buff = new T.BufferGeometry()
        const arr = new Float32Array(12)
        arr.forEach((i, idx) => arr[idx] = vertices[idx])
        arr[9] = arr[0]
        arr[10] = arr[1]
        arr[11] = arr[2]
        arr.forEach((i, idx) => (idx + 1) % 3 === 0 && (arr[idx] += 0.01))

        buff.setAttribute('position', new T.BufferAttribute(arr, 3))
        const lineMesh = new T.Line(buff, new T.LineBasicMaterial())
        scene.add(lineMesh)
    }

    {
        const buff = new T.BufferGeometry()
        const arr = new Float32Array(12)
        arr.forEach((i, idx) => arr[idx] = vertices[idx + 9])
        arr[9] = arr[0]
        arr[10] = arr[1]
        arr[11] = arr[2]
        arr.forEach((i, idx) => (idx + 1) % 3 === 0 && (arr[idx] += 0.01))

        buff.setAttribute('position', new T.BufferAttribute(arr, 3))
        const lineMesh = new T.Line(buff, new T.LineBasicMaterial())
        scene.add(lineMesh)
    }
}

{

    // position debug
    const vector = new T.Vector3()
    const points = []
    for (let i = 0; i < boxBuffer.attributes.position.count; i++) {
        vector.fromBufferAttribute(boxBuffer.attributes.position, i)
        const v = vector.clone()
        let exit = 0
        points.forEach((n) => n.equals(v) && exit++)
        points.push(v)
        const div = document.createElement('div')
        {
            const span = document.createElement('span')
            span.innerText = `${i}`
            span.style.cssText = `color: #000; background: #fff; border-radius: 2px; margin-right: 5px; padding: 2px`
            div.appendChild(span)
        }

        {
            const span = document.createElement('span')
            span.innerText = `${v.x}, ${v.y}, ${v.z}`
            span.style.cssText = `color: #000; background: #fff; border-radius: 2px; padding: 2px;`
            div.appendChild(span)
        }

        div.style.cssText = `font-size: 12px; padding: 1px 2px;`

        const mesh = new CSS2DObject(div)
        mesh.position.copy(v).multiplyScalar(1.1)
        mesh.position.y -= exit * 0.1
        scene.add(mesh)
        gui.add({ v: `${v.x}, ${v.y}, ${v.z}` }, 'v').name(i)
    }
    for (let i in boxBuffer.attributes) {
        console.log(i, boxBuffer.attributes[i].array);
    }
}
scene.add(mesh)

{
    const size = 0.5
    {
        const mesh = new T.Mesh(new T.BoxBufferGeometry(size, size, size), shader)
        mesh.position.set(-2, 2, 0)
        scene.add(mesh)
    }
    {
        const mesh = new T.Mesh(new T.SphereGeometry(size), shader)
        mesh.position.set(0, 2, 0)
        scene.add(mesh)
    }
    {
        const mesh = new T.Mesh(new T.TorusKnotGeometry(size, size / 5), shader)
        mesh.position.set(2, 2, 0)
        scene.add(mesh)
    }



}