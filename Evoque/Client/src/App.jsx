import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./Components/Footer";
import Home from "./Components/Pages/Home";
import Listing from "./Components/Pages/Listing";
import ProductDetails from "./Components/Pages/ProductDetails";
import Cart from "./Components/Pages/Cart";
import SignIn from "./Components/Pages/SignIn";
import SignUp from "./Components/Pages/SignUp";
import Profile from "./Components/Pages/Profile";
import Orders from "./Components/Pages/Orders";
import Dashboard from "./Components/Pages/Dashboard";
import { useState } from "react";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* <Header/> */}
      <Routes>
        <Route path="/" exact={true} element={<Home />} />
        <Route path="/cat/:id" exact={true} element={<Listing />} />
        <Route path="/product/:id" exact={true} element={<ProductDetails />} />
        <Route path="/cart" exact={true} element={<Cart />} />
        <Route path="/signin" exact={true} element={<SignIn />} />
        <Route path="/signup" exact={true} element={<SignUp />} />
        <Route path="/profile" exact={true} element={<Profile />} />
        <Route path="/orders" exact={true} element={<Orders />} />
        
        {/* Admin Routes */}
        <Route path="/admin" exact={true} element={<Dashboard />} />
        {/* <Route path="/admin/products" exact={true} element={<ProductManagement/>} />
        <Route path="/admin/categories" exact={true} element={<CategoryManagement/>} /> */}
      </Routes>
      {/* <Footer/> */}
    </BrowserRouter>
  );
}

export default App;
