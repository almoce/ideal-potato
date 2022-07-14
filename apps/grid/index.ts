import * as T from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
//@ts-ignore
import Gui from 'three/examples/jsm/libs/lil-gui.module.min.js'
const gui = new Gui()
const render = new T.WebGLRenderer({antialias: true})
const scene = new T.Scene()
const camera = new T.PerspectiveCamera(45, window.innerWidth/window.innerHeight)
const control = new OrbitControls(camera, render.domElement)
control.autoRotate = true
gui.add(control, 'autoRotate')
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

const cameraDistance = new T.Vector3(1,1.5,1).multiplyScalar(20)
camera.position.copy(cameraDistance)


camera.lookAt(0, 0, 0)
const axeHelper = new T.AxesHelper(1)
axeHelper.position.y = 0.001
scene.add(axeHelper)
const grid = new T.GridHelper()
scene.add(grid)

const light = new T.HemisphereLight('white', 'blue')
scene.add(light)
{
  const light = new T.PointLight('yellow', 5)
  light.position.set(0,5,0)
  scene.add(light)
}

{
  const light = new T.RectAreaLight()
  light.position.set(0, 15, 0)
  scene.add(light)
}

const ball = new T.SphereBufferGeometry(0.5)
const box = new T.BoxBufferGeometry(1,1,1)
const mat = new T.MeshStandardMaterial()
mat.roughness = 1
mat.metalness = 0
const boxMesh = new T.Mesh(box, mat)

const gridMesh = new T.Group()

for(let y =0; y<10; y++) {
    for(let x=0; x<10;x++){
        for(let z=0; z<10; z++) {
            const mesh = boxMesh.clone()
            mesh.position.set(x-5+0.5, y+0.5, z-5+0.5)
            gridMesh.add(mesh)
        }
    }
}

scene.add(gridMesh)

list.push(() => {
  let n = Math.random() * gridMesh.children.length
  n = Math.floor(n)
  gridMesh.children[n].visible = !gridMesh.children[n].visible
})


