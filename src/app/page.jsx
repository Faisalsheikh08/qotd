"use client"
import Navbar from '@/components/Navbar'
import { IconArrowNarrowRight, IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'
import React from 'react'

const images = [
  "https://www.gfecdn.net/img/testimonials/users/tyler-holdren.webp",
  "https://www.gfecdn.net/img/testimonials/users/jessie-shen.webp",
  "https://www.gfecdn.net/img/testimonials/users/praveen-kumar.webp",
  "https://www.gfecdn.net/img/testimonials/users/faith-morante.webp",
  "https://www.gfecdn.net/img/testimonials/users/anubhav-khanna.jpg"
]
const page = () => {
  return (
    <div className='flex flex-col items-center'>
      <Navbar />

      <div className="flex flex-col items-center justify-center h-dvh w-full text-center px-4 bg-gradient-to-b from-white to-violet-100">
        <span className="text-sm bg-violet-100 text-violet-700 border-[1px] border-violet-400 px-3 py-1 rounded-full mb-3">
          🎉 Introducing Question of The Day
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 max-w-3xl text-pretty">
          Daily writing, instant insights, lasting results
        </h1>
        <p className="mt-6 text-gray-500 text-md md:text-lg max-w-2xl text-balance">
          Meet the daily learning platform that helps you sharpen your writing, reasoning, and analysis — with instant AI feedback and expert insights.
        </p>


        <Link href={'/home'} className='mt-8 flex items-center justify-center gap-2 border-[1px] bg-gradient-to-br from-violet-700 to-violet-400 text-white border-gray-300 py-4 px-6 rounded-lg shadow-md cursor-pointer active:scale-105 select-none'>
          Get Started Now
          <IconArrowNarrowRight stroke={1.5} />
        </Link>


        <div className='mt-10'>
          <div className='flex mx-auto justify-center'>
            {images.map((img, index) => (
              <img key={index} src={img} className='h-10 w-10 object-cover rounded-full -ml-2 border-2 border-violet-50' />
            ))}
          </div>
          <p>50K+ learners already improving daily</p>
        </div>
      </div>
      {/* <a href="https://ibb.co/84tY5wp6"><img src="https://i.ibb.co/JFg37T45/danish-sir.png" alt="danish-sir" border="0"></a> */}
      {/* <img className='absolute right-24 top-[50%] h-36 mix-blend-multiply' src="https://i.ibb.co/JFg37T45/danish-sir.png" alt="" /> */}
      <p className="absolute bottom-4 mt-2 text-gray-500 text-md text-center">
        Built for serious learners by <span className="font-semibold text-violet-600">Teaching Pariksha 💜</span>
      </p>
    </div>
  )
}

export default page