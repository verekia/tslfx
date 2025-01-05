import Page from '@/components/Page'
import { defaultImpactUniforms, impact } from '@/shaders'
import type { ImpactUniforms } from '@/shaders/impact'
import { useFrame } from '@react-three/fiber'
import { button, folder, useControls } from 'leva'
import type { ButtonInput } from 'leva/dist/declarations/src/types'
import { useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

type Preset = { name: string; uniforms: ImpactUniforms }

const impactPresets: Preset[] = [
  {
    name: 'Smash',
    uniforms: {
      ...defaultImpactUniforms,
      circleColor: new Vector4(1, 0.1, 0, 1),
      vesicaColor: new Vector4(1, 0.6, 0, 1),
      vesicaCount: 6,
      duration: 0.5,
      circleSizeStart: 0,
      circleSizeEnd: 0.6,
      circleThickness: 0.13,
    },
  },
  {
    name: 'Void Blast',
    uniforms: {
      ...defaultImpactUniforms,
      circleColor: new Vector4(0, 0, 0, 0.9),
      vesicaColor: new Vector4(0.1, 0, 1, 1),
      vesicaCount: 6,
      circleSizeStart: 1,
      circleSizeEnd: 0.2,
      circleThickness: 0.18,
      duration: 0.7,
    },
  },
  {
    name: 'Cherry Blossom',
    uniforms: {
      ...defaultImpactUniforms,
      circleColor: new Vector4(1, 0.8, 1, 1),
      vesicaColor: new Vector4(1, 0.4, 1, 1),
      vesicaCount: 10,
      circleSizeStart: 0.2,
      circleSizeEnd: 0.6,
      circleThickness: 0.1,
      duration: 0.7,
    },
  },
  {
    name: 'Default',
    uniforms: {
      ...defaultImpactUniforms,
      circleColor: defaultImpactUniforms.circleColor.clone(),
      vesicaColor: defaultImpactUniforms.vesicaColor.clone(),
    },
  },
]

const defaultUniforms = impactPresets[0].uniforms

const ImpactMaterial = () => {
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const [
    {
      circleColor,
      vesicaColor,
      duration,
      time,
      autoplay,
      vesicaCount,
      circleSizeStart,
      circleSizeEnd,
      circleThickness,
    },
    setControls,
  ] = useControls(() => {
    const presets: Record<string, ButtonInput> = Object.fromEntries(
      impactPresets.map((preset) => [
        preset.name,
        button(() => {
          const { seed, aspect, ...rest } = preset.uniforms
          setControls({
            ...rest,
            circleColor: {
              r: preset.uniforms.circleColor.x * 255,
              g: preset.uniforms.circleColor.y * 255,
              b: preset.uniforms.circleColor.z * 255,
              a: preset.uniforms.circleColor.w,
            },
            vesicaColor: {
              r: preset.uniforms.vesicaColor.x * 255,
              g: preset.uniforms.vesicaColor.y * 255,
              b: preset.uniforms.vesicaColor.z * 255,
              a: preset.uniforms.vesicaColor.w,
            },
            autoplay: true,
            time: 0,
          })
        }),
      ])
    )

    return {
      Animation: folder({
        time: { value: 0, min: 0, max: 1, step: 0.01 },
        duration: { value: 0.5, min: 0, max: 3, step: 0.1 },
        autoplay: { value: true },
      }),
      Uniforms: folder({
        circleColor: {
          value: {
            r: defaultUniforms.circleColor.x * 255,
            g: defaultUniforms.circleColor.y * 255,
            b: defaultUniforms.circleColor.z * 255,
            a: defaultUniforms.circleColor.w,
          },
        },
        vesicaColor: {
          value: {
            r: defaultUniforms.vesicaColor.x * 255,
            g: defaultUniforms.vesicaColor.y * 255,
            b: defaultUniforms.vesicaColor.z * 255,
            a: defaultUniforms.vesicaColor.w,
          },
        },
        circleSizeStart: { value: defaultUniforms.circleSizeStart, min: 0, max: 1, step: 0.01 },
        circleSizeEnd: { value: defaultUniforms.circleSizeEnd, min: 0, max: 1, step: 0.01 },
        circleThickness: { value: defaultUniforms.circleThickness, min: 0, max: 1, step: 0.01 },
        vesicaCount: {
          value: defaultUniforms.vesicaCount,
          min: 0,
          max: 15,
          step: 1,
        },
      }),
      Presets: folder(presets),
    }
  })

  const { uniforms, nodes } = useMemo(() => impact(), [])

  useFrame((_, delta) => {
    if (!autoplay) return

    uniforms.time.value += delta / duration

    if (uniforms.time.value > 1) {
      uniforms.seed.value = Math.round(Math.random() * 1000)
      uniforms.time.value = 0
    }

    setControls({ time: uniforms.time.value })
  })

  uniforms.time.value = time
  uniforms.circleColor.value.x = circleColor.r / 255
  uniforms.circleColor.value.y = circleColor.g / 255
  uniforms.circleColor.value.z = circleColor.b / 255
  uniforms.circleColor.value.w = circleColor.a
  uniforms.vesicaColor.value.x = vesicaColor.r / 255
  uniforms.vesicaColor.value.y = vesicaColor.g / 255
  uniforms.vesicaColor.value.z = vesicaColor.b / 255
  uniforms.vesicaColor.value.w = vesicaColor.a
  uniforms.circleSizeStart.value = circleSizeStart
  uniforms.circleSizeEnd.value = circleSizeEnd
  uniforms.circleThickness.value = circleThickness
  uniforms.vesicaCount.value = vesicaCount

  return <meshBasicNodeMaterial ref={materialRef} {...nodes} transparent />
}

const ImpactPage = () => (
  <Page title="Impact" levaProps={{ theme: { sizes: { rootWidth: '310px' } } }} is2D>
    <ImpactMaterial />
  </Page>
)

export default ImpactPage
