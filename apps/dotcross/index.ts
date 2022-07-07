import * as T from 'three'
//@ts-ignore
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const gui = new GUI()

const scene = new T.Scene()
const camera = new T.PerspectiveCamera()

const render = new  T.WebGLRenderer()
const pointer = new T.Vector2()
camera.position.set(0, 0, 5)


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );
const control = new OrbitControls(camera, labelRenderer.domElement)
console.log(control);
gui.add(control, 'autoRotate')
// control.target = new T.Vector3(0.5,0.5,0)
// const axiHelper = new T.AxesHelper(0.5)
// scene.add(axiHelper)

render.setSize(window.innerWidth, window.innerHeight)
document.body.append(render.domElement)

gui.close()
{
    const grid = addGridSpace()
    // grid.visible = false
    scene.add(grid)
    gui.add(grid, 'visible').name('Grid')
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
    constructor(x: number, y: number, z: number, name: string, base?: T.Vector3) {
        this.name = name
        this.base = base || new T.Vector3(1,0,0)
        this.vector = new T.Vector3(x, y, z)
        this.group = new T.Group()
        this.color = new T.Color(`hsl(${360 * Math.random()}, 100%, 50%)`)
        this.material = new T.LineBasicMaterial({color: this.color})
        this.controls = {}
        this.curve = false
        this.addLine()
        this.addLable()
        this.addControl()
        scene.add(this.group)
    }
    onUpdate() {}
    addLine() {
        const origin = new T.Vector3(0,0,0)
        const geometry = new T.BufferGeometry().setFromPoints([origin, this.vector])
        const mesh = new T.Line(geometry, this.material)
        this.group.add(mesh)
    }
    addLable() {
        const div = document.createElement('div')
        div.textContent = this.name || 'Line'
        div.style.color = this.color.getStyle()
        div.style.fontSize = '12px'
        const mesh =  new CSS2DObject(div)
        mesh.position.copy(this.vector)
        this.group.add(mesh)
    }
    updateCurve() {
        if (this.curve) {
            (this.curve as T.Line).removeFromParent()
            this.curve = false
        }

        const baseAngle = new T.Vector2(this.base.x, this.base.y).angle()
        const lineAngle = new T.Vector2(this.vector.x, this.vector.y).angle()

        const project = Math.abs(this.vector.clone().normalize().dot(this.base.clone().normalize()))

        const curve = new T.EllipseCurve(
            0, 0,            // ax, aY
            project, project,           // xRadius, yRadius
            baseAngle,  lineAngle,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        )
        const points = curve.getPoints( 100 )
        const geometry = new T.BufferGeometry().setFromPoints( points )
        // Create the final object to add to the scene
        const ellipse = new T.Line( geometry, this.material );
        this.group.add(ellipse)
        this.curve = ellipse
    }
    addControl() {
        const control = gui.addFolder(this.name)
        control.addColor(this.material, 'color').onChange((v: T.Color) => {
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

        if (this.name !== 'Base Line') {
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
        } else {
            this.controls['deg'].destroy()
            this.controls['deg'] = control.add(options, 'deg', 0, 360, 1).onChange((v: number) => {
                this.vector.x = Math.cos(v * Math.PI/180)
                this.vector.y = Math.sin(v * Math.PI/180)
                this.update()
            })
        }


        this.update()

    }

    update() {
        const [line, label] = this.group.children as [T.Line, CSS2DObject]
        const arr = line.geometry.attributes.position.array as number[]
        arr[3] = this.vector.x
        arr[4] = this.vector.y
        arr[5] = this.vector.z
        line.geometry.attributes.position.needsUpdate = true
        label.position.copy(this.vector)
        const {length, dot, deg} = this.controls
        length.setValue(this.vector.length().toFixed(2))
        dot.setValue(this.vector.dot(this.base).toFixed(2))
        
        if (this.name !== 'Base Line') {
            deg.setValue((this.vector.angleTo(this.base) * 180/Math.PI).toFixed(2))
            if (this.name.indexOf('X') === -1) {
                this.updateCurve()
            }

        }
        this.onUpdate()
    }
}

const baseLine = new Line(1,0,0, 'Base Line')

const c = new Line(0,0,0,'M', baseLine.vector)

const mouseCrossBase = new Line(0,0,0, 'M X Base', baseLine.vector)
window.addEventListener('mousemove', e => {
    const x = (e.x / window.innerWidth) * 2 - 1
    const y = ((e.y / window.innerHeight) * 2 - 1) * -1
    pointer.x = x
    pointer.y = y
    const a = pointer.angle()
    c.vector.x = Math.cos(a)
    c.vector.y = Math.sin(a)
    c.update()
    const cross = c.vector.clone().cross(baseLine.vector)
    mouseCrossBase.vector.copy(cross)
    mouseCrossBase.update()
})


const a = new Line(-1,1,0, 'A', baseLine.vector)
const b = new Line(1,1,0, 'B', baseLine.vector)

const acrossb = new Line(0,0,0, 'A X B', baseLine.vector)
const bcrossa = new Line(0,0,0, 'B X A', baseLine.vector)


b.onUpdate = a.onUpdate = () => {
    {
        const cross = a.vector.clone().cross(b.vector)
        acrossb.vector.copy(cross)
        acrossb.update()
    }
    {
        const cross = b.vector.clone().cross(a.vector)
        bcrossa.vector.copy(cross)
        bcrossa.update()
    }

    
}
baseLine.onUpdate = () => {
    a.update()
    b.update()
}
baseLine.update()

function addGridSpace() {
    const group = new T.Group()
    {
        const grid = new T.GridHelper()
        const mat = grid.material as T.LineBasicMaterial
        mat.color = new T.Color('green')
        mat.opacity = 0.5
        mat.transparent = true
        grid.rotation.x = 90 * Math.PI/180
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
        grid.rotation.z = 90 * Math.PI/180
        group.add(grid)
    }
    return group
} 

const update = () => {
    render.render(scene, camera)
    labelRenderer.render( scene, camera );
    control.update()
    requestAnimationFrame(update)
    // {
    //     baseLine.vector.x = Math.cos(t*0.001)
    //     a.vector.x = Math.cos(t*0.0002)
    //     b.vector.x = Math.cos(t*0.0003)
    //     baseLine.vector.y = Math.sin(t*0.001)
    //     a.vector.y = Math.sin(t*0.0002)
    //     b.vector.y = Math.sin(t*0.0003)
    //     baseLine.update()
    // }
}
update()