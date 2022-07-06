import * as T from 'three'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const gui = new GUI()

const scene = new T.Scene()
const camera = new T.PerspectiveCamera(65, window.innerWidth/window.innerHeight)

const render = new  T.WebGLRenderer()
const pointer = new T.Vector2()
camera.position.set(0,0, 5)


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );
const control = new OrbitControls(camera, labelRenderer.domElement)

render.setSize(window.innerWidth, window.innerHeight)
document.body.append(render.domElement)

const update = (t) => {
    render.render(scene, camera)
    labelRenderer.render( scene, camera );
    control.update()
    requestAnimationFrame(update)
}
update()



const boxBuffer = new T.BoxBufferGeometry(2, 2, 2)
const mesh = new T.Mesh(boxBuffer, new T.MeshNormalMaterial({wireframe: true}))

const vector = new T.Vector3()
const points = []


for(let i = 0; i < boxBuffer.attributes.position.count; i++) {
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

    const mesh =  new CSS2DObject(div)
    mesh.position.copy(v).multiplyScalar(1.1)
    mesh.position.y-= exit*0.1
    scene.add(mesh)
    gui.add({v: `${v.x}, ${v.y}, ${v.z}`}, 'v').name(i)
}

const pointBuffer = new T.BufferGeometry().setFromPoints(points)
const pointMesh = new T.Points(pointBuffer, new T.PointsMaterial({size: 0.05}))

scene.add(mesh, pointMesh)