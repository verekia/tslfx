import Page from '@/components/Page'
import { shape, ShapePreset, shapeDefaults, ShapeParams } from '@/shaders/shape'
import { useFrame } from '@react-three/fiber'
import { button, folder, useControls } from 'leva'
import { useMemo } from 'react'
import { Vector4 } from 'three'

const explosion = {
  ...shapeDefaults,
  easing: 2,
  duration: 1.2,
  startColor: new Vector4(1, 0, 0, 1),
  startSize: 0.5,
  startThickness: 1,
  startInnerFade: 1,
  endColor: new Vector4(1, 0.8, 0, 1),
  endThickness: 0,
} as const satisfies ShapeParams

const voidBlast = {
  ...shapeDefaults,
  duration: 1.2,
  easing: 2,
  boomerang: 1,
  startColor: new Vector4(0.1, 0, 0.4, 1),
  startSize: 0.1,
  startOuterFade: 0.7,
  endColor: new Vector4(0.01, 0, 0.04, 1),
  endInnerFade: 0.5,
  endThickness: 0,
} as const satisfies ShapeParams

export const shapePresets = [
  { name: 'Explosion', params: explosion },
  { name: 'Void Blast', params: voidBlast },
  // { name: 'Default', params: shapeDefaults },
] as const satisfies ShapePreset[]

const defaultParams = shapePresets[0].params

const ShapeMaterial = () => {
  const [controls, setControls] = useControls(() => {
    // @ts-expect-error
    const presets: Record<(typeof shapePresets)[number]['name'], ReturnType<typeof button>> = Object.fromEntries(
      shapePresets.map((preset) => [
        preset.name,
        button(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { visible, ...newParams } = preset.params
          setControls({
            ...newParams,
            boomerang: Boolean(newParams.boomerang),
            proportional: Boolean(newParams.proportional),
            startColor: {
              r: newParams.startColor.x * 255,
              g: newParams.startColor.y * 255,
              b: newParams.startColor.z * 255,
              a: newParams.startColor.w,
            },
            endColor: {
              r: newParams.endColor.x * 255,
              g: newParams.endColor.y * 255,
              b: newParams.endColor.z * 255,
              a: newParams.endColor.w,
            },
            autoplay: true,
          })
        }),
      ])
    )

    return {
      Animation: folder({
        time: { value: 0, min: 0, max: 1, step: 0.01 },
        duration: { value: defaultParams.duration, min: 0, max: 3, step: 0.1 },
        autoplay: { value: true },
      }),
      Presets: folder(presets),
      Uniforms: folder({
        easing: { options: { Linear: 0, EaseIn: 1, EaseOut: 2, EaseInOut: 3 }, value: defaultParams.easing },
        boomerang: { value: Boolean(defaultParams.boomerang) },
        proportional: { value: Boolean(defaultParams.proportional) },
        startColor: { value: { r: 255, g: 0, b: 0, a: 1 } },
        startSize: { value: defaultParams.startSize, min: 0, max: 1, step: 0.01 },
        startThickness: { value: defaultParams.startThickness, min: 0, max: 1, step: 0.01 },
        startInnerFade: { value: defaultParams.startInnerFade, min: 0, max: 1, step: 0.01 },
        startOuterFade: { value: defaultParams.startOuterFade, min: 0, max: 1, step: 0.01 },
        startOffset: {
          value: { x: defaultParams.startOffset.x, y: defaultParams.startOffset.y },
          min: -1,
          max: 1,
          joystick: 'invertY',
        },
        endColor: { value: { r: 255, g: 200, b: 0, a: 1 } },
        endSize: { value: defaultParams.endSize, min: 0, max: 1, step: 0.01 },
        endThickness: { value: defaultParams.endThickness, min: 0, max: 1, step: 0.01 },
        endInnerFade: { value: defaultParams.endInnerFade, min: 0, max: 1, step: 0.01 },
        endOuterFade: { value: defaultParams.endOuterFade, min: 0, max: 1, step: 0.01 },
        endOffset: {
          value: { x: defaultParams.endOffset.x, y: defaultParams.endOffset.y },
          min: -1,
          max: 1,
          joystick: 'invertY',
        },
        // shape: {
        //   options: { Circle: 0, Heart: 1, Vesica: 2 },
        //   value: 0,
        // },
        // rotation: {
        //   value: defaultRotation,
        //   min: -2 * Math.PI,
        //   max: 2 * Math.PI,
        //   step: 0.01,
        // },
        // rotating: { value: defaultRotating },
      }),
    }
  })

  const { uniforms, nodes } = useMemo(() => shape(), [])

  useFrame((_, delta) => {
    if (!controls.autoplay) return

    uniforms.time.value += delta / controls.duration

    if (uniforms.time.value > 1) {
      uniforms.time.value = 0
    }

    setControls({ time: uniforms.time.value })
  })

  uniforms.time.value = controls.time

  uniforms.easing.value = controls.easing as 0 | 1 | 2 | 3
  uniforms.boomerang.value = Number(controls.boomerang) as 0 | 1
  uniforms.proportional.value = Number(controls.proportional) as 0 | 1

  uniforms.startColor.value.x = controls.startColor.r / 255
  uniforms.startColor.value.y = controls.startColor.g / 255
  uniforms.startColor.value.z = controls.startColor.b / 255
  uniforms.startColor.value.w = controls.startColor.a
  uniforms.startSize.value = controls.startSize
  uniforms.startThickness.value = controls.startThickness
  uniforms.startInnerFade.value = controls.startInnerFade
  uniforms.startOuterFade.value = controls.startOuterFade
  uniforms.startOffset.value.x = controls.startOffset.x
  uniforms.startOffset.value.y = controls.startOffset.y

  uniforms.endColor.value.x = controls.endColor.r / 255
  uniforms.endColor.value.y = controls.endColor.g / 255
  uniforms.endColor.value.z = controls.endColor.b / 255
  uniforms.endColor.value.w = controls.endColor.a
  uniforms.endSize.value = controls.endSize
  uniforms.endThickness.value = controls.endThickness
  uniforms.endInnerFade.value = controls.endInnerFade
  uniforms.endOuterFade.value = controls.endOuterFade
  uniforms.endOffset.value.x = controls.endOffset.x
  uniforms.endOffset.value.y = controls.endOffset.y

  // uniforms.shape.value = sh as 0 | 1 | 2
  // uniforms.rotation.value = rotation
  // uniforms.rotating.value = rotating ? 1 : 0

  return <meshBasicNodeMaterial {...nodes} transparent />
}

const ShapePage = () => (
  <Page title="Shape" levaProps={{ theme: { sizes: { rootWidth: '310px' } } }}>
    <ShapeMaterial />
  </Page>
)

export default ShapePage
