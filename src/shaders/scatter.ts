import { Vector4 } from 'three'
import { uniform, type ShaderNodeObject, vec2, float, rotate, PI, hash, Fn, Loop, vec4 } from 'three/tsl'
import type { IndexNode, Node } from 'three/webgpu'
import { sdVesica } from './sdf/vesica'
import { multiplyRgbByAlpha, uvCenterNdc } from './util'

export const defaultScatterUniforms = {
  time: 0,
  aspect: 1,
  vesicaColor: new Vector4(1, 1, 1, 1),
  duration: 1,
  seed: 0,
  vesicaCount: 5,
  radiusStart: 0,
  radiusEnd: 1,
}

export type ScatterUniforms = typeof defaultScatterUniforms

export type ScatterOptions = {
  instanceIndex?: ShaderNodeObject<IndexNode>
  instanceCount?: number
}

export const scatter = (uniforms: Partial<ScatterUniforms> = {}, options: ScatterOptions = {}) => {
  const init = { ...defaultScatterUniforms, ...uniforms }

  const u = {
    time: uniform(init.time),
    aspect: uniform(init.aspect),
    vesicaColor: uniform(init.vesicaColor),
    duration: uniform(init.duration),
    seed: uniform(init.seed),
    vesicaCount: uniform(init.vesicaCount),
    radiusStart: uniform(init.radiusStart),
    radiusEnd: uniform(init.radiusEnd),
  }

  const seedAndIndex = u.seed.add(options.instanceIndex ? options.instanceIndex.toFloat() : 0)

  const position = uvCenterNdc().mul(vec2(u.aspect, 1))

  const tWithOffset =
    options.instanceIndex && options.instanceCount
      ? u.time.add(options.instanceIndex.toFloat().div(options.instanceCount).mul(0.3)).mod(1)
      : u.time

  const createVesica = (pos: ShaderNodeObject<Node>, se: ShaderNodeObject<Node>) => {
    const vesicaR = float(1).mul(tWithOffset.oneMinus().mul(tWithOffset).mul(2))
    const vesicaD = float(0.8).mul(tWithOffset.oneMinus().mul(tWithOffset).mul(2))

    const rotatedPForVesica = rotate(pos, hash(se).mul(2).sub(1).mul(PI)).add(vec2(0, tWithOffset.mul(0.9)))
    const vesica = sdVesica(rotatedPForVesica, vesicaR, vesicaD)
      .step(0)
      .oneMinus()
      .toVec4()
      .mul(multiplyRgbByAlpha(u.vesicaColor))
    return vesica
  }

  const vesicas = Fn(() => {
    const result = vec4(0).toVar()
    return Loop(u.vesicaCount, ({ i }) => result.addAssign(createVesica(position, seedAndIndex.add(i))))
  })()

  const colorNode = vesicas

  return { uniforms: u, nodes: { colorNode } }
}
