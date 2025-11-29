'use client';

import React from 'react';
import Image from 'next/image';
import StickyScrollContainer from './components/home/overlap_animation'

import Frame from './components/home/frame'
import Middle from './components/home/middle'
import Integeration from './components/home/intigration'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#000] text-white font-sans over ">
      {/* Radial gradient background */}

      <div className="absolute w-full h-[100vh] flex justify-center items-center bg-[#000306] ">
  {/* Radial Gradient Background */}
  <div className="absolute w-[100%] h-[100%] mix-blend-screen bg-[radial-gradient(circle_at_center,_#1c6ebf,_#050b1d_20%,_#000_70%)] z-0" />

  {/* Grid Image Overlay */}
  <div className="absolute w-[70%] h-[70%] z-10 blur-edge-mask">
    <Image
      src="/images/image1.svg"
      alt="grid background"
      fill
      className="object-cover opacity-10  mix-blend-screen pointer-events-none"
    />
  </div>

  {/* Centered Content (if any) */}
 
</div>


      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="text-xl font-bold">cube.io</div>
        <div className="space-x-6 hidden sm:flex">
          <a href="#features" className="hover:text-gray-300">Features</a>
          <a href="#pricing" className="hover:text-gray-300">Pricing</a>
          <button className="px-4 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative  mt-[10vh] z-10 flex flex-col items-center justify-center text-center px-4 py-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
          Learning 3D is Never <br className="hidden sm:block" /> Been Easier
        </h1>
        <p className="text-gray-300 max-w-xl text-lg mb-8">
          Explore the world of 3D designed for beginners. Making the creative
          process enjoyable and accessible to everyone.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200">
            Try Cube.io for Free
          </button>
          <button className="border border-blue-400 px-6 py-3 rounded-full text-blue-400 hover:bg-blue-500 hover:text-white">
            See Examples →
          </button>
        </div>
      </div>
      {/* <div className="sticky top-0 h-screen bg-[#000306] flex items-center justify-center z-10">
          <div className="w-[70%] flex justify-center">
            <Image
              src="/images/3d_img.jpeg"
              alt="First Section"
              width={1000}
              height={600}
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </div> */}
      {/* <div className='sticky top-0 h-screen bg-[#000306] flex items-center justify-center z-10'>
     
      </div> */}
      <StickyScrollContainer/>
      <Frame/>
      <Middle/>
      <Integeration/>
    </div>
  );
}