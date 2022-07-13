import * as T from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
//@ts-ignore
import Gui from 'three/examples/jsm/libs/lil-gui.module.min.js'
const gui = new Gui()
const render = new T.WebGLRenderer()
const scene = new T.Scene()
const camera = new T.PerspectiveCamera(45, window.innerWidth/window.innerHeight)
const control = new OrbitControls(camera, render.domElement)
// control.autoRotate = true
render.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(render.domElement)
interface fn {
    (): void
}
const list: fn[] = []
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
    const degree = gui.add({v: 0}, 'v', 0, 360).name('Degree')
    degree.onChange(v => {
        // const angle = v * 180/Math.PI
        const rad = v * Math.PI / 180
        const x = Math.cos(rad)
        const z = Math.sin(rad)
        direction.x = x
        direction.z = z
    }) 
    const clonePosition = clone.position as T.Vector3
    const axiX = new T.Vector3(1,0,0)
    const axiY = new T.Vector3(0,-1,0)
    list.push(() => {
        direction.normalize()
        mesh.position.copy(direction)
        const angle = degree.object.v * Math.PI / 180

        camera.getWorldDirection(clonePosition)
        clonePosition.y = 0
        clonePosition.applyAxisAngle(axiY, angle)
        clonePosition.normalize()
    })
}