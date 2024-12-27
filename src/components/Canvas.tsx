import { useState } from 'react'
import { Canvas } from '@react-three/fiber'

import { WebGPURenderer } from 'three/webgpu'

const MyCanvas = ({ children }: { children: React.ReactNode }) => {
  const [frameloop, setFrameloop] = useState<'never' | 'always'>('never')

  return (
    <Canvas
      style={{ height: '100vh' }}
      frameloop={frameloop}
      flat
      gl={(canvas) => {
        const renderer = new WebGPURenderer({
          // @ts-expect-error whatever
          canvas,
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
        })
        renderer.init().then(() => setFrameloop('always'))
        // @ts-expect-error
        renderer.xr = { addEventListener: () => {} }
        return renderer
      }}
    >
      {children}
    </Canvas>
  )
}

export default MyCanvas
