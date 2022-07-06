import * as T from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Gui from 'three/examples/jsm/libs/lil-gui.module.min.js'
const gui = new Gui()
const render = new T.WebGLRenderer()
const scene = new T.Scene()
const camera = new T.PerspectiveCamera(45, window.innerWidth/window.innerHeight)
const control = new OrbitControls(camera, render.domElement)
// control.autoRotate = true
render.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(render.domElement)
const list = []
const update = () => {
    render.render(scene, camera)
    render.setAnimationLoop(update)
    control.update()
    list.forEach(i => i())
}
update()

camera.position.set(5, 5, 5)
camera.lookAt(0, 0, 0)
const axeHelper = new T.AxesHelper(1)
axeHelper.position.y = 0.001
scene.add(axeHelper)
const grid = new T.GridHelper()
scene.add(grid)
{
    const box = new T.BoxBufferGeometry(0.1, 0.1, 0.1)
    const mesh = new T.Mesh(box, new T.MeshBasicMaterial({color: 'red'}))
    const clone = mesh.clone()
    clone.material = clone.material.clone()
    clone.material.color =  new T.Color('blue')
    scene.add(mesh, clone)
    const direction = new T.Vector3(1,0,0)
    gui.add(direction, 'x', 0, 1).listen()
    gui.add(direction, 'z', 0, 1).listen()
    const clonePosition = clone.position as T.Vector3
    const axiX = new T.Vector3(1,0,0)
    const axiZ = new T.Vector3(0,1,0)
    list.push(() => {
        direction.normalize()
        const angle = direction.angleTo(axiX)
        mesh.position.copy(direction)
        camera.getWorldDirection(clonePosition)
        clonePosition.y = 0
        clonePosition.applyAxisAngle(axiZ, angle)
        clonePosition.normalize()

    })
}