# ✨ TSLFX ✨

Early-stage collection of VFX shaders, utils, and SDFs for Three.js Shading Language ([TSL](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)).

The effects work with the WebGPU renderer and its WebGL backend fallback. To set up your project with `WebGPURenderer`, check out [this repo](https://github.com/verekia/three-gpu-ecosystem-tests). The examples use React Three Fiber but the shaders can be used with vanilla Three.js or any other wrapper.

## Getting started

### Vanilla Three.js

```js
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { impact } from 'tslfx'

const { uniforms, nodes } = impact()

const material = new MeshBasicNodeMaterial()
material.colorNode = nodes.colorNode

const animate = (delta: number) => {
  // Update uniforms in your animation loop
  uniforms.time.value += delta
}
```

### React Three Fiber v9 RC

Somewhere top-level in your project, extend `MeshBasicNodeMaterial` and declare its type:

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

> [!TIP]
> I like to put these in an `extend.ts` file that I import in my main entry file (`_app.tsx` in Next.js for example).

You can then use `meshBasicNodeMaterial` in your scene:

```js
import { useFrame } from '@react-three/fiber'
import { impact } from 'tslfx'

const ImpactVFX = () => {
  const { uniforms, nodes } = useMemo(() => impact(), [])

  useFrame((_, delta) => {
    // Update uniforms here
    uniforms.time.value += delta
  })

  return (
    <mesh>
      <planeGeometry />
      <meshBasicNodeMaterial {...nodes} transparent />
    </mesh>
  )
}
```

> [!CAUTION]
> You should **memoize any TSL logic** to not re-create nodes on every render.

## VFX

- 💥 [Impact](https://tslfx.v1v2.io/impact)
- ⭕️ [Pulsing Ring](https://tslfx.v1v2.io/pulsing-ring)
- 🌈 [Gradient](https://tslfx.v1v2.io/gradient)

## SDFs

Some Signed Distance Functions (SDFs) ported from [Inigo Quilez's website](https://iquilezles.org/articles/distfunctions2d/) are included in the library:

```js
import { sdCircle, sdVesica, sdHeart } from 'tslfx'

const circle = sdCircle(p, 0.5)
const vesica = sdVesica(p, 0.5, 0.2)
const heart = sdHeart(p)
```

## Utils

### `pipe`

TSL functions that take 2 nodes as arguments can be piped together into a single expression without introducing extra variables or reassignments:

```js
import { blendColor } from 'three/tsl'
import { pipe } from 'tslfx'

const colorNode = pipe(
  blendColor,
  effectA.colorNode,
  effectB.colorNode,
  effectC.colorNode
)
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
