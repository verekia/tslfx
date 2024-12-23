import { Vector4 } from 'three'
import {
  vec2,
  vec3,
  vec4,
  dot,
  abs,
  max,
  uv,
  uniform,
  float,
  floor,
  step,
  min,
  mix,
} from 'three/tsl'
import { UniformNode } from 'three/webgpu'

// https://github.com/stegu/webgl-noise

const mod289 = (x: ReturnType<typeof vec3 | typeof vec4>) =>
  x.sub(floor(x.mul(1 / 289)).mul(289))

const permute = (x: ReturnType<typeof vec4>) => mod289(x.mul(34).add(10).mul(x))

const taylorInvSqrt = (r: ReturnType<typeof vec4>) =>
  float(1.79284291400159).sub(r.mul(0.85373472095314))

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

  let p0 = vec3(a0.xy, h.x)
  let p1 = vec3(a0.zw, h.y)
  let p2 = vec3(a1.xy, h.z)
  let p3 = vec3(a1.zw, h.w)

  const norm = taylorInvSqrt(
    vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))
  )

  p0 = p0.mul(norm.x)
  p1 = p1.mul(norm.y)
  p2 = p2.mul(norm.z)
  p3 = p3.mul(norm.w)

  let m: ReturnType<typeof vec4> = max(
    float(0.5).sub(vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3))),
    0
  )
  m = m.mul(m)

  return float(105).mul(
    dot(m.mul(m), vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)))
  )
}

type SimplexNoise3DParams = {
  color1?: Vector4
  color2?: Vector4
  scale?: number
  time?: number
}

const defaultParams: Required<SimplexNoise3DParams> = {
  scale: 1,
  time: 0,
  color1: new Vector4(0, 0, 0, 1),
  color2: new Vector4(1, 1, 1, 1),
}

export const simplexNoise3D = (params: SimplexNoise3DParams) => {
  const p = { ...defaultParams, ...params }

  const scale = uniform(p.scale)
  const time = uniform(float(p.time))
  const color1 = uniform(vec4(p.color1))
  const color2 = uniform(vec4(p.color2))

  const grayscale = snoise(uv().sub(0.5).mul(scale).add(0.5).toVec3(time))

  const colorNode = mix(color1, color2, grayscale)

  return {
    uniforms: {
      scale,
      time,
      color1: color1 as unknown as UniformNode<Vector4>,
      color2: color2 as unknown as UniformNode<Vector4>,
    },
    nodes: { colorNode },
  }
}
