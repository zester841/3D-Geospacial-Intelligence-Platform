'use client';

import dynamic from 'next/dynamic';

const Map3D = dynamic(() => import('@/src/app/visualize-3d/Map3D'), { ssr: false });

export default function PageWrapper() {
  return (
    <div>
      {/* <h1 className="text-2xl font-bold">3D Mapbox Map</h1> */}
      <Map3D />
    </div>
  );
}
