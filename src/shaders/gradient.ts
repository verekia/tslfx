import {
  uniform,
  uv,
  mix,
  rotate,
  vec4,
  type ShaderNodeObject,
} from 'three/tsl'
import { Vector4 } from 'three'
import type { UniformNode } from 'three/webgpu'

type GradientParams = {
  color1?: Vector4
  color2?: Vector4
  rotation?: number
}

const defaultParams: Required<GradientParams> = {
  color1: new Vector4(1, 0, 0, 1),
  color2: new Vector4(0, 1, 0, 1),
  rotation: 0,
}

const premultiplyRgba = (color: ShaderNodeObject<UniformNode<Vector4>>) =>
  vec4(color.xyz.mul(color.w), color.w)

export const gradient = (params: GradientParams = {}) => {
  const p = { ...defaultParams, ...params }

  const color1 = uniform(p.color1)
  const color2 = uniform(p.color2)
  const rotation = uniform(p.rotation)

  const rotatedUV = rotate(uv().sub(0.5), rotation).add(0.5)
  const colorNode = mix(
    premultiplyRgba(color1),
    premultiplyRgba(color2),
    rotatedUV.y
  )

  return {
    uniforms: { color1, color2, rotation },
    nodes: { colorNode },
  }
}
