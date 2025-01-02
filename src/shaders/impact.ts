import { Vector4 } from 'three'
import { uniform, type ShaderNodeObject, vec2, float, rotate, PI, hash } from 'three/tsl'
import type { IndexNode, UniformNode } from 'three/webgpu'
import { sdCircle } from './sdf/circle'
import { sdVesica } from './sdf/vesica'
import { multiplyRgbByAlpha, uvCenterNdc } from './util'

export type ImpactParams = {
  circleColor?: Vector4
  vesicaColor?: Vector4
  time?: number
  aspect?: number
  rotation?: number
  duration?: number
  seed?: number
  vesicaCount?: number
  circleSizeStart?: number
  circleSizeEnd?: number
  circleThickness?: number
  instanceIndex?: ShaderNodeObject<IndexNode> | undefined
}

const defaultParams: Required<Omit<ImpactParams, 'instanceIndex'>> = {
  time: 0,
  aspect: 1,
  rotation: 0,
  circleColor: new Vector4(0, 0, 0, 1),
  vesicaColor: new Vector4(1, 1, 1, 1),
  duration: 1,
  seed: 0,
  vesicaCount: 3, // Requires recompilation
  circleSizeStart: 0.5,
  circleSizeEnd: 1,
  circleThickness: 0.2,
}

export const impact = (params: ImpactParams) => {
  const par = { ...defaultParams, ...params }

  const t = uniform(par.time)
  const a = uniform(par.aspect)
  const r = uniform(par.rotation)
  const cCol = uniform(par.circleColor)
  const vCol = uniform(par.vesicaColor)
  const d = uniform(par.duration)
  const seed = uniform(par.seed)
  const css = uniform(par.circleSizeStart)
  const cse = uniform(par.circleSizeEnd)
  const ct = uniform(par.circleThickness)

  // const seedAndIndex = select(par.instanceIndex.toFloat().greaterThan(0), seed, seed.add(par.instanceIndex.toFloat()))
  const seedAndIndex = seed.add(par.instanceIndex ? par.instanceIndex.toFloat() : 0)

  const p = uvCenterNdc().mul(vec2(a, 1))

  const radius = t.pow(0.5)
  const thickness = ct.mul(0.5)
  const circleSize = css.add(cse.sub(css).mul(radius)).sub(thickness)
  const circle = sdCircle(p, circleSize).abs().step(thickness).toVec4().mul(multiplyRgbByAlpha(cCol))

  const createVesica = (
    pos: ReturnType<typeof vec2>,
    se: ShaderNodeObject<UniformNode<number>> | ReturnType<typeof float>
  ) => {
    const vesicaR = float(1).mul(t.oneMinus().mul(t).mul(2))
    const vesicaD = float(0.8).mul(t.oneMinus().mul(t).mul(2))

    const rotatedPForVesica = rotate(pos, hash(se).mul(2).sub(1).mul(PI)).add(vec2(0, t.mul(0.9)))
    const vesica = sdVesica(rotatedPForVesica, vesicaR, vesicaD).step(0.01).toVec4().mul(multiplyRgbByAlpha(vCol))
    return vesica
  }

  let result = circle

  for (let i = 0; i < par.vesicaCount; i++) {
    result = result.add(createVesica(p, seedAndIndex.add(i)))
  }

  const colorNode = result

  return {
    uniforms: {
      time: t,
      aspect: a,
      rotation: r,
      circleColor: cCol,
      vesicaColor: vCol,
      duration: d,
      seed,
      circleSizeStart: css,
      circleSizeEnd: cse,
      circleThickness: ct,
    },
    nodes: { colorNode },
  }
}
