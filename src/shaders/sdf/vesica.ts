import { float, length, select, sqrt, vec2 } from 'three/tsl'

// https://iquilezles.org/articles/distfunctions2d/

export const sdVesica = (
  p: ReturnType<typeof vec2>,
  r: ReturnType<typeof float> | number,
  d: ReturnType<typeof float> | number
) => {
  const pAbs = p.abs()
  const b = sqrt(float(r).mul(r).sub(float(d).mul(d)))

  const condition = pAbs.y.sub(b).mul(d).greaterThan(pAbs.x.mul(b))

  return select(
    condition,
    length(pAbs.sub(vec2(0, b))),
    length(pAbs.sub(vec2(float(-1).mul(d), 0))).sub(r)
  )
}
