import Canvas from '@/components/Canvas'
import { Leva, levaStore } from 'leva'
import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, type ReactNode } from 'react'

const Page = ({
  title,
  levaProps,
  children,
}: {
  title?: string
  levaProps?: LevaRootProps
  children?: ReactNode
}) => {
  useEffect(() => {
    return () => {
      levaStore.dispose()
    }
  }, [])

  return (
    <>
      <Head>
        <title>{title ? `${title} | TSLFX` : 'TSLFX | TSL VFX Library'}</title>
      </Head>
      <div className="h-screen bg-[#eee]">
        <ul className="fixed top-0 left-0 z-50 flex flex-wrap gap-2 p-2 [&>*]:text-sm [&>*]:text-white [&>*]:bg-black [&>*]:rounded-md [&>*]:px-2 [&>*]:py-1 [&>*]:hover:bg-gray-800">
          <Link href="/" className="content-center">
            <li>TSLFX</li>
          </Link>
          <Link
            href="https://github.com/verekia/tslfx"
            target="_blank"
            className="!px-1.5"
          >
            <li>
              <svg
                className="size-5"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
              >
                <path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9 1.4.3 2.6.4 3.8.4 8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1-8.4 1.9-15.9 2.7-22.6 2.7-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1 10.5 0 20-3.4 25.6-6 2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8 0 0 1.6-.5 5-.5 8.1 0 26.4 3.1 56.6 24.1 17.9-5.1 37-7.6 56.1-7.7 19 .1 38.2 2.6 56.1 7.7 30.2-21 48.5-24.1 56.6-24.1 3.4 0 5 .5 5 .5 12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5 1.2 0 2.6-.1 4-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z" />
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
          <Link href="/layering">
            <li>Layering</li>
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
                <meshBasicNodeMaterial
                  color="black"
                  transparent
                  opacity={0.03}
                />
              </mesh>
            </Canvas>
            <Leva titleBar={{ title, filter: false }} {...levaProps} />
          </>
        )}
      </div>
    </>
  )
}

export default Page
