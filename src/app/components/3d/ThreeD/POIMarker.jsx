// 'use client';
// import { useRef } from 'react';

// const POIMarker = ({ position, onClick, isSelected, userData }) => {
//   const markerRef = useRef();

//   return (
//     <mesh
//       position={position}
//       onClick={onClick}
//       ref={markerRef}
//       userData={userData}
//     >
//       <sphereGeometry args={[0.1, 16, 16]} />
//       <meshStandardMaterial 
//         color={isSelected ? '#ec4899' : '#ef4444'} 
//         emissive={isSelected ? '#ec4899' : '#ef4444'}
//         emissiveIntensity={0.5}
//       />
//     </mesh>
//   );
// };

// export default POIMarker;

'use client';
import { useRef } from 'react';

const POIMarker = ({ position, onClick, isSelected, userData }) => {
  const markerRef = useRef();

  // Debug position
  if (!position || position.length !== 3 || position.some(isNaN)) {
    console.warn('Invalid POI position:', position);
  }

  return (
    <mesh
      ref={markerRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      userData={userData}
    >
      <sphereGeometry args={[0.2, 24, 24]} />
      <meshStandardMaterial
        color={isSelected ? '#ec4899' : '#ef4444'}
        emissive={isSelected ? '#ec4899' : '#ef4444'}
        emissiveIntensity={0.8}
        toneMapped={false}
      />
    </mesh>
  );
};

export default POIMarker;
