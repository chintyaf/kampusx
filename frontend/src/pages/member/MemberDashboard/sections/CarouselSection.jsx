import React from 'react';
import { Carousel, Container } from 'react-bootstrap';

const CarouselSection = ({ banners }) => (
  <Container className="pt-3">
    {/* Style override to make indicators look modern and clean */}
    <style>
      {`
        .custom-carousel .carousel-indicators {
          bottom: 12px;
          margin-bottom: 0;
          z-index: 2;
        }
        .custom-carousel .carousel-indicators [data-bs-target] {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          margin: 0 4px;
          transition: all 0.2s ease;
        }
        .custom-carousel .carousel-indicators .active {
          width: 18px;
          border-radius: 4px;
          background-color: #fff;
        }
      `}
    </style>

    <div 
      style={{ 
        position: 'relative', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: '#fff'
      }}
    >
      <Carousel 
        interval={4500} 
        pause="hover" 
        controls={false} 
        className="custom-carousel"
      >
        {banners.map((b) => (
          <Carousel.Item key={b.id}>
            <div style={{ position: 'relative' }}>
              {/* Subtle dark gradient overlay for depth */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.3) 100%)',
                  zIndex: 1
                }} 
              />
              <img
                src={b.image}
                alt=""
                className="d-block w-100 animate-zoom"
                style={{ 
                  height: '240px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  </Container>
);

export default CarouselSection;
