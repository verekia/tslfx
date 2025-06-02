import {
  color,
  positionLocal,
  mx_fractal_noise_vec3,
  mx_noise_vec3,
  uv,
  time,
  mix,
  smoothstep,
  add,
  mul,
  sub,
  length,
  fract,
  step,
  max,
  min,
  vec3,
  vec4,
} from 'three/tsl'

type WaterfallOptions = {
  // River colors
  riverWaterColor?: string
  riverDeepBlueColor?: string
  riverFoamColor?: string
  riverSurfaceColor?: string

  // Fall colors
  fallWaterColor?: string
  fallFoamColor?: string

  // RoundedEdge colors
  roundedWaterColor?: string
  roundedFoamColor?: string
  roundedSurfaceColor?: string

  // Impact foam colors
  impactFoamColor?: string
  impactWaterColor?: string

  // Impact waves colors
  waveFoamColor?: string
  waveWaterColor?: string

  // Alpha values
  riverAlpha?: number
  fallAlpha?: number
  roundedAlpha?: number
  impactFoamAlpha?: number
  waveAlpha?: number
}

const defaultOptions: Required<WaterfallOptions> = {
  // River colors
  riverWaterColor: '#07b',
  riverDeepBlueColor: '#06a',
  riverFoamColor: 'white',
  riverSurfaceColor: '#08c',

  // Fall colors
  fallWaterColor: '#0a7ab8',
  fallFoamColor: '#ffffff',

  // RoundedEdge colors
  roundedWaterColor: '#0a7ab8',
  roundedFoamColor: '#ffffff',
  roundedSurfaceColor: '#0c8dd4',

  // Impact foam colors
  impactFoamColor: '#ffffff',
  impactWaterColor: '#2a9dd8',

  // Impact waves colors
  waveFoamColor: '#ffffff',
  waveWaterColor: '#1177bb',

  // Alpha values
  riverAlpha: 1.0,
  fallAlpha: 1.0,
  roundedAlpha: 1.0,
  impactFoamAlpha: 0.9,
  waveAlpha: 0.8,
}

const createRiver = (options: Required<WaterfallOptions>) => {
  const uvCoord = uv()
  const timeOffset = mul(time, 0.2)

  // Base water color with alpha
  const waterColor = vec4(color(options.riverWaterColor).rgb, options.riverAlpha)

  // Deep blue layer with hard cartoon edges - faster animation
  const deepBlueNoise = mx_fractal_noise_vec3(vec3(mul(uvCoord.x, 3), sub(uvCoord.y, mul(time, 0.15)), 0)).x // Added proper time animation
  const deepBlueMask = step(0.4, deepBlueNoise)
  const deepBlueColor = vec4(color(options.riverDeepBlueColor).rgb, options.riverAlpha)
  const baseWater = mix(waterColor, deepBlueColor, deepBlueMask)

  // River flow towards bottom
  const flowNoise = mx_fractal_noise_vec3(vec3(uvCoord.x, sub(uvCoord.y, timeOffset), 0)).x
  const surfaceColor = vec4(color(options.riverSurfaceColor).rgb, options.riverAlpha)
  const waterSurface = mix(baseWater, surfaceColor, mul(step(0.5, flowNoise), 0.6))

  // Enhanced foam on edges with animation
  const edgeDistanceLeft = uvCoord.x
  const edgeDistanceRight = sub(1, uvCoord.x)
  const edgeDistance = min(edgeDistanceLeft, edgeDistanceRight)

  // Animated edge foam
  const edgeFoamNoise = mx_noise_vec3(vec3(mul(uvCoord.x, 6), sub(uvCoord.y, mul(time, 0.3)), 0)).x
  const edgeFoamMask = step(0.3, edgeFoamNoise)
  const edgeThreshold = step(edgeDistance, 0.2)
  const edgeFoam = mul(edgeThreshold, edgeFoamMask)

  // Additional surface foam
  const surfaceFoam = mx_noise_vec3(vec3(mul(uvCoord.x, 8), sub(uvCoord.y, mul(time, 0.4)), 0)).x
  const surfaceFoamMask = mul(step(0.6, surfaceFoam), 0.3)

  const foamColor = vec4(color(options.riverFoamColor).rgb, options.riverAlpha)
  const finalFoam = max(edgeFoam, surfaceFoamMask)

  const colorNode = mix(waterSurface, foamColor, finalFoam)

  return { colorNode }
}

const createFall = (options: Required<WaterfallOptions>) => {
  const uvCoord = uv()
  const timeOffset = mul(time, 2.5)

  // Base water color with alpha - no deep blue
  const baseWater = vec4(color(options.fallWaterColor).rgb, options.fallAlpha)

  // Multiple layers of vertical foam lines - all flowing properly
  const verticalFlow = add(uvCoord.y, timeOffset)

  // Primary foam lines - main structure
  const foamLines1 = mx_fractal_noise_vec3(vec3(mul(uvCoord.x, 12), verticalFlow, 0)).x
  const foamMask1 = step(0.5, foamLines1)

  // Secondary foam lines - finer detail
  const foamLines2 = mx_fractal_noise_vec3(vec3(mul(uvCoord.x, 20), mul(verticalFlow, 1.2), 1)).x
  const foamMask2 = step(0.6, foamLines2)

  // Tertiary foam lines - even finer
  const foamLines3 = mx_noise_vec3(vec3(mul(uvCoord.x, 16), mul(verticalFlow, 0.8), 2)).x
  const foamMask3 = step(0.55, foamLines3)

  // Fourth layer - ensure proper flow
  const foamLines4 = mx_fractal_noise_vec3(vec3(mul(uvCoord.x, 28), mul(verticalFlow, 1.4), 3)).x
  const foamMask4 = step(0.72, foamLines4)

  // Fifth layer - ensure proper flow
  const foamLines5 = mx_noise_vec3(vec3(mul(uvCoord.x, 22), mul(verticalFlow, 0.9), 4)).x
  const foamMask5 = step(0.68, foamLines5)

  // Combine all foam layers
  const combinedFoam = max(max(max(max(foamMask1, foamMask2), foamMask3), foamMask4), foamMask5)

  // Add horizontal variation - also make it flow properly
  const horizontalNoise = mul(mx_noise_vec3(vec3(mul(uvCoord.x, 10), mul(verticalFlow, 0.5), 5)).x, 0.15)
  const finalFoamMask = step(0.1, add(combinedFoam, horizontalNoise))

  const foamColor = vec4(color(options.fallFoamColor).rgb, options.fallAlpha)
  const colorNode = mix(baseWater, foamColor, finalFoamMask)

  return { colorNode }
}

const createRoundedEdge = (options: Required<WaterfallOptions>) => {
  const uvCoord = uv()
  const timeOffset = mul(time, 1.0)

  // Transition from river to fall
  const transitionFactor = smoothstep(0.3, 0.7, uvCoord.y)

  // River-like flow at top - no deep blue, just surface variation
  const riverNoise = mx_fractal_noise_vec3(vec3(uvCoord.x, sub(uvCoord.y, mul(timeOffset, 0.1)), 0)).x
  const riverBase = vec4(color(options.roundedWaterColor).rgb, options.roundedAlpha)
  const surfaceColor = vec4(color(options.roundedSurfaceColor).rgb, options.roundedAlpha)
  const riverColor = mix(riverBase, surfaceColor, mul(step(0.5, riverNoise), 0.5))

  // Fall-like vertical lines at bottom - no deep blue
  const verticalFlow = add(uvCoord.y, timeOffset)
  const fallBase = vec4(color(options.roundedWaterColor).rgb, options.roundedAlpha)
  const fallLines = mx_fractal_noise_vec3(vec3(mul(uvCoord.x, 12), verticalFlow, 0)).x
  const fallFoam = step(0.4, fallLines)
  const foamColor = vec4(color(options.roundedFoamColor).rgb, options.roundedAlpha)
  const fallColor = mix(fallBase, foamColor, fallFoam)

  const colorNode = mix(riverColor, fallColor, transitionFactor)

  return { colorNode }
}

const createImpactFoam = (options: Required<WaterfallOptions>) => {
  const uvCoord = uv()
  const position = positionLocal

  // Subtle vertex displacement
  const turbulenceStrength = 0.08
  const noiseScale = 6.0
  const animSpeed = 1.0

  const noise1 = mx_fractal_noise_vec3(
    vec3(mul(position.x, noiseScale), mul(position.y, noiseScale), mul(time, animSpeed))
  ).x
  const noise2 = mx_fractal_noise_vec3(
    vec3(mul(position.z, noiseScale * 1.5), mul(position.y, noiseScale * 1.5), mul(time, animSpeed * 1.3))
  ).x
  const noise3 = mx_fractal_noise_vec3(
    vec3(mul(position.x, noiseScale * 0.8), mul(position.z, noiseScale * 0.8), mul(time, animSpeed * 0.7))
  ).x

  const displacementX = mul(noise1, turbulenceStrength)
  const displacementY = mul(noise2, turbulenceStrength * 0.7)
  const displacementZ = mul(noise3, turbulenceStrength)
  const displacedPosition = add(position, vec3(displacementX, displacementY, displacementZ))

  // Increased foam color texture - more white
  const foamNoise1 = mx_fractal_noise_vec3(vec3(mul(uvCoord.x, 6), mul(uvCoord.y, 6), mul(time, 1.5))).x
  const foamNoise2 = mx_fractal_noise_vec3(vec3(mul(uvCoord.x, 12), mul(uvCoord.y, 12), mul(time, 2.0))).x

  // Create more white foam by lowering thresholds
  const foamBase = step(0.2, foamNoise1) // Lower threshold = more foam
  const foamDetail = step(0.4, foamNoise2) // Lower threshold = more foam
  const foamMask = max(foamBase, foamDetail)

  const foamColor = vec4(color(options.impactFoamColor).rgb, options.impactFoamAlpha)
  const waterColor = vec4(color(options.impactWaterColor).rgb, options.impactFoamAlpha)

  const colorNode = mix(waterColor, foamColor, foamMask)
  const positionNode = displacedPosition

  return { colorNode, positionNode }
}

const createImpactWaves = (options: Required<WaterfallOptions>) => {
  const uvCoord = uv()
  const currentTime = time

  // Properly center the circles at UV (0.5, 0.5)
  const center = vec3(0.5, 0.5, 0)
  const distanceFromCenter = length(sub(uvCoord.xy, center.xy))

  // Create proper expanding circles
  const waveSpeed = 0.6
  const waveFrequency = 8.0

  // Main expanding waves - corrected phase calculation
  const wavePhase1 = sub(mul(distanceFromCenter, waveFrequency), mul(currentTime, waveSpeed))
  const wave1 = step(fract(wavePhase1), 0.3)

  // Secondary waves with different speed
  const wavePhase2 = sub(mul(distanceFromCenter, waveFrequency * 1.3), mul(currentTime, waveSpeed * 1.4))
  const wave2 = step(fract(wavePhase2), 0.25)

  // Third wave layer for complexity
  const wavePhase3 = sub(mul(distanceFromCenter, waveFrequency * 0.7), mul(currentTime, waveSpeed * 0.8))
  const wave3 = step(fract(wavePhase3), 0.2)

  // Combine waves
  const combinedWaves = max(max(wave1, mul(wave2, 0.7)), mul(wave3, 0.5))

  // Fade out completely at edges - circles disappear entirely
  const fadeMask = smoothstep(0.5, 0.0, distanceFromCenter) // Fade starts closer to center and goes to 0
  const finalWaves = mul(combinedWaves, fadeMask)

  // Fully transparent background, white circles with alpha based on wave intensity
  const foamColor = vec4(color(options.waveFoamColor).rgb, 1.0) // White circles at full opacity
  const transparentBackground = vec4(0.0, 0.0, 0.0, 0.0) // Fully transparent background

  // Mix based on wave intensity - background is transparent, circles are white
  const colorNode = mix(transparentBackground, foamColor, finalWaves)

  return { colorNode }
}

export const waterfall = (userOptions: WaterfallOptions = {}) => {
  const options = { ...defaultOptions, ...userOptions }

  return {
    river: createRiver(options),
    fall: createFall(options),
    roundedEdge: createRoundedEdge(options),
    impactFoam: createImpactFoam(options),
    impactWaves: createImpactWaves(options),
  }
}
