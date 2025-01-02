import { useStoreValue } from '@/lib/store'
import type { ReactNode } from 'react'

const PlaneScene = ({ children }: { children: ReactNode }) => {
  const dark = useStoreValue('dark')
  const boundsPlane = useStoreValue('boundsPlane')

  return (
    <>
      <mesh scale={5}>
        <planeGeometry />
        {children}
      </mesh>
      {boundsPlane && (
        <mesh scale={5} position-z={-0.01}>
          <planeGeometry />
          <meshBasicNodeMaterial color="black" transparent opacity={dark ? 0.1 : 0.05} />
        </mesh>
      )}
    </>
  )
}

export default PlaneScene
