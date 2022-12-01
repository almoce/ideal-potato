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

camera.position.set(2, 1, 5)
camera.lookAt(0, 0, 0)
// const axeHelper = new T.AxesHelper(0.1)
// axeHelper.position.y = 0.001
// scene.add(axeHelper)
const grid = new T.GridHelper()
grid.material.opacity = 0.2
grid.material.transparent = true
scene.add(grid)
{
    const geometry = new T.BufferGeometry()
    const vertices = new Float32Array( [
         // top left triangle
         1.0, 1.0, 0.0,
         -1.0, 1.0, 0.0,
         -1.0, -1.0, 0.0,
    ] );

    geometry.setAttribute( 'position', new T.BufferAttribute( vertices, 3 ) );
    const mesh = new T.Mesh(geometry, new T.MeshBasicMaterial({wireframe: true, color: 'blue'}))
    mesh.position.z = -2
   
    scene.add(mesh)

    {
        // default only binding effect with 2 segment of bone
        const group = new T.Group()
        const b1 = new T.Bone()
        const b2 = new T.Bone()
        b1.add(b2)
        b1.position.y = -0.5
        b2.position.y = 0.5

        const skt = new T.Skeleton([b1, b2])
        const skinmesh = new T.SkinnedMesh(geometry.clone(), new T.MeshBasicMaterial({wireframe: true, color: 'red'}))
        group.add(b1, skinmesh)    
        skinmesh.bind(skt)
        scene.add(group, new T.SkeletonHelper(group))
        group.position.z = -0.3
    }

    {    
        // custom culculation for 4 joint to effect bone translation
        const group = new T.Group()
        const rootBone = new T.Bone()
        const bones = [rootBone]
        
        const SEGMENT_COUNT = 2 // bone count
        const SEGMENT_SIZE = 2 // bone height
        const SEGMENT_HEIGHT = SEGMENT_SIZE/SEGMENT_COUNT // bone height

        for(let i = 0; i < SEGMENT_COUNT; i++) {
            const b = new T.Bone()
            bones[i].add(b)
            bones.push(b)
            b.position.y = SEGMENT_HEIGHT
        }
        const skt = new T.Skeleton(bones)
        const skinmesh = new T.SkinnedMesh(geometry.clone(), new T.MeshBasicMaterial({wireframe: true, color: 'green'}))
        const m = new T.Matrix4()
        m.fromArray([
            1,0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 1, 0, 1 
        ])
        skinmesh.geometry.applyMatrix4(m)
        skinmesh.geometry.attributes.position.needsUpdate = true
        console.log(Array.from(skinmesh.geometry.attributes.position.array))
        // skinmesh.geometry.attributes.position.array[0] = 0.5
        skinmesh.geometry.attributes.position.array[1] = 0
        skinmesh.geometry.attributes.position.array[4] = 0
        console.log(Array.from(skinmesh.geometry.attributes.position.array))

       

        const p = skinmesh.geometry.attributes.position
        const v = new T.Vector3()
        const indice = []
        const weights = []
        for (let i =0; i < p.count; i++) {
            v.fromBufferAttribute(p, i)
            if (i === 0) {
                indice.push(0,1,2,3)
                weights.push(0,0,1,0)
            } else if (i === 1) {
                indice.push(0,1,2,3)
                weights.push(0,0,1,0)
            } else if (i === 2) {
                indice.push(0,1,2,3)
                weights.push(1,0,0,0)
            }
        }
        skinmesh.geometry.setAttribute( 'skinIndex', new T.Uint16BufferAttribute(indice, 4) );
        skinmesh.geometry.setAttribute( 'skinWeight', new T.Float32BufferAttribute(weights, 4) );
        console.log(skinmesh.geometry.attributes.skinIndex.array)
        console.log(skinmesh.geometry.attributes.skinWeight.array)
        group.add(rootBone, skinmesh)
        skinmesh.bind(skt)
        scene.add(group, new T.SkeletonHelper(group))
        // group.position.y = -1
        bones.forEach((b, idx) => {
            gui.add(b.position, 'x', -1, 1, 0.001).listen().name(`bone_x_${idx}`)
        })
    }
    
}