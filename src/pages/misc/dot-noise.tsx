import Page from '@/components/Page'
import { dotNoise } from '@/shaders/dot-noise'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { vec3, sin, floor, uniform } from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const DotNoiseMaterial = () => {
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const { scale, speed, steps, color } = useControls({
    scale: { value: 20, min: 5, max: 30, step: 0.1 },
    speed: { value: 0.07, min: 0, max: 0.15, step: 0.01 },
    steps: { value: 8, min: 3, max: 20, step: 1 },
    color: { value: 1.0, min: 0.5, max: 2.0, step: 0.1 },
  })

  const dotNoiseShader = useMemo(() => dotNoise({ scale: 20, speed: 0.5 }), [])

  const colorizedMaterial = useMemo(() => {
    // Get the grayscale noise value
    const noiseValue = dotNoiseShader.nodes.colorNode.x

    // Quantize/step the noise to create distinct levels
    const steppedNoise = floor(noiseValue.mul(uniform(steps))).div(uniform(steps - 1))

    // Create colorful visualization using trigonometric functions with steps
    const hue = steppedNoise.mul(6.28318).mul(uniform(color))

    // Generate RGB components using phase-shifted sine waves
    const r = sin(hue).mul(0.5).add(0.5)
    const g = sin(hue.add(2.094)).mul(0.5).add(0.5) // +120 degrees
    const b = sin(hue.add(4.188)).mul(0.5).add(0.5) // +240 degrees

    const colorNode = vec3(r, g, b)

    return { colorNode }
  }, [dotNoiseShader.nodes.colorNode, steps, color])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true
    }
  }, [steps, color])

  dotNoiseShader.uniforms.scale.value = scale
  dotNoiseShader.uniforms.speed.value = speed

  return <meshBasicNodeMaterial ref={materialRef} {...colorizedMaterial} />
}

const DotNoisePage = () => (
  <Page title="Dot Noise" is2D>
    <DotNoiseMaterial />
  </Page>
)

export default DotNoisePage
