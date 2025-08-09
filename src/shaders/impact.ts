import { Vector4 } from 'three'
import { uniform, type ShaderNodeObject, vec2, float, rotate, PI, hash, Fn, Loop, vec4 } from 'three/tsl'
import type { IndexNode, Node } from 'three/webgpu'
import { sdCircle } from './sdf/circle'
import { sdVesica } from './sdf/vesica'
import { multiplyRgbByAlpha, uvCenterNdc } from './util'

export const defaultImpactUniforms = {
  time: 0,
  aspect: 1,
  circleColor: new Vector4(0, 0, 0, 1),
  vesicaColor: new Vector4(1, 1, 1, 1),
  duration: 1,
  seed: 0,
  vesicaCount: 5,
  circleSizeStart: 0,
  circleSizeEnd: 1,
  circleThickness: 0.2,
}

export type ImpactUniforms = typeof defaultImpactUniforms

export type ImpactOptions = {
  instanceIndex?: ShaderNodeObject<IndexNode>
  instanceCount?: number
}

export const impact = (uniforms: Partial<ImpactUniforms> = {}, options: ImpactOptions = {}) => {
  const init = { ...defaultImpactUniforms, ...uniforms }

  const u = {
    time: uniform(init.time),
    aspect: uniform(init.aspect),
    circleColor: uniform(init.circleColor),
    vesicaColor: uniform(init.vesicaColor),
    duration: uniform(init.duration),
    seed: uniform(init.seed),
    circleSizeStart: uniform(init.circleSizeStart),
    circleSizeEnd: uniform(init.circleSizeEnd),
    circleThickness: uniform(init.circleThickness),
    vesicaCount: uniform(init.vesicaCount),
  }

  const seedAndIndex = u.seed.add(options.instanceIndex ? options.instanceIndex.toFloat() : 0)

  const position = uvCenterNdc().mul(vec2(u.aspect, 1))

  const tWithOffset =
    options.instanceIndex && options.instanceCount
      ? u.time.add(options.instanceIndex.toFloat().div(options.instanceCount).mul(0.3)).mod(1)
      : u.time

  const radius = tWithOffset.pow(0.5)
  const thickness = u.circleThickness.mul(0.5)
  const circleSize = u.circleSizeStart.add(u.circleSizeEnd.sub(u.circleSizeStart).mul(radius)).sub(thickness)
  const circle = sdCircle(position, circleSize).abs().step(thickness).toVec4().mul(multiplyRgbByAlpha(u.circleColor))

  const createVesica = (pos: ShaderNodeObject<Node>, se: ShaderNodeObject<Node>) => {
    const vesicaR = float(1).mul(tWithOffset.oneMinus().mul(tWithOffset).mul(2))
    const vesicaD = float(0.8).mul(tWithOffset.oneMinus().mul(tWithOffset).mul(2))

    const rotatedPForVesica = rotate(pos, hash(se).mul(2).sub(1).mul(PI)).add(vec2(0, tWithOffset.mul(0.9)))
    const vesica = sdVesica(rotatedPForVesica, vesicaR, vesicaD)
      .step(0.01)
      .toVec4()
      .mul(multiplyRgbByAlpha(u.vesicaColor))
    return vesica
  }

  const vesicas = Fn(() => {
    const result = vec4(0).toVar()
    return Loop(u.vesicaCount, ({ i }) => result.addAssign(createVesica(position, seedAndIndex.add(i))))
  })()

  const colorNode = circle.add(vesicas)

  return { uniforms: u, nodes: { colorNode } }
}
