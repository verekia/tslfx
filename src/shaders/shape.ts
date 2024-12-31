import { Vector2, Vector4 } from 'three'
import { uniform, mix, vec4, smoothstep, float, select } from 'three/tsl'

import { sdCircle } from './sdf/circle'
import { easeInCubic, easeInOutCubic, easeOutCubic, linear } from './easing'
import { multiplyRgbByAlpha, uvCenterNdc } from './util'

export const shapeDefaults = {
  time: 0,
  duration: 1,
  visible: 1 as 0 | 1,

  easing: 0 as 0 | 1 | 2 | 3,
  boomerang: 0 as 0 | 1,
  proportional: 0 as 0 | 1,

  startColor: new Vector4(0, 0, 0, 1),
  startSize: 0,
  startThickness: 1,
  startInnerFade: 0,
  startOuterFade: 0,
  startOffset: new Vector2(0, 0),

  endColor: new Vector4(1, 1, 1, 1),
  endSize: 1,
  endThickness: 1,
  endInnerFade: 0,
  endOuterFade: 0,
  endOffset: new Vector2(0, 0),

  // shape: 0,
  // rotation: 0,
  // rotating: true,
}

export type ShapeParams = typeof shapeDefaults
export type ShapePreset = { name: string; params: ShapeParams }

export const shape = (params?: Partial<ShapeParams>) => {
  const init = { ...shapeDefaults, ...params }

  const u = {
    time: uniform(init.time),
    duration: uniform(init.duration),
    visible: uniform(init.visible),

    boomerang: uniform(init.boomerang),
    proportional: uniform(init.proportional),
    easing: uniform(init.easing),

    startColor: uniform(init.startColor),
    startSize: uniform(init.startSize),
    startThickness: uniform(init.startThickness),
    startInnerFade: uniform(init.startInnerFade),
    startOuterFade: uniform(init.startOuterFade),
    startOffset: uniform(init.startOffset),

    endColor: uniform(init.endColor),
    endSize: uniform(init.endSize),
    endThickness: uniform(init.endThickness),
    endInnerFade: uniform(init.endInnerFade),
    endOuterFade: uniform(init.endOuterFade),
    endOffset: uniform(init.endOffset),
  }

  // const sh = uniform(par.shape)
  // const r = uniform(par.rotation)
  // const isRot = uniform(par.rotating ? 1 : 0)

  const boomerangTime = select(
    u.boomerang,
    select(
      u.time.greaterThan(0.5),
      // For second half, normalize 0.5-1 to 1-0
      float(1).sub(u.time.sub(0.5).mul(2)),
      // For first half, normalize 0-0.5 to 0-1
      u.time.mul(2)
    ),
    u.time
  )

  const easedTime = select(
    u.easing.equal(1),
    easeInCubic(boomerangTime),
    select(
      u.easing.equal(2),
      easeOutCubic(boomerangTime),
      select(u.easing.equal(3), easeInOutCubic(boomerangTime), linear(boomerangTime))
    )
  )

  const color = mix(u.startColor, u.endColor, easedTime)
  const size = mix(u.startSize, u.endSize, easedTime)
  const thickness = mix(u.startThickness, u.endThickness, easedTime).mul(select(u.proportional, size, 1))
  const innerFade = mix(u.startInnerFade, u.endInnerFade, easedTime).mul(select(u.proportional, size, 1))
  const outerFade = mix(u.startOuterFade, u.endOuterFade, easedTime).mul(select(u.proportional, size, 1))
  const offset = mix(u.startOffset, u.endOffset, easedTime)

  const innerRadius = size.sub(thickness)

  const position = uvCenterNdc()
  const dist = sdCircle(position.add(offset.mul(-1)), innerRadius)

  const innerEdge = smoothstep(float(0).sub(innerFade), 0, dist)
  const outerEdge = smoothstep(thickness.sub(outerFade), thickness, dist)
  const opacity = innerEdge.sub(outerEdge).mul(color.w)

  const colorNode = multiplyRgbByAlpha(vec4(color.xyz, opacity))

  const colorNodeVisible = select(u.visible, colorNode, 0)

  return { uniforms: u, nodes: { colorNode: colorNodeVisible } }
}
