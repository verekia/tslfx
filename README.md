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

## Noise

Some [MaterialX](https://materialx.org/)-based noises are directly [included in Three.js](https://github.com/mrdoob/three.js/blob/master/examples/webgpu_materialx_noise.html).

For example, the following code creates a basic water-like effect using `mx_noise_vec3`:

```js
import { color, float, mix, mx_noise_vec3, time, uv, vec3 } from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const blue = color('#3871ff')
const lightBlue = color('#579dff')
const scale = 8
const speed = 0.5
const space = uv().sub(0.5).mul(scale).add(0.5)

const rawNoise = mx_noise_vec3(vec3(space, time.mul(speed))).xxx
const adjustedNoise = float(0.5).add(float(0.5).mul(rawNoise))
const colored = mix(blue, lightBlue, adjustedNoise)

const colorNode = colored

const material = new MeshBasicNodeMaterial()
material.colorNode = colorNode
```

## Resources

- [GLSL to TSL transpiler](https://threejs.org/examples/?q=webgpu#webgpu_tsl_transpiler)
- [TSL examples](https://threejs.org/examples/?q=tsl)
