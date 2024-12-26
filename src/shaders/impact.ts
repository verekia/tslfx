import { Vector4 } from 'three'
import {
  vec4,
  uv,
  uniform,
  type ShaderNodeObject,
  vec2,
  float,
  rotate,
  PI,
  hash,
} from 'three/tsl'
import type { UniformNode } from 'three/webgpu'
import { sdCircle } from './sdf/circle'
import { sdVesica } from './sdf/vesica'

const premultiplyRgba = (color: ShaderNodeObject<UniformNode<Vector4>>) =>
  vec4(color.xyz.mul(color.w), color.w)

type ImpactParams = {
  color1?: Vector4
  color2?: Vector4
  scale?: number
  time?: number
  aspect?: number
  rotation?: number
  duration?: number
}

const defaultParams: Required<ImpactParams> = {
  time: 0,
  scale: 1,
  aspect: 1,
  rotation: 0,
  color1: new Vector4(0, 0, 0, 1),
  color2: new Vector4(1, 1, 1, 1),
  duration: 1,
}

export const impact = (params: ImpactParams) => {
  const par = { ...defaultParams, ...params }

  const t = uniform(par.time)
  const s = uniform(par.scale)
  const a = uniform(par.aspect)
  const r = uniform(par.rotation)
  const c1 = uniform(par.color1)
  const c2 = uniform(par.color2)
  const d = uniform(par.duration)

  const p = uv().sub(0.5).mul(2).mul(s).mul(vec2(a, 1))
  // const transparent = vec4(0, 0, 0, 0)

  const circleThickness = float(0.1)
  const radius = t.pow(3)
  const circle = sdCircle(p, circleThickness.oneMinus().sub(0.2).sub(radius))
    .abs()
    .step(circleThickness)
    .toVec4()
    .mul(premultiplyRgba(c1))

  const createVesica = (pos: ReturnType<typeof vec2>, seed: number) => {
    const vesicaR = float(1).mul(t.oneMinus().mul(t).mul(2))
    const vesicaD = float(0.8).mul(t.oneMinus().mul(t).mul(2))

    const rotatedPForVesica = rotate(pos, hash(seed).mul(2).sub(1).mul(PI)).add(
      vec2(0, t)
    )
    const vesica = sdVesica(rotatedPForVesica, vesicaR, vesicaD)
      .step(0.01)
      .toVec4()
      .mul(premultiplyRgba(c2))
    return vesica
  }

  const vesica1 = createVesica(p, 0)
  const vesica2 = createVesica(p, 1)
  const vesica3 = createVesica(p, 2)

  const colorNode = circle.add(vesica1).add(vesica2).add(vesica3)

  return {
    uniforms: {
      time: t,
      scale: s,
      aspect: a,
      rotation: r,
      color1: c1,
      color2: c2,
      duration: d,
    },
    nodes: { colorNode },
  }
}
