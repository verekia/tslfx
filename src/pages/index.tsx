import Page from '@/components/Page'
import { useStoreValue } from '@/lib/store'
import Head from 'next/head'
import Link from 'next/link'

const IndexPage = () => {
  const dark = useStoreValue('dark')

  return (
    <>
      <Head>
        <title>TSLFX | TSL VFX library</title>
      </Head>
      <Page />
      <div
        className={`fixed top-0 left-0 h-screen w-screen flex flex-col items-center justify-center gap-1 ${dark ? 'text-white' : 'text-black'}`}
      >
        <h1 className="text-center text-5xl font-bold mb-3">✨ TSLFX ✨</h1>
        <p className="text-center text-xl">
          <Link
            className="underline mb-3"
            href="https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language"
            target="_blank"
          >
            TSL
          </Link>{' '}
          VFX library
        </p>
        <p>
          <Link className="underline text-xl" href="https://github.com/verekia/tslfx" target="_blank">
            GitHub
          </Link>
        </p>
      </div>
    </>
  )
}

export default IndexPage
