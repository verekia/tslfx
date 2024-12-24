import { dot, max, min, mul, select, sign, sqrt, vec2 } from 'three/tsl'

// https://iquilezles.org/articles/distfunctions2d/

const dot2 = (p: ReturnType<typeof vec2>) => dot(p, p)

export const sdHeart = (n: ReturnType<typeof vec2>) => {
  const p = vec2(n.x.abs(), n.y)

  return select(
    p.y.add(p.x).greaterThan(1),
    sqrt(dot2(p.sub(vec2(0.25, 0.75)))).sub(sqrt(2.0).div(4.0)),
    sqrt(
      min(
        dot2(p.sub(vec2(0.0, 1.0))),
        dot2(p.sub(mul(0.5, max(p.x.add(p.y), 0.0))))
      )
    ).mul(sign(p.x.sub(p.y)))
  )
}
