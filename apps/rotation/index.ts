//@ts-nocheck
import * as T from 'three'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const gui = new GUI()

const scene = new T.Scene()
const camera = new T.PerspectiveCamera(65, window.innerWidth / window.innerHeight)


const render = new T.WebGLRenderer()
const pointer = new T.Vector2()
camera.position.set(1, 2, 3)


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);
const control = new OrbitControls(camera, labelRenderer.domElement)
control.target.set(0.7, 0, 0)

render.setSize(window.innerWidth, window.innerHeight)
document.body.append(render.domElement)


const update = (t) => {
    render.render(scene, camera)
    labelRenderer.render(scene, camera);
    control.update()
    requestAnimationFrame(update)
}
update()

const xyz = ['x', 'y', 'z']
window.T = T

{
    const g = new T.Group()
    // g.visible = false
    const grid = addGridSpace()
    const axiHelper = new T.AxesHelper(1)
    scene.fog = new T.Fog(0x111111, 0.1, 10)
    g.add(grid, axiHelper)
    gui.add(g, 'visible').name('Grid')
    scene.add(g)
}

const coneMesh = new T.Mesh(new T.ConeGeometry(0.1, 0.1, 6), new T.MeshNormalMaterial())
const cone = new T.Group()
coneMesh.rotation.x = Math.PI / 2
cone.add(coneMesh)
scene.add(cone)

const coneControl = gui.addFolder('Cone')
coneControl.close()
{
    const c = coneControl.addFolder('rotation')
    xyz.forEach(i => {
        c.add(cone.rotation, i, -Math.PI, Math.PI, 0.001).listen()
    })
}
{
    const c = coneControl.addFolder('quaternion')
    xyz.forEach(i => {
        c.add(cone.quaternion, i, -1, 1, 0.001).listen()
    })
    c.add(cone.quaternion, 'w', -1, 1, 0.001).listen()
}



class Line {
    name: string
    base: T.Vector3
    vector: T.Vector3
    group: T.Group
    color: T.Color
    material: T.LineBasicMaterial
    controls: {
        [key: string]: GUI
    }
    curve: boolean | T.Line
    dashMaterial: T.LineDashedMaterial
    line: T.Line
    label: CSS2DObject
    dashLines: T.Group
    constructor(x:number, y: number, z: number, name: string, base?: T.Vector3, color?: T.Color) {
        this.name = name
        this.base = base || new T.Vector3(1, 0, 0)
        this.vector = new T.Vector3(x, y, z)
        this.group = new T.Group()
        this.color = color || new T.Color(`hsl(${360 * Math.random()}, 100%, 50%)`)
        this.material = new T.LineBasicMaterial({ color: this.color })
        this.dashMaterial = new T.LineDashedMaterial({ color: this.color, dashSize: 0.05, gapSize: 0.05 })
        this.controls = {}
        this.line = this.addLine()
        this.label = this.addLable()
        this.dashLines = new T.Group()
        this.group.add(this.dashLines)
        this.addControl()
        scene.add(this.group)
    }
    onUpdate() { }
    addLine(line = true) {
        const origin = new T.Vector3(0, 0, 0)
        const geometry = new T.BufferGeometry().setFromPoints([origin, this.vector])
        const mesh = new T.Line(geometry, line ? this.material : this.dashMaterial)
        mesh.computeLineDistances()
        if (!line) {
            this.dashLines.add(mesh)
        } else {
            this.group.add(mesh)
        }
        return mesh
    }
    addLable() {
        const div = document.createElement('div')
        div.textContent = this.name || 'Line'
        div.style.color = this.color.getStyle()
        div.style.fontSize = '12px'
        const mesh = new CSS2DObject(div)
        mesh.position.copy(this.vector)
        this.group.add(mesh)
        return mesh
    }

    addControl() {
        const control = gui.addFolder(this.name)
        const c = control.addColor(this.material, 'color').onChange((v: T.Color) => {
            this.dashMaterial.color = v
            const target = this.group.children[1] as CSS2DObject
            target.element.style.color = v.getStyle()
        })
        const options = {
            length: 0,
            deg: 0,
            dot: 0
        }

        for (let i in options) {
            this.controls[i] = control.add(options, i)
        }

        control.add(this.vector, 'x', -1, 1, 0.01).onChange(() => {
            this.update()
        }).listen()
        control.add(this.vector, 'y', -1, 1, 0.01).onChange(() => this.update()).listen()
        control.add(this.vector, 'z', -1, 1, 0.01).onChange(() => this.update()).listen()
        control.$title.addEventListener('click', () => {
            this.group.visible = !control._closed
            const target = this.group.children[1] as CSS2DObject
            target.element.style.visibility = !control._closed ? 'visible' : 'hidden'
        })

        this.update()

    }

    setGeometry(m: T.Line, v: T.Vector3, o?: T.Vector3) {
        {
            const { x, y, z } = v
            const arr = m.geometry.attributes.position.array as number[]
            arr[3] = x
            arr[4] = y
            arr[5] = z
        }
        if (o) {
            const { x, y, z } = o
            const arr = m.geometry.attributes.position.array as number[]
            arr[0] = x
            arr[1] = y
            arr[2] = z
        }

        m.geometry.attributes.position.needsUpdate = true
    }
    updateDashLines() {
        this.dashLines.clear()
        const dot = this.vector.dot(this.base)
        const { x, y, z } = this.vector
        this.setGeometry(this.addLine(false), new T.Vector3(dot, 0, z))
        this.setGeometry(this.addLine(false), new T.Vector3(0, y, z))
        this.setGeometry(this.addLine(false), new T.Vector3(x, y, 0))

        this.setGeometry(this.addLine(false), new T.Vector3(dot, 0, z), this.vector)
        this.setGeometry(this.addLine(false), new T.Vector3(0, y, z), this.vector)
        this.setGeometry(this.addLine(false), new T.Vector3(x, y, 0), this.vector)


        this.setGeometry(this.addLine(false), new T.Vector3(dot, 0, z), new T.Vector3(0, 0, z))
        this.setGeometry(this.addLine(false), new T.Vector3(dot, 0, z), new T.Vector3(x, 0, 0))

        this.setGeometry(this.addLine(false), new T.Vector3(0, y, z), new T.Vector3(0, 0, z))
        this.setGeometry(this.addLine(false), new T.Vector3(x, y, 0), new T.Vector3(x, 0, 0))

    }
    update() {
        this.setGeometry(this.line, this.vector)
        this.label.position.copy(this.vector)

        const { length, dot, deg } = this.controls
        length.setValue(this.vector.length().toFixed(2))
        const dotValue = this.vector.dot(this.base).toFixed(2)
        dot.setValue(dotValue)
        this.updateDashLines()
        this.onUpdate()
    }
}


const lineA = new Line(1, 1, 1, 'A')
lineA.update()
const lineAN = new Line(1, 1, 1, 'A_norm')

// lineA.vector.randomDirection()
// lineA.update()       


const direction = cone.getWorldDirection(new T.Vector3())
const up = cone.up

const directionLine = new Line(direction.x, direction.y, direction.z, 'Direction')
const upLine = new Line(cone.up.x, cone.up.y, cone.up.z, 'Up')

const dxa = new Line(0, 0, 0, 'DXA')


lineA.onUpdate = () => {
    directionLineupdate()
    lineAN.vector.copy(lineA.vector).normalize()
    lineAN.update()
}

{
    cone.lookAt(lineA.vector)
    const r = lineA.vector.angleTo(direction)
    console.log(r, T.MathUtils.radToDeg(r))
}

coneControl.onChange(directionLineupdate)
function directionLineupdate() {
    directionLine.vector = cone.getWorldDirection(new T.Vector3())
    directionLine.update()
    upLine.vector = cone.up
    upLine.update()
    dxa.vector = directionLine.vector.clone().cross(lineA.vector)
    dxa.update()
}
directionLineupdate()
lineA.update()

// const lineAProject = lineA

function addGridSpace() {
    const group = new T.Group()
    {
        const grid = new T.GridHelper()
        const mat = grid.material as T.LineBasicMaterial
        mat.color = new T.Color('green')
        mat.opacity = 0.5
        mat.transparent = true
        grid.rotation.x = 90 * Math.PI / 180
        group.add(grid)
    }
    {
        const grid = new T.GridHelper()
         const mat = grid.material as T.LineBasicMaterial
        mat.color = new T.Color('red')
        mat.opacity = 0.5
        mat.transparent = true
        group.add(grid)
    }
    {
        const grid = new T.GridHelper()
         const mat = grid.material as T.LineBasicMaterial
        mat.color = new T.Color('blue')
        mat.opacity = 0.5
        mat.transparent = true
        grid.rotation.z = 90 * Math.PI / 180
        group.add(grid)
    }
    return group
} 
