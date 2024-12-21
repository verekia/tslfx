import { mix, time, uniform, vec4, length, positionLocal, smoothstep, float } from 'three/tsl'
import { UniformNode, Vector4 } from 'three/webgpu'

export const pulsingRing = () => {
  const pulsesPerGroup = uniform(3)
  const delayBetweenGroups = uniform(2)
  const speed = uniform(1)
  const startColor = uniform(vec4(1, 0, 0, 1))
  const endColor = uniform(vec4(0, 0, 1, 0))
  const startThickness = uniform(0.07)
  const endThickness = uniform(0.02)
  const maxRadius = uniform(0.45)
  const transitionStart = uniform(0.6)
  const transitionDuration = uniform(0.3)
  const innerSmoothness = uniform(0.01)
  const outerSmoothness = uniform(0.01)

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
