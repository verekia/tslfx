import Page from '@/components/Page'
import { impact, pipe, pulsingRing } from '@/shaders'
import { water } from '@/shaders/water'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { blendColor } from 'three/tsl'
import { MeshBasicNodeMaterial, Vector4 } from 'three/webgpu'

const BlendingMaterial = () => {
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const { uniforms: impactUniforms, nodes: impactNodes } = useMemo(
    () =>
      impact({
        circleColor: new Vector4(1, 0, 0, 1),
        vesicaColor: new Vector4(0, 1, 0, 1),
        circleSizeStart: 0.7,
        circleSizeEnd: 0.5,
      }),
    []
  )

  const { nodes: pulsingRingNodes } = useMemo(
    () =>
      pulsingRing({
        startColor: new Vector4(0, 0, 0, 1),
        endColor: new Vector4(0, 0, 0, 1),
        startThickness: 0.3,
        innerSmoothness: 0.1,
        maxRadius: 0.4,
        endThickness: 0.1,
      }),
    []
  )

  const { uniforms: waterUniforms, nodes: waterNodes } = useMemo(
    () =>
      water({
        scale: 10,
        time: 0,
        color1: new Vector4(0.1, 0.2, 0.7, 1),
        color2: new Vector4(0.1, 0.5, 1, 1),
      }),
    []
  )

  useFrame((_, delta) => {
    waterUniforms.time.value += delta * 10
    impactUniforms.time.value += delta / impactUniforms.duration.value
    if (impactUniforms.time.value > 1) {
      impactUniforms.seed.value = Math.round(Math.random() * 1000)
      impactUniforms.time.value = 0
    }
  })

  const colorNode = pipe(
    blendColor,
    waterNodes.colorNode,
    pulsingRingNodes.colorNode,
    impactNodes.colorNode
  )

  return (
    <meshBasicNodeMaterial
      ref={materialRef}
      colorNode={colorNode}
      transparent
    />
  )
}

const BlendingPage = () => (
  <Page title="Blending">
    <BlendingMaterial />
  </Page>
)

export default BlendingPage
