import {
  vec2,
  vec3,
  vec4,
  dot,
  abs,
  max,
  uv,
  select,
  type ShaderNodeObject,
  uniform,
  float,
} from 'three/tsl'

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83#simplex-noise

const permute = (x: ReturnType<typeof vec3>) => x.mul(34).add(1).mul(x).mod(289)

const snoise = (v: ReturnType<typeof vec2>) => {
  const C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  )
  let i = dot(v, C.yy).add(v).floor()
  const x0 = v.sub(i).add(dot(i, C.xx))
  const i1 = select(x0.x.greaterThan(x0.y), vec2(1, 0), vec2(0, 1))
  const x12 = x0.xyxy.add(C.xxzz).sub(vec4(i1, 0, 0))
  i = i.mod(289)
  const p = permute(
    permute(vec3(0, i1.y, 1).add(i.y)).add(vec3(0, i1.x, 1).add(i.x))
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let m: ShaderNodeObject<any> = max(
    vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw))
      .negate()
      .add(0.5),
    0
  )
  m = m.mul(m)
  m = m.mul(m)
  const x = p.mul(C.www).fract().mul(2).sub(1)
  const h = abs(x).sub(0.5)
  const ox = x.add(0.5).floor()
  const a0 = x.sub(ox)
  m = m.mul(
    a0.mul(a0).add(h.mul(h)).mul(-0.85373472095314).add(1.79284291400159)
  )
  const g = vec3(
    a0.x.mul(x0.x).add(h.x.mul(x0.y)),
    a0.yz.mul(x12.xz).add(h.yz.mul(x12.yw))
  )
  return dot(m, g).mul(130)
}

type SimplexNoiseParams = {
  scale?: number
}

const defaultParams: Required<SimplexNoiseParams> = { scale: 1 }

export const simplexNoise2D = (params: SimplexNoiseParams) => {
  const p = { ...defaultParams, ...params }

  const scale = uniform(p.scale)

  const uniforms = { scale }

  const colorNode = float(0.5).add(float(0.5).mul(snoise(uv().mul(scale))))

  const nodes = { colorNode }

  return { uniforms, nodes }
}
