import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated, API_BASE_URL } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState('admin'); // 'admin' or 'doctor'

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Both email and password are required');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = loginType === 'admin' 
                ? `${API_BASE_URL}/api/admin/login`
                : `${API_BASE_URL}/api/loginDoctor`;

            const { data } = await axios.post(endpoint, { email, password });
            toast.success(data.message || 'Login successful');

            login(data.data, loginType);

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 1500);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* <Navbar /> */}
            <div className="bg-gray-50">
                <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
                    <div className="max-w-[480px] w-full">
                        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
                            <h1 className="text-slate-900 text-center text-3xl font-semibold">Login</h1>
                            
                            {/* Login Type Toggle */}
                            <div className="mt-6 flex bg-gray-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setLoginType('admin')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        loginType === 'admin'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Admin Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLoginType('doctor')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        loginType === 'doctor'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Doctor Login
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                <div>
                                    <label className="text-slate-900 text-sm font-medium mb-2 block">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full text-sm border border-slate-300 px-4 py-3 rounded-md outline-blue-600 focus:border-blue-600"
                                        placeholder="Enter your email"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-900 text-sm font-medium mb-2 block">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full text-sm border border-slate-300 px-4 py-3 rounded-md outline-blue-600 focus:border-blue-600"
                                        placeholder="Enter password"
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-2 px-4 text-[15px] font-medium rounded-md text-white ${
                                        isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                    }`}
                                >
                                    {isLoading ? 'Please wait...' : `Login as ${loginType}`}
                                </button>

                                <p className="text-slate-900 text-sm mt-6 text-center">
                                    Secure Login for {loginType === 'admin' ? 'Admin' : 'Doctor'} Users Only
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
