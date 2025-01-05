import Page from '@/components/Page'
import { blendAlpha, defaultScatterUniforms, pipe, scatter } from '@/shaders'
import type { ScatterUniforms } from '@/shaders/scatter'
import { shape } from '@/shaders/shape'
import { useFrame } from '@react-three/fiber'
import { button, folder, useControls } from 'leva'
import type { ButtonInput } from 'leva/dist/declarations/src/types'
import { useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

type Preset = { name: string; uniforms: ScatterUniforms }

const newImpactPresets: Preset[] = [
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

const defaultUniforms = newImpactPresets[0].uniforms

const NewImpactMaterial = () => {
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const [controls, setControls] = useControls(() => {
    const presets: Record<string, ButtonInput> = Object.fromEntries(
      newImpactPresets.map((preset) => [
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
  })

  const shapeShader = useMemo(() => shape(), [])
  const scatterShader = useMemo(() => scatter(), [])

  const combinedColorNode = useMemo(
    () => pipe(blendAlpha, shapeShader.nodes.colorNode, scatterShader.nodes.colorNode),
    [shapeShader, scatterShader]
  )

  useFrame((_, delta) => {
    if (!controls.autoplay) return

    shapeShader.uniforms.time.value += delta / controls.duration
    scatterShader.uniforms.time.value += delta / controls.duration

    if (shapeShader.uniforms.time.value > 1) {
      shapeShader.uniforms.time.value = 0
    }

    if (scatterShader.uniforms.time.value > 1) {
      scatterShader.uniforms.seed.value = Math.round(Math.random() * 1000)
      scatterShader.uniforms.time.value = 0
    }

    setControls({ time: shapeShader.uniforms.time.value })
  })

  scatterShader.uniforms.vesicaColor.value.x = controls.vesicaColor.r / 255
  scatterShader.uniforms.vesicaColor.value.y = controls.vesicaColor.g / 255
  scatterShader.uniforms.vesicaColor.value.z = controls.vesicaColor.b / 255
  scatterShader.uniforms.vesicaColor.value.w = controls.vesicaColor.a
  scatterShader.uniforms.vesicaCount.value = controls.vesicaCount
  scatterShader.uniforms.radiusStart.value = controls.radiusStart
  scatterShader.uniforms.radiusEnd.value = controls.radiusEnd

  return <meshBasicNodeMaterial ref={materialRef} colorNode={combinedColorNode} transparent />
}

const NewImpactPage = () => (
  <Page title="New Impact" levaProps={{ theme: { sizes: { rootWidth: '310px' } } }} is2D>
    <NewImpactMaterial />
  </Page>
)

export default NewImpactPage
