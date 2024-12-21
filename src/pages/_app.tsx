import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@/lib/extend'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
