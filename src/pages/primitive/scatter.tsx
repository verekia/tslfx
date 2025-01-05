import Page from '@/components/Page'
import { defaultScatterUniforms, scatter } from '@/shaders'
import type { ScatterUniforms } from '@/shaders/scatter'
import { useFrame } from '@react-three/fiber'
import { button, folder, useControls } from 'leva'
import type { ButtonInput } from 'leva/dist/declarations/src/types'
import { useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

type Preset = { name: string; uniforms: ScatterUniforms }

const scatterPresets: Preset[] = [
  {
    name: 'Smash',
    uniforms: {
      ...defaultScatterUniforms,
      vesicaColor: new Vector4(1, 0.6, 0, 1),
      vesicaCount: 6,
      duration: 0.5,
    },
  },
  {
    name: 'Void Blast',
    uniforms: {
      ...defaultScatterUniforms,
      vesicaColor: new Vector4(0.1, 0, 1, 1),
      vesicaCount: 6,
      duration: 0.7,
    },
  },
  {
    name: 'Cherry Blossom',
    uniforms: {
      ...defaultScatterUniforms,
      vesicaColor: new Vector4(1, 0.4, 1, 1),
      vesicaCount: 10,
      duration: 0.7,
    },
  },
  {
    name: 'Default',
    uniforms: {
      ...defaultScatterUniforms,
      vesicaColor: defaultScatterUniforms.vesicaColor.clone(),
    },
  },
]

const defaultUniforms = scatterPresets[0].uniforms

const ScatterMaterial = () => {
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const [{ vesicaColor, duration, time, autoplay, vesicaCount, radiusStart, radiusEnd }, setControls] = useControls(
    () => {
      const presets: Record<string, ButtonInput> = Object.fromEntries(
        scatterPresets.map((preset) => [
          preset.name,
          button(() => {
            const { seed, aspect, ...rest } = preset.uniforms
            setControls({
              ...rest,
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
          vesicaColor: {
            value: {
              r: defaultUniforms.vesicaColor.x * 255,
              g: defaultUniforms.vesicaColor.y * 255,
              b: defaultUniforms.vesicaColor.z * 255,
              a: defaultUniforms.vesicaColor.w,
            },
          },
          vesicaCount: {
            value: defaultUniforms.vesicaCount,
            min: 0,
            max: 15,
            step: 1,
          },
          radiusStart: { value: defaultUniforms.radiusStart, min: 0, max: 1, step: 0.01 },
          radiusEnd: { value: defaultUniforms.radiusEnd, min: 0, max: 1, step: 0.01 },
        }),
        Presets: folder(presets),
      }
    }
  )

  const { uniforms, nodes } = useMemo(() => scatter(), [])

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
  uniforms.vesicaColor.value.x = vesicaColor.r / 255
  uniforms.vesicaColor.value.y = vesicaColor.g / 255
  uniforms.vesicaColor.value.z = vesicaColor.b / 255
  uniforms.vesicaColor.value.w = vesicaColor.a
  uniforms.vesicaCount.value = vesicaCount
  uniforms.radiusStart.value = radiusStart
  uniforms.radiusEnd.value = radiusEnd

  return <meshBasicNodeMaterial ref={materialRef} {...nodes} transparent />
}

const ScatterPage = () => (
  <Page title="Scatter" levaProps={{ theme: { sizes: { rootWidth: '310px' } } }} is2D>
    <ScatterMaterial />
  </Page>
)

export default ScatterPage
