import Page from '@/components/Page'
import { shape } from '@/shaders/shape'
import { useFrame } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import { useMemo, useRef } from 'react'
import { Vector2, Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const defaultStartColor = new Vector4(1, 0, 0, 1)
const defaultStartSize = 0.4
const defaultStartThickness = 0.4
const defaultStartInnerFade = 0.8
const defaultStartOuterFade = 0
const defaultEasing = 0
const defaultEndColor = new Vector4(1, 0.8, 0, 1)
const defaultEndSize = 1
const defaultEndThickness = 0
const defaultEndInnerFade = 0
const defaultEndOuterFade = 0
const defaultStartOffset = new Vector2(0, 0)
const defaultEndOffset = new Vector2(0, 0)

const defaultProportional = false
const defaultDuration = 1.8

// const defaultRotation = 0
// const defaultRotating = false

const ShapeMaterial = () => {
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const [
    {
      startColor,
      endColor,
      startSize,
      endSize,
      startThickness,
      endThickness,
      startInnerFade,
      endInnerFade,
      startOuterFade,
      endOuterFade,
      time,
      duration,
      autoplay,
      // shape: sh,
      // rotation,
      // rotating,
      proportional,
      easing,
      startOffsetX,
      startOffsetY,
      endOffsetX,
      endOffsetY,
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
      // shape: {
      //   options: { Circle: 0, Heart: 1, Vesica: 2 },
      //   value: 0,
      // },
      startSize: { value: defaultStartSize, min: 0, max: 1, step: 0.01 },
      startThickness: {
        value: defaultStartThickness,
        min: 0,
        max: 1,
        step: 0.01,
      },
      startInnerFade: {
        value: defaultStartInnerFade,
        min: 0,
        max: 1,
        step: 0.01,
      },
      startOuterFade: {
        value: defaultStartOuterFade,
        min: 0,
        max: 1,
        step: 0.01,
      },
      startOffsetX: {
        value: defaultStartOffset.x,
        min: -1,
        max: 1,
        step: 0.01,
      },
      startOffsetY: {
        value: defaultStartOffset.y,
        min: -1,
        max: 1,
        step: 0.01,
      },
      endColor: {
        value: {
          r: defaultEndColor.x * 255,
          g: defaultEndColor.y * 255,
          b: defaultEndColor.z * 255,
          a: defaultEndColor.w,
        },
      },
      endSize: { value: defaultEndSize, min: 0, max: 1, step: 0.01 },
      endThickness: { value: defaultEndThickness, min: 0, max: 1, step: 0.01 },
      endInnerFade: { value: defaultEndInnerFade, min: 0, max: 1, step: 0.01 },
      endOuterFade: { value: defaultEndOuterFade, min: 0, max: 1, step: 0.01 },
      endOffsetX: { value: defaultEndOffset.x, min: -1, max: 1, step: 0.01 },
      endOffsetY: { value: defaultEndOffset.y, min: -1, max: 1, step: 0.01 },
      // rotation: {
      //   value: defaultRotation,
      //   min: -2 * Math.PI,
      //   max: 2 * Math.PI,
      //   step: 0.01,
      // },
      // rotating: { value: defaultRotating },
      easing: {
        options: { Linear: 0, EaseIn: 1, EaseOut: 2, EaseInOut: 3 },
        value: defaultEasing,
      },
      proportional: { value: defaultProportional },
    }),
  }))

  const { uniforms, nodes } = useMemo(() => shape(), [])

  // useEffect(() => {
  //   if (materialRef.current) {
  //     materialRef.current.needsUpdate = true
  //   }
  // }, [continuousRotation])

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
  // uniforms.shape.value = sh as 0 | 1 | 2
  uniforms.time.value = time
  // uniforms.rotation.value = rotation
  // uniforms.rotating.value = rotating ? 1 : 0
  uniforms.proportional.value = proportional ? 1 : 0
  uniforms.startInnerFade.value = startInnerFade
  uniforms.endInnerFade.value = endInnerFade
  uniforms.startOuterFade.value = startOuterFade
  uniforms.endOuterFade.value = endOuterFade
  uniforms.easing.value = easing as 0 | 1 | 2 | 3
  uniforms.startOffset.value.x = startOffsetX
  uniforms.startOffset.value.y = startOffsetY
  uniforms.endOffset.value.x = endOffsetX
  uniforms.endOffset.value.y = endOffsetY

  return <meshBasicNodeMaterial ref={materialRef} {...nodes} transparent />
}

const ShapePage = () => (
  <Page title="Shape" levaProps={{ theme: { sizes: { rootWidth: '310px' } } }}>
    <ShapeMaterial />
  </Page>
)

export default ShapePage
