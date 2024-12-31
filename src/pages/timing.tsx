import Page from '@/components/Page'
import { blendAlpha, pipe } from '@/shaders'
import { shape } from '@/shaders/shape'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { Vector2, Vector4 } from 'three'
import { UniformNode } from 'three/webgpu'

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const timings = {
  drop1: { startAt: 0, duration: 0.12 },
  drop2: { startAt: 0.1, duration: 0.12 },
  drop3: { startAt: 0.21, duration: 0.12 },
  blow1: { startAt: 0.15, duration: 0.12 },
  explosion1: { startAt: 0.3, duration: 0.45 },
  blow2: { startAt: 0.26, duration: 0.12 },
  explosion2: { startAt: 0.4, duration: 0.45 },
  blow3: { startAt: 0.36, duration: 0.12 },
  explosion3: { startAt: 0.5, duration: 0.45 },
}

const updateShape = (
  shape: {
    uniforms: { time: UniformNode<number>; isVisible: UniformNode<number> }
  },
  timing: { startAt: number; duration: number },
  totalTime: number
) => {
  shape.uniforms.time.value = clamp(
    (totalTime - timing.startAt) / timing.duration,
    0,
    1
  )
  shape.uniforms.isVisible.value = Number(
    shape.uniforms.time.value !== 0 && shape.uniforms.time.value !== 1
  ) as 0 | 1
}

const TripleExplosionMaterial = () => {
  const totalTime = useRef(0)

  const [{ time, duration, autoplay }, setControls] = useControls(() => ({
    time: { value: 0, min: 0, max: 1, step: 0.01 },
    duration: { value: 4, min: 1, max: 8, step: 0.1 },
    autoplay: { value: true },
  }))

  useEffect(() => {
    totalTime.current = time
  }, [time])

  const [
    drop1,
    drop2,
    drop3,
    explosion1,
    blow1,
    explosion2,
    blow2,
    explosion3,
    blow3,
  ] = useMemo(
    () => [
      // drop 1
      shape({
        startColor: new Vector4(0, 0, 0, 1),
        startSize: 0.3,
        startThickness: 1,
        endColor: new Vector4(0, 0, 0, 0.6),
        endSize: 0,
        endThickness: 0,
        endOffset: new Vector2(-0.4, 0.4),
      }),
      // drop 2
      shape({
        startColor: new Vector4(0, 0, 0, 1),
        startSize: 0.3,
        startThickness: 1,
        endColor: new Vector4(0, 0, 0, 0.6),
        endSize: 0,
        endThickness: 0,
        endOffset: new Vector2(0.4, 0.4),
      }),
      // drop 3
      shape({
        startColor: new Vector4(0, 0, 0, 1),
        startSize: 0.3,
        startThickness: 1,
        endColor: new Vector4(0, 0, 0, 0.6),
        endSize: 0,
        endThickness: 0,
        endOffset: new Vector2(0, -0.4),
      }),
      // explosion 1
      shape({
        startColor: new Vector4(1, 0.2, 0, 1),
        startSize: 0.1,
        startThickness: 0.5,
        startInnerSmoothness: 1,
        endColor: new Vector4(1, 0.7, 0, 1),
        startOffset: new Vector2(-0.4, 0.4),
        endSize: 0.5,
        endThickness: 0,
        endInnerSmoothness: 0,
        easing: 2,
        endOffset: new Vector2(-0.4, 0.4),
      }),
      // blow 1
      shape({
        startColor: new Vector4(1, 1, 1, 1),
        startSize: 0.1,
        startThickness: 0.5,
        startInnerSmoothness: 1,
        proportional: true,
        endColor: new Vector4(1, 1, 1, 0.5),
        startOffset: new Vector2(-0.4, 0.4),
        endSize: 0.6,
        endThickness: 0,
        endInnerSmoothness: 0,
        endOffset: new Vector2(-0.4, 0.4),
      }),
      // explosion 2
      shape({
        startColor: new Vector4(1, 0.2, 0, 1),
        startSize: 0.1,
        startThickness: 0.5,
        startInnerSmoothness: 1,
        endColor: new Vector4(1, 0.7, 0, 1),
        startOffset: new Vector2(0.4, 0.4),
        endSize: 0.5,
        endThickness: 0,
        endInnerSmoothness: 0,
        easing: 2,
        endOffset: new Vector2(0.4, 0.4),
      }),
      // blow 2
      shape({
        startColor: new Vector4(1, 1, 1, 1),
        startSize: 0.1,
        startThickness: 0.5,
        startInnerSmoothness: 1,
        proportional: true,
        endColor: new Vector4(1, 1, 1, 0.5),
        startOffset: new Vector2(0.4, 0.4),
        endSize: 0.6,
        endThickness: 0,
        endInnerSmoothness: 0,
        endOffset: new Vector2(0.4, 0.4),
      }),
      // explosion 3
      shape({
        startColor: new Vector4(1, 0.2, 0, 1),
        startSize: 0.1,
        startThickness: 0.5,
        startInnerSmoothness: 1,
        endColor: new Vector4(1, 0.7, 0, 1),
        startOffset: new Vector2(0, -0.4),
        endSize: 0.5,
        endThickness: 0,
        endInnerSmoothness: 0,
        easing: 2,
        endOffset: new Vector2(0, -0.4),
      }),
      // blow 3
      shape({
        startColor: new Vector4(1, 1, 1, 1),
        startSize: 0.1,
        startThickness: 0.5,
        startInnerSmoothness: 1,
        proportional: true,
        endColor: new Vector4(1, 1, 1, 0.5),
        startOffset: new Vector2(0, -0.4),
        endSize: 0.6,
        endThickness: 0,
        endInnerSmoothness: 0,
        endOffset: new Vector2(0, -0.4),
      }),
    ],
    []
  )

  const combined = useMemo(
    () =>
      pipe(
        blendAlpha,
        blow3.nodes.colorNode,
        explosion3.nodes.colorNode,
        blow2.nodes.colorNode,
        explosion2.nodes.colorNode,
        blow1.nodes.colorNode,
        explosion1.nodes.colorNode,
        drop1.nodes.colorNode,
        drop2.nodes.colorNode,
        drop3.nodes.colorNode
      ),
    [
      drop1,
      drop2,
      drop3,
      explosion1,
      blow1,
      explosion2,
      blow2,
      explosion3,
      blow3,
    ]
  )

  useFrame((_, delta) => {
    updateShape(drop1, timings.drop1, totalTime.current)
    updateShape(drop2, timings.drop2, totalTime.current)
    updateShape(drop3, timings.drop3, totalTime.current)
    updateShape(explosion1, timings.explosion1, totalTime.current)
    updateShape(blow1, timings.blow1, totalTime.current)
    updateShape(explosion2, timings.explosion2, totalTime.current)
    updateShape(blow2, timings.blow2, totalTime.current)
    updateShape(explosion3, timings.explosion3, totalTime.current)
    updateShape(blow3, timings.blow3, totalTime.current)

    if (!autoplay) {
      return
    }

    totalTime.current += delta / duration

    if (totalTime.current > 1) {
      totalTime.current = 0
    }

    setControls({ time: totalTime.current })
  })

  return <meshBasicNodeMaterial colorNode={combined} transparent />
}

const MultiPage = () => (
  <Page title="Timing">
    <TripleExplosionMaterial />
  </Page>
)

export default MultiPage
