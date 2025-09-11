import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


const Home = () => {
  return (
    <div className="min-h-screen w-full relative bg-white">
  {/* Cool Blue Glow Top */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "#ffffff",
      backgroundImage: `
        radial-gradient(
          circle at top center,
          rgba(70, 130, 180, 0.5),
          transparent 70%
        )
      `,
      filter: "blur(80px)",
      backgroundRepeat: "no-repeat",
    }}
  />
     {/* Your Content/Components */}
     <div className='relative z-10'>
        <h1>
          Hello world!
        </h1>
        <Input type="email" placeholder="Email" />
      </div>
</div>
  )
}

export default Home