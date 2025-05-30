import { extend } from '@react-three/fiber'
import * as THREE from 'three/webgpu'

import type { ThreeToJSXElements } from '@react-three/fiber'

declare module '@react-three/fiber' {
  // eslint-disable-next-line
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)
