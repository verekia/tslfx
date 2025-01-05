import Page from '@/components/Page'
import { impact } from '@/shaders'
import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { AdditiveBlending, Vector4 } from 'three'
import { cos, range, sin, vec3, instanceIndex, time } from 'three/tsl'

const instanceCount = 300

const ParticlesMaterial = () => {
  const { uTime, nodes } = useMemo(() => {
    const impactShader = impact(
      {
        circleSizeEnd: 0,
        circleSizeStart: 0.2,
        circleColor: new Vector4(1, 0.7, 0, 1),
        vesicaColor: new Vector4(0, 0.7, 1, 1),
        vesicaCount: 2,
      },
      { instanceIndex, instanceCount }
    )

    const basePosition = vec3(
      cos(instanceIndex.toFloat()).mul(2),
      range(-0.3, 0.3),
      sin(instanceIndex.toFloat()).mul(2)
    )
    const rotationSpeed = basePosition.y.mul(1.1)
    const rotationAngle = time.mul(rotationSpeed)

    const rotatedPosition = vec3(
      basePosition.x.mul(cos(rotationAngle)).sub(basePosition.z.mul(sin(rotationAngle))),
      basePosition.y,
      basePosition.x.mul(sin(rotationAngle)).add(basePosition.z.mul(cos(rotationAngle)))
    )

    const positionNode = rotatedPosition.add(vec3(range(-0.1, 0.1), range(-0.1, 0.1), range(-0.1, 0.1)))

    return { uTime: impactShader.uniforms.time, nodes: { positionNode, colorNode: impactShader.nodes.colorNode } }
  }, [])

  useFrame((_, delta) => {
    uTime.value += delta * 0.2
  })

  return (
    <instancedMesh args={[, , instanceCount]}>
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
