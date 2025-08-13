import { Menu, User, ChevronDown, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";

const Navbar = ({ onSidebarToggle }) => {
    const { isAuthenticated, userType, user, logout } = useAuth();
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth >= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        window.location.href = "/contact-us";
    };

    return (
        <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
            <div className=" max-w-[1720px] mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left side: Brand */}
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <div className="text-xl sm:text-2xl font-bold">The Vitality Now</div>
                    </Link>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {isAuthenticated && (userType === "admin" || userType === "doctor") ? (
                        <>
                            {/* Show toggle only when sidebar is hidden */}
                            {!showSidebar && (
                                <button
                                    onClick={onSidebarToggle}
                                    className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    title="Toggle Menu"
                                >
                                    <Menu size={24} />
                                </button>
                            )}

                            {/* Profile dropdown */}
                            <div className="hidden md:block relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                                >
                                    {/* <User size={18} /> */}
                                    {user.profile_image ? (
                                        <img
                                            src={user.profile_image}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {(user?.name || user?.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <span className="hidden sm:inline">
                                        {user?.name || user?.full_name || "User"}
                                    </span>
                                    <ChevronDown size={16} />
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                            <p className="font-medium">
                                                {user?.name || user?.full_name}
                                            </p>
                                            <p className="text-gray-500 capitalize">{userType}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Links for non-authenticated users
                        <div className="flex items-center gap-4">
                            <Link to="/contact-us" className="hover:text-gray-200 transition-colors">
                                Contact Us
                            </Link>
                            <Link to="/login" className="hover:text-gray-200 transition-colors">
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
