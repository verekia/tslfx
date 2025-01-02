import Page from '@/components/Page'
import { impact } from '@/shaders'
import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { AdditiveBlending, Vector4 } from 'three'
import { cos, range, sin, vec3, instanceIndex } from 'three/tsl'

const ParticlesMaterial = () => {
  const { uTime, nodes } = useMemo(() => {
    const impactShader = impact({
      circleSizeEnd: 0,
      circleSizeStart: 0.3,
      circleColor: new Vector4(1, 0.7, 0, 1),
      vesicaColor: new Vector4(0, 0.7, 1, 1),
    })
    const position = vec3(cos(instanceIndex.toFloat()), 0, sin(instanceIndex.toFloat()))
    const positionNode = position.add(vec3(range(-1, 1), 0, range(-1, 1)))

    return { uTime: impactShader.uniforms.time, nodes: { positionNode, colorNode: impactShader.nodes.colorNode } }
  }, [])

  useFrame((_, delta) => {
    uTime.value += delta * 0.5
    if (uTime.value > 1) {
      uTime.value = 0
    }
  })

  return (
    <instancedMesh args={[, , 300]}>
      <planeGeometry />
      <spriteNodeMaterial {...nodes} transparent blending={AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}

const ParticlesPage = () => (
  <Page title="Particles">
    <ParticlesMaterial />
  </Page>
)

export default ParticlesPage
