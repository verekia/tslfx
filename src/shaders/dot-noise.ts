import { uniform, vec3, cos, sin, dot, positionLocal, time, mat3 } from 'three/tsl'
import type { Node } from 'three/webgpu'

type DotNoiseParams = {
  scale?: number
  speed?: number
}

const defaultParams: Required<DotNoiseParams> = { scale: 1, speed: 1 }

// https://mini.gmshaders.com/p/dot-noise by [Xor](https://www.xordev.com/)

export const dotNoiseFn = (p: Node) => {
  const PHI = 1.618033988
  const GOLD = mat3(
    -0.571464913,
    -0.278044873,
    +0.772087367,
    +0.814921382,
    -0.303026659,
    +0.494042493,
    +0.096597072,
    +0.911518454,
    +0.399753815
  )
  // Range [-3, 3]
  const result = dot(cos(GOLD.mul(p)), sin(GOLD.mul(p).mul(PHI)))
  // Map to [0, 1]
  return result.add(3).div(6)
}

export const dotNoise = (params: DotNoiseParams) => {
  const p = { ...defaultParams, ...params }

  const scale = uniform(p.scale)
  const speed = uniform(p.speed)

  const uniforms = { scale, speed }

  const scaledTime = time.mul(speed)
  const pos = vec3(positionLocal.x, positionLocal.y, scaledTime).mul(scale)

  const noiseValue = dotNoiseFn(pos)

  const colorNode = vec3(noiseValue)

  const nodes = { colorNode }

  return { uniforms, nodes }
}
