import { FaLocationPin } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa6";

const Footer = () => {
    return (
        <>
            <footer>
                <div className="container">
                    <div className="row">
                        <div class="col-md-3">
                            <h4 class="footer-heading">Evoque Clothing</h4>
                            <div class="footer-underline"></div>
                            <p>
                                Evoque Clothing is a fresh and innovative brand established in 2024, offering stylish and versatile fashion for modern individuals.
                            </p>
                        </div>
                        <div class="col-md-3">
                            <h4 class="footer-heading">Quick Links</h4>
                            <div class="footer-underline"></div>
                            <div class="mb-2"><p>Home</p></div>
                            <div class="mb-2"><p>About Us</p></div>
                            <div class="mb-2"><p>Contact Us</p></div>
                            <div class="mb-2"><p>Blogs</p></div>
                            <div class="mb-2"><p>Sitemaps</p></div>
                        </div>
                        <div class="col-md-3">
                            <h4 class="footer-heading">Shop Now</h4>
                            <div class="footer-underline"></div>
                            <div class="mb-2"><p>Collections</p></div>
                            <div class="mb-2"><p>Trending Products</p></div>
                            <div class="mb-2"><p>Men</p></div>
                            <div class="mb-2"><p>Women</p></div>
                            <div class="mb-2"><p>Cart</p></div>
                        </div>
                        <div class="col-md-3">
                            <h4 class="footer-heading">Reach Us</h4>
                            <div class="footer-underline"></div>
                            <div class="mb-2">
                                <p>
                                    <FaLocationPin/> #2D, Model Town, Patiala, India - 140401
                                </p>
                            </div>
                            <div class="mb-2">
                                <p>
                                    <FaPhoneAlt/> +91 998-864-2987
                                </p>
                            </div>
                            <div class="mb-2">
                                <p>
                                    <IoMail/> evoqueclothing@gmail.com
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="copyright-area">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-8">
                                    <p class=""> &copy; 2024 - Evoque Clothing - Ecommerce. All rights reserved.</p>
                                </div>
                                <div class="col-md-4">
                                    <div class="social-media">
                                        Get Connected:
                                        <FaFacebookF/>
                                        <FaInstagram/>
                                        <FaXTwitter/>
                                        <FaYoutube/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer;