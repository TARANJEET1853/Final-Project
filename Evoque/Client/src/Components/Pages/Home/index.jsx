import HomeBanner from "../../HomeBanner";
import HomeCategory from "../../HomeCategory";
import HomeTrending from "../../HomeTrending";
import coupon from "../../../assets/coupon.png"
import { CiMail } from "react-icons/ci";
import { Button } from "@mui/material";
import Footer from "../../Footer";
import Header from "../../Header";

const Home = () => {
    return (
        <>
            <Header/>
            <HomeBanner/>
            <HomeCategory/>
            <HomeTrending/>

            <div className="newsLetterSection">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <p className="text-white mb-2">₹100 discount for your first order</p>
                            <h4 className="text-white">Join our newsletter and get...</h4>
                            <p className="text-white">Join our email subscription now to get updates on promotions and coupons.</p>

                            <form>
                                <CiMail/>
                                <input type="email" placeholder="Your Email Address" required />
                                <Button type="submit">Subscribe</Button>
                            </form>
                        </div>
                        <div className="col-md-6">
                            <img src={coupon} alt="Special offer coupon" />
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer/>
        </>
    )
}

export default Home;