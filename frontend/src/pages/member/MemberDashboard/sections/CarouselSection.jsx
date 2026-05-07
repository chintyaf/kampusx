import React from 'react';
import { Carousel } from 'react-bootstrap';

const CarouselSection = ({ banners }) => (
	/* Membungkus dengan div untuk memberikan ruang di bagian bawah */
	<div style={{ paddingBottom: '40px', position: 'relative' }}>
		{/* Menggunakan tag style di dalam JSX untuk meng-override class Bootstrap */}
		<style>
			{`
        .carousel-indicators {
          bottom: -40px;
          margin-bottom: 0;
        }
        .carousel-indicators [data-bs-target] {
          background-color: #ccc; /* Warna titik saat tidak aktif */
        }
        .carousel-indicators .active {
          background-color: #333; /* Warna titik saat aktif */
        }
      `}
		</style>

		<Carousel interval={4000} pause="hover" controls={false}>
			{banners.map((b) => (
				<Carousel.Item key={b.id}>
					<img
						src={b.image}
						alt=""
						className="d-block w-100"
						style={{ height: '300px', objectFit: 'cover' }}
					/>
				</Carousel.Item>
			))}
		</Carousel>
	</div>
);

export default CarouselSection;
