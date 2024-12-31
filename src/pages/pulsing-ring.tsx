import Page from '@/components/Page'
import { pulsingRing } from '@/shaders'
import { useControls } from 'leva'
import { useMemo } from 'react'

const PulsingRingMaterial = () => {
  const pulsingRingShader = useMemo(() => pulsingRing(), [])

  const {
    speed,
    startColor,
    endColor,
    pulsesPerGroup,
    delayBetweenGroups,
    startThickness,
    endThickness,
    maxRadius,
    transitionStart,
    transitionDuration,
    innerSmoothness,
    outerSmoothness,
  } = useControls({
    speed: { value: 1.5, min: 0, max: 4, step: 0.1 },
    startColor: { r: 255, g: 0, b: 0, a: 1 },
    endColor: { r: 0, g: 0, b: 255, a: 0 },
    pulsesPerGroup: { value: 2, min: 1, max: 10, step: 1 },
    delayBetweenGroups: { value: 1, min: 0, max: 10, step: 0.1 },
    startThickness: { value: 0.1, min: 0, max: 0.2, step: 0.001 },
    endThickness: { value: 0.02, min: 0, max: 0.2, step: 0.001 },
    maxRadius: { value: 0.45, min: 0, max: 1, step: 0.01 },
    transitionStart: { value: 0.6, min: 0, max: 1, step: 0.01 },
    innerSmoothness: { value: 0.05, min: 0, max: 0.2, step: 0.001 },
    outerSmoothness: { value: 0.05, min: 0, max: 0.2, step: 0.001 },
    transitionDuration: { value: 0.3, min: 0, max: 1, step: 0.01 },
  })

  pulsingRingShader.uniforms.speed.value = speed
  pulsingRingShader.uniforms.startColor.value.x = startColor.r / 255
  pulsingRingShader.uniforms.startColor.value.y = startColor.g / 255
  pulsingRingShader.uniforms.startColor.value.z = startColor.b / 255
  pulsingRingShader.uniforms.startColor.value.w = startColor.a
  pulsingRingShader.uniforms.endColor.value.x = endColor.r / 255
  pulsingRingShader.uniforms.endColor.value.y = endColor.g / 255
  pulsingRingShader.uniforms.endColor.value.z = endColor.b / 255
  pulsingRingShader.uniforms.endColor.value.w = endColor.a
  pulsingRingShader.uniforms.pulsesPerGroup.value = pulsesPerGroup
  pulsingRingShader.uniforms.delayBetweenGroups.value = delayBetweenGroups
  pulsingRingShader.uniforms.startThickness.value = startThickness
  pulsingRingShader.uniforms.endThickness.value = endThickness
  pulsingRingShader.uniforms.maxRadius.value = maxRadius
  pulsingRingShader.uniforms.transitionStart.value = transitionStart
  pulsingRingShader.uniforms.transitionDuration.value = transitionDuration
  pulsingRingShader.uniforms.innerSmoothness.value = innerSmoothness
  pulsingRingShader.uniforms.outerSmoothness.value = outerSmoothness

  return <meshBasicNodeMaterial {...pulsingRingShader.nodes} transparent />
}

const PulsingRingPage = () => (
  <Page title="Pulsing Ring" levaProps={{ theme: { sizes: { rootWidth: '320px' } } }}>
    <PulsingRingMaterial />
  </Page>
)

export default PulsingRingPage
