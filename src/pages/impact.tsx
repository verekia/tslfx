import Page from '@/components/Page'
import { impact } from '@/shaders'
import { ImpactParams } from '@/shaders/impact'
import { useFrame } from '@react-three/fiber'
import { button, folder, useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const impactPresets = [
  {
    name: 'Default',
    params: {
      circleColor: new Vector4(1, 0.1, 0, 1),
      vesicaColor: new Vector4(1, 0.6, 0, 1),
      vesicaCount: 6,
      circleSizeStart: 0,
      circleSizeEnd: 0.6,
      circleThickness: 0.13,
    },
  },
  {
    name: 'Void Blast',
    params: {
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
    params: {
      circleColor: new Vector4(1, 0.8, 1, 1),
      vesicaColor: new Vector4(1, 0.4, 1, 1),
      vesicaCount: 10,
      circleSizeStart: 0.2,
      circleSizeEnd: 0.6,
      circleThickness: 0.1,
      duration: 0.7,
    },
  },
] satisfies { name: string; params: ImpactParams }[]

const defaultParams = impactPresets[0].params

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
    const presets: ImpactParams = Object.fromEntries(
      impactPresets.map((preset) => [
        preset.name,
        button(() =>
          setControls({
            ...preset.params,
            circleColor: {
              r: preset.params.circleColor.x * 255,
              g: preset.params.circleColor.y * 255,
              b: preset.params.circleColor.z * 255,
              a: preset.params.circleColor.w,
            },
            vesicaColor: {
              r: preset.params.vesicaColor.x * 255,
              g: preset.params.vesicaColor.y * 255,
              b: preset.params.vesicaColor.z * 255,
              a: preset.params.vesicaColor.w,
            },
            autoplay: true,
          })
        ),
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
            r: defaultParams.circleColor.x * 255,
            g: defaultParams.circleColor.y * 255,
            b: defaultParams.circleColor.z * 255,
            a: defaultParams.circleColor.w,
          },
        },
        vesicaColor: {
          value: {
            r: defaultParams.vesicaColor.x * 255,
            g: defaultParams.vesicaColor.y * 255,
            b: defaultParams.vesicaColor.z * 255,
            a: defaultParams.vesicaColor.w,
          },
        },
        circleSizeStart: { value: 0, min: 0, max: 1, step: 0.01 },
        circleSizeEnd: { value: 0.6, min: 0, max: 1, step: 0.01 },
        circleThickness: { value: 0.13, min: 0, max: 1, step: 0.01 },
      }),
      'Static parameters': folder({
        vesicaCount: {
          value: defaultParams.vesicaCount,
          min: 1,
          max: 15,
          step: 1,
        },
      }),
      // @ts-expect-error
      Presets: folder(presets),
    }
  })

  const circleColorVec = new Vector4(
    circleColor.r / 255,
    circleColor.g / 255,
    circleColor.b / 255,
    circleColor.a
  )
  const vesicaColorVec = new Vector4(
    vesicaColor.r / 255,
    vesicaColor.g / 255,
    vesicaColor.b / 255,
    vesicaColor.a
  )

  const { uniforms, nodes } = useMemo(
    () =>
      impact({
        time: 0,
        duration,
        circleColor: circleColorVec,
        vesicaColor: vesicaColorVec,
        vesicaCount,
        circleSizeStart,
        circleSizeEnd,
        circleThickness,
      }),
    [vesicaCount]
  )

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true
    }
  }, [vesicaCount])

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

  return <meshBasicNodeMaterial ref={materialRef} {...nodes} transparent />
}

const ImpactPage = () => (
  <Page title="Impact" levaProps={{ theme: { sizes: { rootWidth: '310px' } } }}>
    <ImpactMaterial />
  </Page>
)

export default ImpactPage
