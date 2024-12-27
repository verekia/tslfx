import Page from '@/components/Page'
import { sdHeart, template } from '@/shaders'
import { useControls } from 'leva'
import { useMemo } from 'react'
import { vec2 } from 'three/tsl'

const defaultScale = 1
const defaultTime = 0
const defaultAspect = 1
const defaultRotation = 0
const defaultOffsetX = 0
const defaultOffsetY = 0
const defaultTileSize = 1
const defaultTiled = false

const TemplateMaterial = () => {
  const { scale, time, aspect, rotation, offsetX, offsetY, tileSize, tiled } =
    useControls({
      scale: { value: defaultScale, min: 0.1, max: 10, step: 0.1 },
      time: { value: defaultTime, min: 0, max: 1, step: 0.01 },
      aspect: { value: defaultAspect, min: 0.1, max: 2, step: 0.1 },
      rotation: {
        value: defaultRotation,
        min: 0,
        max: 2 * Math.PI,
        step: 0.01,
      },
      offsetX: { value: defaultOffsetX, min: -1, max: 1, step: 0.01 },
      offsetY: { value: defaultOffsetY, min: -1, max: 1, step: 0.01 },
      tileSize: { value: defaultTileSize, min: 0.1, max: 10, step: 0.1 },
      tiled: { value: defaultTiled },
    })

  const { uniforms, nodes } = useMemo(
    () =>
      template({
        createNodes: ({ position: p, time: t }) => ({
          colorNode: sdHeart(p.add(vec2(0, 0.59))).add(t),
        }),
      }),
    []
  )

  uniforms.scale.value = scale
  uniforms.time.value = time
  uniforms.aspect.value = aspect
  uniforms.rotation.value = rotation
  uniforms.offset.value.x = offsetX
  uniforms.offset.value.y = offsetY
  uniforms.tileSize.value = tileSize
  uniforms.tiled.value = tiled ? 1 : 0

  return <meshBasicNodeMaterial {...nodes} />
}

const TemplatePage = () => (
  <Page title="Template">
    <TemplateMaterial />
  </Page>
)

export default TemplatePage
