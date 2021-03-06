// @ts-nocheck
import * as T from 'three'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import TWEEN from '@tweenjs/tween.js'

const gui = new GUI()

const scene = new T.Scene()
const camera = new T.PerspectiveCamera()
camera.near = 0.1
const render = new T.WebGLRenderer()
const pointer = new T.Vector2()
camera.position.set(1, 2, 3)


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);
const control = new OrbitControls(camera, labelRenderer.domElement)

render.setSize(window.innerWidth, window.innerHeight)
document.body.append(render.domElement)

const g = new T.Group()
const update = () => {
    render.render(scene, camera)
    labelRenderer.render(scene, camera);
    // control.update()
    TWEEN.update()
    requestAnimationFrame(update)
}
update()

let filename = ['20081023025304.plt', '20090520010901.plt']
let datas = []
let starttime = 0
const diffTime = []
const c = gui.add({ data: '' }, 'data', filename).onChange(v => {
    fetch('./data/' + v).then(res => res.text()).then(res => {
        const data = res.split('\n').slice(6).filter(i => i).map((i, idx) => {
            const v = i.split(',')
            const now = +new Date(`${v[v.length - 2]} ${v[v.length - 1]}`)
            if (!starttime) {
                starttime = now
            }
            const diff = now - starttime
            diffTime.push(diff)
            starttime = now
            return [v[0], v[1]]
        })
        drapath(data)
        start()
    })
})
c.setValue(filename[1])

function setcam(idx) {
    // camera.position.copy(g.position.clone().add(new T.Vector3(0, 0.05, 0)))
    // g.getWorldDirection(v)
    // camera.lookAt(v)
}


function start() {
    const mesh = new T.Mesh(new T.ConeGeometry(0.05, 0.05, 5), new T.MeshNormalMaterial())

    mesh.rotation.x = Math.PI / 2

    g.add(mesh)
    scene.add(g)
    mesh.position.copy(datas[0])
    const tween = new TWEEN.Tween(g.position).to(datas[1], 50)
    const a = datas.slice(1, 8)
    g.lookAt(datas[1])
    let idx = 1
    function update(target) {
        if (idx === datas.length - 1) {
            idx = 0
            g.position.copy(datas[0])
        }
        idx++
        g.lookAt(datas[idx])
        const t = new TWEEN.Tween(g.position).to(datas[idx], diffTime[idx] / 100)
        target.chain(t)

        t.onComplete(() => update(t)).onUpdate(() => {
            setcam(idx)
        })
    }
    tween.onComplete(() => update(tween)).onUpdate(() => {
        setcam(idx)
    })

    tween.start()

}


let pathG = null
function drapath(d) {
    if (pathG) {
        pathG.clear()
        pathG.removeFromParent()
    }
    pathG = new T.Group()
    const base = new T.Vector2().fromArray(d[0])
    const dataNormalize = d.map(i => {
        const v = new T.Vector2().fromArray(i)
        v.sub(base).multiplyScalar(80)
        return new T.Vector3(v.x, 0, v.y)
    })
    datas = dataNormalize
    const geometry = new T.BufferGeometry().setFromPoints(dataNormalize)
    const p = new T.Points(geometry, new T.PointsMaterial({ size: 0.01, color: 'yellow' }))
    const l = new T.Line(geometry, new T.PointsMaterial({ size: 0.002, color: 'green' }))

    pathG.add(p, l)
    scene.add(pathG)
}


const axiHelper = new T.AxesHelper(1)
scene.add(axiHelper)
