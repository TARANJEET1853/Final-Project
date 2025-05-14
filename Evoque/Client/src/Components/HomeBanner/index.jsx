import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import banner_1 from "../../assets/Banner/banner_1.jpg";
import banner_2 from "../../assets/Banner/banner_2.jpg";
import banner_3 from "../../assets/Banner/banner_3.jpg";
import banner_4 from "../../assets/Banner/banner_4.jpg";

const HomeBanner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <button className="slick-prev">Previous</button>,
    nextArrow: <button className="slick-next">Next</button>,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: true,
          dots: false
        }
      }
    ]
  };

  return (
    <div className="Homebanner-section">
      <Slider {...settings}>
        <div>
          <img src={banner_4} alt="banner_4" className="w-100" />
        </div>
        <div>
          <img src={banner_2} alt="banner_2" className="w-100" />
        </div>
        <div>
          <img src={banner_3} alt="banner_3" className="w-100" />
        </div>
        <div>
          <img src={banner_1} alt="banner_1" className="w-100" />
        </div>
      </Slider>
    </div>
  );
};

export default HomeBanner;
