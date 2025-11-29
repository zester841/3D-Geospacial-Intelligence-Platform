'use client';

import React from 'react';
import Image from 'next/image';

const StickyScrollContainer = () => {
  return (
    <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory">
      <div className="relative">
        {/* First Sticky Section */}
        <div className="h-screen snap-start flex items-center justify-center z-10">
          <div className="w-[70%] flex justify-center">
            <Image
              src="/images/3d_img.jpeg"
              alt="First Section"
              width={1000}
              height={600}
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </div>

        {/* Second Sticky Section */}
        <div className="h-screen snap-start flex items-center justify-center z-20">
          <div className="w-[70%] flex justify-center">
            <Image
              src="/images/3d_img.jpeg"
              alt="Second Section"
              width={1000}
              height={600}
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </div>

        {/* Third Sticky Section */}
        <div className="h-screen snap-start flex items-center justify-center z-30">
          <div className="w-[70%] flex justify-center">
            <Image
              src="/images/map_img.png"
              alt="Third Section"
              width={1000}
              height={600}
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>


      
    </div>
  );
};

export default StickyScrollContainer;
