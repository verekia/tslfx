import {
  color,
  normalLocal,
  uv,
  time,
  mul,
  add,
  div,
  mix,
  vec3,
  vec4,
  mx_noise_float,
  mx_fractal_noise_vec3,
  step,
  abs,
  pow,
  smoothstep,
} from 'three/tsl'

export const waterfall = (options: {
  flowSpeed?: number
  foamColor?: string
  deepBlueScale?: number
  deepBlueFlowSpeed?: number
  deepBlueNoiseSpeed?: number
  // Water colors
  deepBlueColor?: string
  lightBlueColor?: string
  // Slow foam layer controls
  slowFoamSpeed?: number
  slowFoamColor?: string
  slowFoamAlpha?: number
  slowFoamScaleX?: number
  slowFoamScaleY?: number
  slowFoamThreshold?: number
  // Medium foam layer controls
  mediumFoamSpeed?: number
  mediumFoamColor?: string
  mediumFoamAlpha?: number
  mediumFoamScaleX?: number
  mediumFoamScaleY?: number
  mediumFoamThreshold?: number
  // Fast foam layer controls
  fastFoamSpeed?: number
  fastFoamColor?: string
  fastFoamAlpha?: number
  fastFoamScaleX?: number
  fastFoamScaleY?: number
  fastFoamThreshold?: number
  // Speed variation controls
  verticalSpeedMultiplier?: number
  horizontalSpeedMultiplier?: number
  speedTransitionPower?: number
}) => {
  const baseFlowSpeed = options.flowSpeed ?? 0.02
  const deepBlueScale = options.deepBlueScale ?? 3.0
  const baseDeepBlueFlowSpeed = options.deepBlueFlowSpeed ?? 0.2
  const deepBlueNoiseSpeed = options.deepBlueNoiseSpeed ?? 0.1

  // Water colors
  const deepBlueColor = color(options.deepBlueColor ?? '#07e')
  const lightBlueColor = color(options.lightBlueColor ?? '#08f')

  // Speed multipliers for vertical vs horizontal surfaces
  const verticalSpeedMultiplier = options.verticalSpeedMultiplier ?? 2.2
  const horizontalSpeedMultiplier = options.horizontalSpeedMultiplier ?? 0.5
  const speedTransitionPower = options.speedTransitionPower ?? 1.5

  // Calculate speed multiplier based on surface normal
  const speedMultiplier = (() => {
    const normal = normalLocal
    // Calculate how vertical the surface is from the side view (YZ plane)
    // Side verticality: larger abs(normal.z) = more vertical from side view
    // Side horizontality: larger abs(normal.y) = more horizontal from side view
    const sideVerticality = abs(normal.z)
    const sideHorizontality = abs(normal.y)

    // Normalize the verticality relative to the YZ plane magnitude
    const yzMagnitude = add(sideVerticality, sideHorizontality)
    const normalizedSideVerticality = div(sideVerticality, yzMagnitude)

    // Apply power function for smoother, more forgiving transitions
    // Values > 1 make mostly-vertical surfaces behave more like fully vertical
    // and mostly-horizontal surfaces behave more like fully horizontal
    const smoothedVerticality = pow(normalizedSideVerticality, speedTransitionPower)

    // Use smoothstep for even more gentle transitions at the extremes
    const finalVerticality = smoothstep(0.1, 0.9, smoothedVerticality)

    return mix(horizontalSpeedMultiplier, verticalSpeedMultiplier, finalVerticality)
  })()

  // Calculate vertical stretch factor for speed effect
  const verticalStretchFactor = (() => {
    // More vertical surfaces get more stretching (higher values stretch more)
    // Base stretch of 1.0 = no stretch, higher values = more vertical stretch
    const maxStretch = 3.0 // Maximum stretch factor for fully vertical surfaces
    const minStretch = 1.0 // No stretch for horizontal surfaces

    const normal = normalLocal
    const sideVerticality = abs(normal.z)
    const sideHorizontality = abs(normal.y)
    const yzMagnitude = add(sideVerticality, sideHorizontality)
    const normalizedSideVerticality = div(sideVerticality, yzMagnitude)
    const smoothedVerticality = pow(normalizedSideVerticality, speedTransitionPower)
    const finalVerticality = smoothstep(0.1, 0.9, smoothedVerticality)

    return mix(minStretch, maxStretch, finalVerticality)
  })()

  // Apply speed multiplier to all flow speeds
  const flowSpeed = mul(baseFlowSpeed, speedMultiplier)
  const deepBlueFlowSpeed = mul(baseDeepBlueFlowSpeed, speedMultiplier)

  // Slow foam controls
  const baseSlowFoamSpeed = options.slowFoamSpeed ?? 0.4
  const slowFoamSpeed = mul(baseSlowFoamSpeed, speedMultiplier)
  const slowFoamColor = color(options.slowFoamColor ?? '#ffffff')
  const slowFoamAlpha = options.slowFoamAlpha ?? 0.05
  const slowFoamScaleX = options.slowFoamScaleX ?? 1.5
  const slowFoamScaleY = options.slowFoamScaleY ?? 3.0
  const slowFoamThreshold = options.slowFoamThreshold ?? 0.3

  // Medium foam controls
  const baseMediumFoamSpeed = options.mediumFoamSpeed ?? 0.15
  const mediumFoamSpeed = mul(baseMediumFoamSpeed, speedMultiplier)
  const mediumFoamColor = color(options.mediumFoamColor ?? '#ffffff')
  const mediumFoamAlpha = options.mediumFoamAlpha ?? 0.25
  const mediumFoamScaleX = options.mediumFoamScaleX ?? 2.0
  const mediumFoamScaleY = options.mediumFoamScaleY ?? 15.0
  const mediumFoamThreshold = options.mediumFoamThreshold ?? 0.25

  // Fast foam controls
  const baseFastFoamSpeed = options.fastFoamSpeed ?? 0.2
  const fastFoamSpeed = mul(baseFastFoamSpeed, speedMultiplier)
  const fastFoamColor = color(options.fastFoamColor ?? '#ffffff')
  const fastFoamAlpha = options.fastFoamAlpha ?? 0.5
  const fastFoamScaleX = options.fastFoamScaleX ?? 3.0
  const fastFoamScaleY = options.fastFoamScaleY ?? 20.0
  const fastFoamThreshold = options.fastFoamThreshold ?? 0.3

  const colorNode = (() => {
    const uvCoords = uv()

    // Create flowing coordinate system
    const flowingY = add(uvCoords.y, mul(time, flowSpeed))

    // Deep blue fractal noise layer - flowing down the waterfall
    const deepBlueLayer = (() => {
      // Use separate flowing coordinates for the deep blue patterns
      const deepBlueFlowingY = add(uvCoords.y, mul(time, deepBlueFlowSpeed))
      const stretchedFlowingUV = vec3(
        uvCoords.x,
        mul(deepBlueFlowingY, verticalStretchFactor),
        mul(time, deepBlueNoiseSpeed)
      )
      const noise = mx_fractal_noise_vec3(mul(stretchedFlowingUV, deepBlueScale)).xxx
      const deepBlueBand = step(0, noise)

      return mix(
        vec3(lightBlueColor.r, lightBlueColor.g, lightBlueColor.b),
        vec3(deepBlueColor.r, deepBlueColor.g, deepBlueColor.b),
        deepBlueBand
      )
    })()

    // Slow horizontal foam with custom controls
    const slowHorizontalFoam = (() => {
      const slowFlow = add(flowingY, mul(time, slowFoamSpeed))
      const stretchedSlowFlow = mul(slowFlow, verticalStretchFactor)
      const horizontalNoise1 = mx_noise_float(
        vec3(mul(uvCoords.x, slowFoamScaleX), mul(stretchedSlowFlow, slowFoamScaleY), mul(time, 0.2))
      )
      const horizontalNoise2 = mx_noise_float(
        vec3(
          mul(uvCoords.x, mul(slowFoamScaleX, 0.7)),
          mul(stretchedSlowFlow, mul(slowFoamScaleY, 0.8)),
          mul(time, 0.15)
        )
      )

      const layeredHorizontal = add(mul(horizontalNoise1, 0.6), mul(horizontalNoise2, 0.4))
      const horizontalFoam = step(slowFoamThreshold, layeredHorizontal)

      return vec4(slowFoamColor.r, slowFoamColor.g, slowFoamColor.b, mul(horizontalFoam, slowFoamAlpha))
    })()

    // Medium horizontal foam with custom controls
    const mediumHorizontalFoam = (() => {
      const mediumFlow = add(flowingY, mul(time, mediumFoamSpeed))
      const stretchedMediumFlow = mul(mediumFlow, verticalStretchFactor)
      const mediumNoise1 = mx_noise_float(
        vec3(mul(uvCoords.x, mediumFoamScaleX), mul(stretchedMediumFlow, mediumFoamScaleY), mul(time, 0.4))
      )
      const mediumNoise2 = mx_noise_float(
        vec3(
          mul(uvCoords.x, mul(mediumFoamScaleX, 0.9)),
          mul(stretchedMediumFlow, mul(mediumFoamScaleY, 1.2)),
          mul(time, 0.35)
        )
      )

      const layeredMedium = add(mul(mediumNoise1, 0.5), mul(mediumNoise2, 0.5))
      const mediumFoam = step(mediumFoamThreshold, layeredMedium)

      return vec4(mediumFoamColor.r, mediumFoamColor.g, mediumFoamColor.b, mul(mediumFoam, mediumFoamAlpha))
    })()

    // Fast horizontal foam with custom controls
    const fastHorizontalFoam = (() => {
      const fastFlow = add(flowingY, mul(time, fastFoamSpeed))
      const stretchedFastFlow = mul(fastFlow, verticalStretchFactor)
      const fastNoise1 = mx_noise_float(
        vec3(mul(uvCoords.x, fastFoamScaleX), mul(stretchedFastFlow, fastFoamScaleY), mul(time, 0.8))
      )
      const fastNoise2 = mx_noise_float(
        vec3(
          mul(uvCoords.x, mul(fastFoamScaleX, 1.3)),
          mul(stretchedFastFlow, mul(fastFoamScaleY, 1.25)),
          mul(time, 0.6)
        )
      )

      const layeredFast = add(mul(fastNoise1, 0.6), mul(fastNoise2, 0.4))
      const fastFoam = step(fastFoamThreshold, layeredFast)

      return vec4(fastFoamColor.r, fastFoamColor.g, fastFoamColor.b, mul(fastFoam, fastFoamAlpha))
    })()

    // Water color variation
    const waterVariation = (() => {
      const waterNoise = mx_noise_float(vec3(mul(uvCoords, 2.0), mul(time, 0.1)))
      return add(0.9, mul(waterNoise, 0.2))
    })()

    // Layer the foam colors with alpha blending
    const baseWaterColor = mul(deepBlueLayer, waterVariation)

    // Apply each foam layer with its alpha
    const afterSlowFoam = mix(vec4(baseWaterColor, 1.0), slowHorizontalFoam, slowHorizontalFoam.a)
    const afterMediumFoam = mix(afterSlowFoam, mediumHorizontalFoam, mediumHorizontalFoam.a)
    const finalColor = mix(afterMediumFoam, fastHorizontalFoam, fastHorizontalFoam.a)

    return vec3(finalColor.r, finalColor.g, finalColor.b)
  })()

  return { colorNode }
}
