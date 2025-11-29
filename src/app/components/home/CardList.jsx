'use client';
import React from 'react';
import Card from './Card';
import './Card.css';
import './CardList.css';
import Image from "next/image";
import Link from 'next/link';

const Content = [
  {
    id: 1,
    title: 'Create model',
    description: 'Create your model with our easy to use modeling tool.',
    icon: '/images/one019.png',
    link: '/create-model',
  },
  {
    id: 2,
    title: 'Visualize 3D model',
    description: 'Visualize your 3D model with our easy to use visualization tool.',
    icon: '/images/two19.png',
    link: '/3dHomePage',
  },
  {
    id: 3,
    title: 'Visualize 3D map',
    description: 'Visualize your 3D map with our easy to use visualization tool.',
    icon: '/images/three9.png',
    link: '/visualize-3d',
  },
  {
    id: 4,
    title: 'Visualize Map',
    description: 'Visualize your map with our easy to use visualization tool.',
    icon: '/images/four9.png',
    link: '/MapEditor',
  },
  {
    id: 5,
    title: 'Templates',
    description: 'With our templates you can easily finish your project in no time.',
    icon: '/images/five19.png',
    link: '/templates',
  },
];

const CardList = () => {
  const handleCardClick = (cardId) => {
    console.log(`Card with ID ${cardId} clicked!`);
  };

  return (
    <div className="app">
      <div className="card-grid z-15">
        {Content.map((card) => (
          <Link key={card.id} href={card.link} passHref>
            <div>
              <Card
                id={card.id}
                image={card.icon}
                title={card.title}
                description={card.description}
                onClick={() => handleCardClick(card.id)}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute w-[80%] h-[80%] z-10 blur-edge-mask3">
        <Image
          src="/images/image1.svg"
          alt="grid background"
          fill
          className="object-cover opacity-15 mix-blend-screen pointer-events-none"
        />
      </div>
    </div>
  );
};

export default CardList;
