import Canvas from '@/components/Canvas'
import { Leva, levaStore } from 'leva'
import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot'
import Link from 'next/link'
import { useEffect, type ReactNode } from 'react'

const Page = ({
  levaProps,
  children,
}: {
  levaProps?: LevaRootProps
  children?: ReactNode
}) => {
  useEffect(() => {
    return () => {
      levaStore.dispose()
    }
  }, [])

  return (
    <div className="h-screen bg-[#eee]">
      <ul className="fixed top-0 left-0 z-50 flex gap-2 p-2 [&>*]:text-sm [&>*]:text-white [&>*]:bg-black [&>*]:rounded-md [&>*]:px-2 [&>*]:py-1 [&>*]:hover:bg-gray-800">
        <Link href="/" className="content-center">
          <li>
            <svg
              className="size-5"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </li>
        </Link>
        <Link href="/impact">
          <li>Impact</li>
        </Link>
        <Link href="/pulsing-ring">
          <li>Pulsing Ring</li>
        </Link>
        <Link href="/gradient">
          <li>Gradient</li>
        </Link>
        {/* <Link href="/simplex3d">
          <li>Simplex 3D</li>
        </Link>
        <Link href="/simplex2d">
          <li>Simplex 2D</li>
        </Link> */}
        <Link href="/water">
          <li>Water</li>
        </Link>
        <Link href="/heart">
          <li>Heart</li>
        </Link>
        <Link href="/template">
          <li>Template</li>
        </Link>
      </ul>
      {children && (
        <>
          <Canvas>
            <mesh scale={5}>
              <planeGeometry />
              {children}
            </mesh>
            <mesh scale={5} position-z={-0.01}>
              <planeGeometry />
              <meshBasicNodeMaterial color="black" transparent opacity={0.03} />
            </mesh>
          </Canvas>
          <Leva {...levaProps} />
        </>
      )}
    </div>
  )
}

export default Page
