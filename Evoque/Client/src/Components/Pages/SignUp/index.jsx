import { Button } from "@mui/material";
import logo from "../../../assets/logo.png";
import TextField from '@mui/material/TextField';
import { Link, useNavigate } from "react-router-dom";
import googleicon from "../../../assets/google.png";
import { useState } from "react";
import { auth } from '../../../services/api';

const SignUp = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        contactNo: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Simple validation
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                setLoading(false);
                return;
            }

            const response = await auth.register(formData);
            
            if (response.success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-signin">
                <section className="signinpage signuppage">
                    <div className="text-center">
                        <img src={logo} alt="" />
                    </div>
                    <div className="container sign-in sign-up">
                        <div className="box card p-3 shadow border-0">
                            <h2 className="text-center mt-3">Sign Up</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <TextField 
                                                id="fullName" 
                                                label="Full Name" 
                                                type="text" 
                                                variant="standard" 
                                                className="w-100" 
                                                required
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <TextField 
                                                id="contactNo" 
                                                label="Contact Number" 
                                                type="tel" 
                                                variant="standard" 
                                                className="w-100"
                                                value={formData.contactNo}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <TextField 
                                        id="email" 
                                        label="Email" 
                                        type="email" 
                                        variant="standard" 
                                        className="w-100" 
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <TextField 
                                        id="password" 
                                        label="Password" 
                                        type="password" 
                                        variant="standard" 
                                        className="w-100" 
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="btn-signin w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing Up...' : 'Sign Up'}
                                </Button>
                                <p>Already Registered? <Link to="/signin" className="forgotpsw mb-3">Sign In</Link></p>
                                <h5 className="text-center font-weight-bold">Or continue with social account</h5>
                                <div className="google-signin d-flex justify-content-center align-item-center">
                                    <span><img src={googleicon} className="w-100 mt-3" alt="Google Sign Up"/></span>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SignUp;