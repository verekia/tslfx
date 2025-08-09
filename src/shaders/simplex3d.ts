import { Vector4 } from 'three'
import {
  vec2,
  vec3,
  vec4,
  dot,
  abs,
  max,
  uniform,
  float,
  floor,
  step,
  min,
  mix,
  type ShaderNodeObject,
} from 'three/tsl'
import { multiplyRgbByAlpha, taylorInvSqrt, uvCenter } from './util'
import type { Node } from 'three/webgpu'

// https://github.com/stegu/webgl-noise

const mod289 = (x: ShaderNodeObject<Node>) => x.sub(floor(x.mul(1 / 289)).mul(289))

const permute = (x: ShaderNodeObject<Node>) => mod289(x.mul(34).add(10).mul(x))

const snoise = (v: ReturnType<typeof vec3>) => {
  const C = vec2(1 / 6, 1 / 3)
  const D = vec4(0, 0.5, 1, 2)

  // First corner
  let i = floor(v.add(dot(v, C.yyy)))
  const x0 = v.sub(i).add(dot(i, C.xxx))

  const g = step(x0.yzx, x0.xyz)
  const l = float(1).sub(g)
  const i1 = min(g.xyz, l.zxy)
  const i2 = max(g.xyz, l.zxy)

  const x1 = x0.sub(i1).add(C.xxx)
  const x2 = x0.sub(i2).add(C.yyy)
  const x3 = x0.sub(D.yyy)

  // @ts-expect-error
  i = mod289(i)

  const p = permute(
    permute(
      permute(i.z.add(vec4(0, i1.z, i2.z, 1)))
        .add(i.y)
        .add(vec4(0, i1.y, i2.y, 1))
    )
      .add(i.x)
      .add(vec4(0, i1.x, i2.x, 1))
  )

  const n_ = float(1 / 7)
  const ns = n_.mul(D.wyz).sub(D.xzx)

  const j = p.sub(float(49).mul(floor(p.mul(ns.z).mul(ns.z))))

  const x_ = floor(j.mul(ns.z))
  const y_ = floor(j.sub(float(7).mul(x_)))

  const x = x_.mul(ns.x).add(ns.yyyy)
  const y = y_.mul(ns.x).add(ns.yyyy)
  const h = float(1).sub(abs(x)).sub(abs(y))

  const b0 = vec4(x.xy, y.xy)
  const b1 = vec4(x.zw, y.zw)

  const s0 = floor(b0).mul(2).add(1)
  const s1 = floor(b1).mul(2).add(1)
  const sh = step(h, vec4(0)).negate()

  const a0 = b0.xzyw.add(s0.xzyw.mul(sh.xxyy))
  const a1 = b1.xzyw.add(s1.xzyw.mul(sh.zzww))

  let p0: ShaderNodeObject<Node> = vec3(a0.xy, h.x)
  let p1: ShaderNodeObject<Node> = vec3(a0.zw, h.y)
  let p2: ShaderNodeObject<Node> = vec3(a1.xy, h.z)
  let p3: ShaderNodeObject<Node> = vec3(a1.zw, h.w)

  const norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)))

  p0 = p0.mul(norm.x)
  p1 = p1.mul(norm.y)
  p2 = p2.mul(norm.z)
  p3 = p3.mul(norm.w)

  let m: ShaderNodeObject<Node> = max(float(0.5).sub(vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3))), 0)
  m = m.mul(m)

  return float(105).mul(dot(m.mul(m), vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))))
}

type SimplexNoise3DParams = {
  color1?: Vector4
  color2?: Vector4
  scale?: number
  time?: number
  octaves?: number
}

const defaultParams: Required<SimplexNoise3DParams> = {
  scale: 1,
  time: 0,
  color1: new Vector4(0, 0, 0, 1),
  color2: new Vector4(1, 1, 1, 1),
  octaves: 0,
}

const getFloatValue = (xy: ReturnType<typeof vec2>, time: ReturnType<typeof float>) =>
  float(0.7).mul(snoise(vec3(xy, float(0.3).mul(time))))

export const simplexNoise3D = (params: SimplexNoise3DParams) => {
  const p = { ...defaultParams, ...params }

  const scale = uniform(p.scale)
  const time = uniform(p.time)
  const color1 = uniform(p.color1)
  const color2 = uniform(p.color2)

  const space = uvCenter().mul(scale)

  // @ts-expect-error
  let grayscaleFloat = getFloatValue(space, time)

  const fbmStep = vec2(1.3, 1.7)

  for (let i = 1; i <= p.octaves; i++) {
    const amplitude = float(Math.pow(0.5, i))
    const frequency = Math.pow(2, i)

    grayscaleFloat = grayscaleFloat.add(
      amplitude.mul(
        // @ts-expect-error
        getFloatValue(space.mul(frequency).sub(fbmStep.mul(i)), time)
      )
    )
  }

  const adjusted = vec4(float(0.5).add(float(0.5).mul(grayscaleFloat)))

  const colorNode = mix(multiplyRgbByAlpha(color1), multiplyRgbByAlpha(color2), adjusted)

  return {
    uniforms: { scale, time, color1, color2 },
    nodes: { colorNode },
  }
}
