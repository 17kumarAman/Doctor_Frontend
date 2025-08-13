import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem('admin') || !!localStorage.getItem('doctor');

    if (!isLoggedIn) {
        toast.error('Please login to access this page');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;