import {
  mix,
  time,
  uniform,
  vec4,
  length,
  positionLocal,
  smoothstep,
  float,
} from 'three/tsl'
import type { UniformNode, Vector4 } from 'three/webgpu'

type PulsingRingParams = {
  pulsesPerGroup?: number
  delayBetweenGroups?: number
  speed?: number
  startColor?: [number, number, number, number]
  endColor?: [number, number, number, number]
  startThickness?: number
  endThickness?: number
  maxRadius?: number
  transitionStart?: number
  transitionDuration?: number
  innerSmoothness?: number
  outerSmoothness?: number
}

const defaultParams: Required<PulsingRingParams> = {
  pulsesPerGroup: 3,
  delayBetweenGroups: 2,
  speed: 1,
  startColor: [1, 0, 0, 1],
  endColor: [0, 0, 1, 0],
  startThickness: 0.07,
  endThickness: 0.02,
  maxRadius: 0.45,
  transitionStart: 0.6,
  transitionDuration: 0.3,
  innerSmoothness: 0.01,
  outerSmoothness: 0.01,
}

export const pulsingRing = (params: PulsingRingParams = {}) => {
  const p = { ...defaultParams, ...params }

  const pulsesPerGroup = uniform(p.pulsesPerGroup)
  const delayBetweenGroups = uniform(p.delayBetweenGroups)
  const speed = uniform(p.speed)
  const startColor = uniform(vec4(...p.startColor))
  const endColor = uniform(vec4(...p.endColor))
  const startThickness = uniform(p.startThickness)
  const endThickness = uniform(p.endThickness)
  const maxRadius = uniform(p.maxRadius)
  const transitionStart = uniform(p.transitionStart)
  const transitionDuration = uniform(p.transitionDuration)
  const innerSmoothness = uniform(p.innerSmoothness)
  const outerSmoothness = uniform(p.outerSmoothness)

  const totalCycleTime = pulsesPerGroup.add(delayBetweenGroups)
  const currentTime = time.mul(speed)
  const cycleProgress = currentTime.div(totalCycleTime).fract()

  // const pulseSpacing = uniform(0.3)

  // Calculate individual ring for each pulse in the group
  const calculateRing = (offset: number) => {
    const adjustedProgress = cycleProgress.mul(totalCycleTime).add(offset)
    const isActive = adjustedProgress.lessThan(pulsesPerGroup)

    const pulseIndex = adjustedProgress.floor()
    const pulseProgress = adjustedProgress.sub(pulseIndex)
    const radiusProgress = pulseProgress.mul(isActive)

    const radius = radiusProgress.mul(maxRadius)
    const transitionFactor = smoothstep(
      transitionStart,
      transitionStart.add(transitionDuration),
      radiusProgress
    )
    const currentThickness = mix(startThickness, endThickness, transitionFactor)

    const dist = length(positionLocal.xy)
    const ringOpacity = smoothstep(
      radius.sub(currentThickness),
      radius.sub(currentThickness).add(innerSmoothness),
      dist
    ).sub(smoothstep(radius.sub(outerSmoothness), radius, dist))

    const color = mix(startColor, endColor, transitionFactor)
    return color.mul(vec4(1, 1, 1, ringOpacity)).mul(float(isActive))
  }

  // Combine two rings with different offsets
  const ring1 = calculateRing(0)
  // const ring2 = calculateRing(0.3) // Start the second ring one step behind
  // const colorNode = ring1.add(ring2)
  // const ring2 = calculateRing(0.3) // Start the second ring one step behind
  const colorNode = ring1

  return {
    uniforms: {
      pulsesPerGroup,
      delayBetweenGroups,
      speed,
      startThickness,
      endThickness,
      maxRadius,
      startColor: startColor as unknown as UniformNode<Vector4>,
      endColor: endColor as unknown as UniformNode<Vector4>,
      transitionStart,
      transitionDuration,
      innerSmoothness,
      outerSmoothness,
      // pulseSpacing,
    },
    nodes: { colorNode },
  }
}
