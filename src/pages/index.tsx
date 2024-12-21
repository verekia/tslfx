import Link from 'next/link'

const IndexPage = () => (
  <ul>
    <li>
      <Link href="/hello-world">Hello World</Link>
      <Link href="/pulsing-ring">Pulsing Ring</Link>
    </li>
  </ul>
)

export default IndexPage
