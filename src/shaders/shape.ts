import { Vector4 } from 'three'
import {
  uv,
  uniform,
  select,
  vec2,
  mix,
  vec4,
  type ShaderNodeObject,
  rotate,
} from 'three/tsl'
import { sdCircle } from './sdf/circle'
import { sdHeart } from './sdf/heart'
import { sdVesica } from './sdf/vesica'
import { UniformNode } from 'three/webgpu'

type ShapeParams = {
  startSize?: number
  startColor?: Vector4
  startThickness?: number
  endSize?: number
  endColor?: Vector4
  endThickness?: number
  time?: number
  duration?: number
  shape?: 0 | 1 | 2
  rotation?: number
  rotating?: boolean
}

const premultiplyRgba = (color: ShaderNodeObject<UniformNode<Vector4>>) =>
  vec4(color.xyz.mul(color.w), color.w)

const defaultParams: Required<ShapeParams> = {
  startSize: 1,
  startColor: new Vector4(0, 0, 0, 1),
  startThickness: 0.2,
  endSize: 1,
  endColor: new Vector4(1, 1, 1, 1),
  endThickness: 0.2,
  time: 0,
  duration: 1,
  shape: 0,
  rotation: 0,
  rotating: true,
}

export const shape = (params?: ShapeParams) => {
  const par = { ...defaultParams, ...params }

  const startColor = uniform(par.startColor)
  const startSize = uniform(par.startSize)
  const startThickness = uniform(par.startThickness)
  const endColor = uniform(par.endColor)
  const endSize = uniform(par.endSize)
  const endThickness = uniform(par.endThickness)
  const t = uniform(par.time)
  const sh = uniform(par.shape)
  const d = uniform(par.duration)
  const r = uniform(par.rotation)
  const isRot = uniform(par.rotating ? 1 : 0)

  const easedT = t //.pow(0.5)

  const size = mix(startSize, endSize, easedT)
  const color = mix(
    premultiplyRgba(startColor),
    premultiplyRgba(endColor),
    easedT
  )
  const thickness = mix(startThickness, endThickness, easedT).mul(0.5).mul(size)

  const sizeMinusThickness = size.sub(thickness)

  // const size = startSize.add(endSize.sub(startSize).mul(radius)).sub(thickness)

  const p = uv().sub(0.5).mul(2)
  const rotatedP = rotate(p, select(isRot, r.mul(t), r))

  let shap = select(sh.equal(0), sdCircle(rotatedP, sizeMinusThickness), 0)
  shap = select(
    sh.equal(1),
    sdHeart(rotatedP.div(sizeMinusThickness.mul(1.66667)).add(vec2(0, 0.59))),
    shap
  )
  shap = select(sh.equal(2), sdVesica(rotatedP, sizeMinusThickness, 0.2), shap)

  // shap = shap.oneMinus()

  // const colorNode = shap //.abs().step(thickness).toVec4().mul(color)

  const colorNode = shap.abs().step(thickness).toVec4().mul(color)

  return {
    uniforms: {
      startColor,
      startSize,
      startThickness,
      endColor,
      endSize,
      endThickness,
      time: t,
      shape: sh,
      duration: d,
      rotation: r,
      rotating: isRot,
    },
    nodes: { colorNode },
  }
}
