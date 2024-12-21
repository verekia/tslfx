# 👻 TSLFX

Very early-stage collection of VFX shaders for Three.js Shading Language (TSL).

The effects work with both WebGPU and WebGL. To set up your project with `WebGPURenderer`, check out [this repo](https://github.com/verekia/three-gpu-ecosystem-tests). The examples use React Three Fiber but the shaders can be used with vanilla Three.js or any other wrapper.

## R3F Example

This example uses React Three Fiber v9 RC.

Somewhere top-level in your project:

```jsx
import { extend, type ThreeElement } from '@react-three/fiber'
import { MeshBasicNodeMaterial } from 'three/webgpu'

extend({ MeshBasicNodeMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshBasicNodeMaterial: ThreeElement<typeof MeshBasicNodeMaterial>
  }
}
```

You can then use `meshBasicNodeMaterial` in your scene:

```js
import { pulsingRing } from 'tslfx'

const App = () => {
  const { nodes } = useMemo(() => pulsingRing(), [])

  return (
    <Canvas>
      <mesh scale={5}>
        <planeGeometry />
        <meshBasicNodeMaterial {...nodes} transparent />
      </mesh>
    </Canvas>
  )
}
```
