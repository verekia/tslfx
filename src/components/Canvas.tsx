import { Canvas } from '@react-three/fiber'

import { WebGPURenderer } from 'three/webgpu'

const MyCanvas = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas
      style={{ height: '100vh' }}
      gl={async (glProps) => {
        // @ts-expect-error
        const renderer = new WebGPURenderer(glProps)
        await renderer.init()
        return renderer
      }}
      flat
    >
      {children}
    </Canvas>
  )
}

export default MyCanvas
