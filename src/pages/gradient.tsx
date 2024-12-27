import Page from '@/components/Page'
import { gradient } from '@/shaders'
import { useControls } from 'leva'
import { useMemo } from 'react'

const GradientMaterial = () => {
  const gradientShader = useMemo(() => gradient(), [])

  const { color1, color2, rotation } = useControls({
    color1: { r: 255, g: 0, b: 0, a: 1 },
    color2: { r: 0, g: 255, b: 0, a: 1 },
    rotation: { value: 0, min: 0, max: Math.PI * 2 },
  })

  gradientShader.uniforms.color1.value.x = color1.r / 255
  gradientShader.uniforms.color1.value.y = color1.g / 255
  gradientShader.uniforms.color1.value.z = color1.b / 255
  gradientShader.uniforms.color1.value.w = color1.a
  gradientShader.uniforms.color2.value.x = color2.r / 255
  gradientShader.uniforms.color2.value.y = color2.g / 255
  gradientShader.uniforms.color2.value.z = color2.b / 255
  gradientShader.uniforms.color2.value.w = color2.a
  gradientShader.uniforms.rotation.value = rotation

  return <meshBasicNodeMaterial {...gradientShader.nodes} transparent />
}

const GradientPage = () => (
  <Page title="Gradient">
    <GradientMaterial />
  </Page>
)

export default GradientPage
