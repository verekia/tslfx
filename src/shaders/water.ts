import { Vector4 } from 'three'
import {
  vec2,
  vec3,
  vec4,
  uv,
  uniform,
  float,
  mix,
  ShaderNodeObject,
  mx_noise_vec3,
} from 'three/tsl'
import { UniformNode } from 'three/webgpu'

const premultiplyRgba = (color: ShaderNodeObject<UniformNode<Vector4>>) =>
  vec4(color.xyz.mul(color.w), color.w)

type WaterParams = {
  color1?: Vector4
  color2?: Vector4
  scale?: number
  time?: number
  octaves?: number
}

const defaultParams: Required<WaterParams> = {
  scale: 1,
  time: 0,
  color1: new Vector4(0, 0, 0, 1),
  color2: new Vector4(1, 1, 1, 1),
  octaves: 0,
}

const getFloatValue = (
  xy: ReturnType<typeof vec2>,
  time: ReturnType<typeof float>
) => float(0.7).mul(mx_noise_vec3(vec3(xy, float(0.3).mul(time))))

export const water = (params: WaterParams) => {
  const p = { ...defaultParams, ...params }

  const scale = uniform(p.scale)
  const time = uniform(p.time)
  const color1 = uniform(p.color1)
  const color2 = uniform(p.color2)

  const space = uv().sub(0.5).mul(scale).add(0.5)

  // @ts-expect-error
  let rainbowFloat = getFloatValue(space, time)

  const fbmStep = vec2(1.3, 1.7)

  for (let i = 1; i <= p.octaves; i++) {
    const amplitude = float(Math.pow(0.5, i))
    const frequency = Math.pow(2, i)

    rainbowFloat = rainbowFloat.add(
      amplitude.mul(
        // @ts-expect-error
        getFloatValue(space.mul(frequency).sub(fbmStep.mul(i)), time)
      )
    )
  }

  const adjusted = vec4(float(0.5).add(float(0.5).mul(rainbowFloat.xxxx)))

  const colorNode = mix(
    premultiplyRgba(color1),
    premultiplyRgba(color2),
    adjusted
  )

  return {
    uniforms: { scale, time, color1, color2 },
    nodes: { colorNode },
  }
}
