import { uniform, mix, rotate } from 'three/tsl'
import { Vector4 } from 'three'
import { multiplyRgbByAlpha, uvCenter } from './util'

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

export const gradient = (params: GradientParams = {}) => {
  const p = { ...defaultParams, ...params }

  const color1 = uniform(p.color1)
  const color2 = uniform(p.color2)
  const rotation = uniform(p.rotation)

  const rotatedUV = rotate(uvCenter(), rotation)
  const colorNode = mix(
    multiplyRgbByAlpha(color1),
    multiplyRgbByAlpha(color2),
    rotatedUV.y
  )

  return {
    uniforms: { color1, color2, rotation },
    nodes: { colorNode },
  }
}
