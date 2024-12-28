import Page from '@/components/Page'
import { shape } from '@/shaders/shape'
import { useFrame } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { useMemo } from 'react'
import { Vector4 } from 'three'

const defaultStartSize = 0.2
const defaultStartColor = new Vector4(0, 0, 1, 1)
const defaultStartThickness = 1
const defaultEndSize = 1
const defaultEndColor = new Vector4(1, 0, 0, 1)
const defaultEndThickness = 0
const defaultDuration = 1.5

const ShapeMaterial = () => {
  const { uniforms, nodes } = useMemo(() => shape(), [])

  const [
    {
      startColor,
      endColor,
      startSize,
      endSize,
      startThickness,
      endThickness,
      time,
      duration,
      autoplay,
      shape: sh,
    },
    setControls,
  ] = useControls(() => ({
    Animation: folder({
      time: { value: 0, min: 0, max: 1, step: 0.01 },
      duration: { value: defaultDuration, min: 0, max: 3, step: 0.1 },
      autoplay: { value: true },
    }),
    Uniforms: folder({
      startColor: {
        value: {
          r: defaultStartColor.x * 255,
          g: defaultStartColor.y * 255,
          b: defaultStartColor.z * 255,
          a: defaultStartColor.w,
        },
      },
      endColor: {
        value: {
          r: defaultEndColor.x * 255,
          g: defaultEndColor.y * 255,
          b: defaultEndColor.z * 255,
          a: defaultEndColor.w,
        },
      },
      startSize: { value: defaultStartSize, min: 0, max: 1, step: 0.01 },
      endSize: { value: defaultEndSize, min: 0, max: 1, step: 0.01 },
      shape: {
        options: { Circle: 0, Heart: 1, Vesica: 2 },
        value: 0,
      },
      startThickness: {
        value: defaultStartThickness,
        min: 0,
        max: 1,
        step: 0.01,
      },
      endThickness: { value: defaultEndThickness, min: 0, max: 1, step: 0.01 },
    }),
  }))

  useFrame((_, delta) => {
    if (!autoplay) return

    uniforms.time.value += delta / duration

    if (uniforms.time.value > 1) {
      uniforms.time.value = 0
    }

    setControls({ time: uniforms.time.value })
  })

  uniforms.startColor.value.x = startColor.r / 255
  uniforms.startColor.value.y = startColor.g / 255
  uniforms.startColor.value.z = startColor.b / 255
  uniforms.startColor.value.w = startColor.a

  uniforms.endColor.value.x = endColor.r / 255
  uniforms.endColor.value.y = endColor.g / 255
  uniforms.endColor.value.z = endColor.b / 255
  uniforms.endColor.value.w = endColor.a

  uniforms.startSize.value = startSize
  uniforms.startThickness.value = startThickness
  uniforms.endSize.value = endSize
  uniforms.endThickness.value = endThickness
  uniforms.shape.value = sh as 0 | 1 | 2
  uniforms.time.value = time

  return <meshBasicNodeMaterial {...nodes} transparent />
}

const ShapePage = () => (
  <Page title="Shape">
    <ShapeMaterial />
  </Page>
)

export default ShapePage
