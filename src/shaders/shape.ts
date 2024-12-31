import { Vector2, Vector4 } from 'three'
import { uniform, mix, vec4, smoothstep, float, select } from 'three/tsl'

import { sdCircle } from './sdf/circle'
import { easeInCubic, easeInOutCubic, easeOutCubic, linear } from './easing'
import { multiplyRgbByAlpha, uvCenter } from './util'

type ShapeParams = {
  startSize?: number
  startColor?: Vector4
  startThickness?: number
  startInnerSmoothness?: number
  startOuterSmoothness?: number
  endSize?: number
  endColor?: Vector4
  endThickness?: number
  endInnerSmoothness?: number
  endOuterSmoothness?: number
  time?: number
  duration?: number
  easing?: 0 | 1 | 2 | 3
  startOffset?: Vector2
  endOffset?: Vector2
  // shape?: 0 | 1 | 2
  // rotation?: number
  // rotating?: boolean
  proportional?: 0 | 1
  visible?: 0 | 1
  boomerang?: 0 | 1
}

const defaultParams: Required<ShapeParams> = {
  startSize: 1,
  startColor: new Vector4(0, 0, 0, 1),
  startThickness: 0.2,
  startInnerSmoothness: 0,
  startOuterSmoothness: 0,
  startOffset: new Vector2(0, 0),
  endSize: 1,
  endColor: new Vector4(1, 1, 1, 1),
  endThickness: 0.2,
  endInnerSmoothness: 0,
  endOuterSmoothness: 0,
  endOffset: new Vector2(0, 0),
  time: 0,
  duration: 1,
  // shape: 0,
  // rotation: 0,
  proportional: 0,
  easing: 0,
  // rotating: true,
  visible: 1,
  boomerang: 0,
}

export const shape = (params?: ShapeParams) => {
  const par = { ...defaultParams, ...params }

  const startColor = uniform(par.startColor)
  const startSize = uniform(par.startSize)
  const startThickness = uniform(par.startThickness)
  const startInnerFade = uniform(par.startInnerSmoothness)
  const startOuterFade = uniform(par.startOuterSmoothness)
  const startOffset = uniform(par.startOffset)

  const endColor = uniform(par.endColor)
  const endSize = uniform(par.endSize)
  const endThickness = uniform(par.endThickness)
  const endInnerFade = uniform(par.endInnerSmoothness)
  const endOuterFade = uniform(par.endOuterSmoothness)
  const endOffset = uniform(par.endOffset)
  const visible = uniform(par.visible)
  const boomerang = uniform(par.boomerang)

  const t = uniform(par.time)
  // const sh = uniform(par.shape)
  const d = uniform(par.duration)
  // const r = uniform(par.rotation)
  // const isRot = uniform(par.rotating ? 1 : 0)
  const isProp = uniform(par.proportional)
  const easing = uniform(par.easing)

  const p = uvCenter()

  const boomerangT = select(
    boomerang,
    select(
      t.greaterThan(0.5),
      // For second half, normalize 0.5-1 to 1-0
      float(1).sub(t.sub(0.5).mul(2)),
      // For first half, normalize 0-0.5 to 0-1
      t.mul(2)
    ),
    t
  )

  // Actually the normalized ones are the parameters, these are on 0 - 0.5
  const normStartThickness = startThickness.div(2)
  const normEndThickness = endThickness.div(2)
  const normStartInnerFade = startInnerFade.div(2)
  const normEndInnerFade = endInnerFade.div(2)
  const normStartOuterFade = startOuterFade.div(2)
  const normEndOuterFade = endOuterFade.div(2)
  const normStartSize = startSize.div(2)
  const normEndSize = endSize.div(2)
  const normStartOffset = startOffset.div(2)
  const normEndOffset = endOffset.div(2)

  // Use normalized time for easing calculations
  const easedT = select(
    easing.equal(1),
    easeInCubic(boomerangT),
    select(
      easing.equal(2),
      easeOutCubic(boomerangT),
      select(easing.equal(3), easeInOutCubic(boomerangT), linear(boomerangT))
    )
  )

  const color = mix(startColor, endColor, easedT)
  const size = mix(normStartSize, normEndSize, easedT)

  const thickness = mix(normStartThickness, normEndThickness, easedT).mul(
    select(isProp, size, float(1))
  )
  const innerFade = mix(normStartInnerFade, normEndInnerFade, easedT).mul(
    select(isProp, size, float(1))
  )
  const outerFade = mix(normStartOuterFade, normEndOuterFade, easedT).mul(
    select(isProp, size, float(1))
  )
  const offset = mix(normStartOffset, normEndOffset, easedT)

  const innerRadius = size.sub(thickness)

  const dist = sdCircle(p.add(offset.mul(-1)), innerRadius)

  // Calculate opacity using smoothstep for both inner and outer edges
  const innerEdge = smoothstep(float(0).sub(innerFade), float(0), dist)

  const outerEdge = smoothstep(thickness.sub(outerFade), thickness, dist)

  const opacity = innerEdge.sub(outerEdge).mul(color.w)

  const colorNode = multiplyRgbByAlpha(vec4(color.xyz, opacity))

  const colorNodeVisible = select(visible, colorNode, float(0))

  return {
    uniforms: {
      startColor,
      startSize,
      startThickness,
      endColor,
      endSize,
      endThickness,
      time: t,
      // shape: sh,
      duration: d,
      // rotation: r,
      // rotating: isRot,
      startInnerFade,
      endInnerFade,
      startOuterFade,
      endOuterFade,
      proportional: isProp,
      easing,
      startOffset,
      endOffset,
      visible,
      boomerang,
    },
    nodes: { colorNode: colorNodeVisible },
  }
}
