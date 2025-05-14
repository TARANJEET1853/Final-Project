import { Button } from "@mui/material";
import logo from "../../../assets/logo.png";
import TextField from '@mui/material/TextField';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from '../../../services/api';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await auth.login({ email, password });
            
            if (response.success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-signin">
                <section className="signinpage">
                    <div className="text-center">
                        <img src={logo} alt="" />
                    </div>
                    <div className="container sign-in">
                        <div className="box card p-3 shadow border-0">
                            <h2 className="text-center mt-3">Sign In</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <TextField 
                                        id="email" 
                                        label="Email" 
                                        type="email" 
                                        variant="standard" 
                                        className="w-100" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />   
                                </div>
                                <div className="forgotpsw mb-3">Forgot Password</div>
                                <Button 
                                    type="submit" 
                                    className="btn-signin w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                                <p>Not Registered? <Link to="/signup" className="forgotpsw mb-3">Sign Up</Link></p>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SignIn;