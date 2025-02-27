import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Event } from '../types';
import { EventCard } from './EventCard';

interface EventSliderProps {
  events: Event[];
  slidesPerView?: number;
}

export function EventSlider({ events, slidesPerView = 3 }: EventSliderProps) {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView }
      }}
      className="event-slider"
    >
      {events.map(event => (
        <SwiperSlide key={event.id}>
          <EventCard event={event} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}