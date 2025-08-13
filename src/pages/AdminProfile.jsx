import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const AdminProfile = () => {
    const { user, setUser, API_BASE_URL } = useAuth();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [enablePassword, setEnablePassword] = useState(false);

    const [showReceptionistForm, setShowReceptionistForm] = useState(false);
    const [receptionistData, setReceptionistData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });


    
    // Fetch Admin
    const fetchAdmin = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_BASE_URL}/api/admin/getAdmin/${user.id}`
            );
            const data = res.data.data || res.data;
            setAdmin(data);
            setFormData({ ...data, password: "" });
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch admin details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchAdmin();
    }, [user?.id]);

    // File Upload
    const handleFileUpload = async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/upload`,
                formDataUpload,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (res.data?.data?.secure_url) {
                setFormData((prev) => ({
                    ...prev,
                    profile_image: res.data.data.secure_url,
                }));
                toast.success("Profile image uploaded");
            } else {
                toast.error("Image upload failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error uploading image");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    };

    // Input Change for Admin
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Input Change for Receptionist
    const handleReceptionistChange = (e) => {
        const { name, value } = e.target;
        setReceptionistData((prev) => ({ ...prev, [name]: value }));
    };

    // Enable Password Editing
    const handleEnablePassword = () => {
        const confirmChange = window.confirm(
            "Are you sure you want to change your password?"
        );
        if (confirmChange) {
            setEnablePassword(true);
            setFormData((prev) => ({ ...prev, password: "" }));
        }
    };

    // Submit Admin Edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = { ...formData };
            if (!enablePassword || !payload.password?.trim()) {
                delete payload.password;
            }

            const res = await axios.put(
                `${API_BASE_URL}/api/admin/updateAdmin/${user.id}`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (res.data?.success) {
                toast.success("Profile updated successfully");
                const updatedAdmin = { ...admin, ...payload, password: "" };
                setAdmin(updatedAdmin);
                setFormData(updatedAdmin);
                setUser(updatedAdmin);
                localStorage.setItem("admin", JSON.stringify(updatedAdmin));
                setIsEditing(false);
                setEnablePassword(false);
            } else {
                toast.error(res.data?.message || "Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    // Cancel Edit
    const handleCancel = () => {
        setFormData(admin);
        setIsEditing(false);
        setEnablePassword(false);
    };

    // Submit Receptionist
    const handleAddReceptionist = async (e) => {
        e.preventDefault();
        const { name, email, phone, password } = receptionistData;
        if (!name || !email || !phone || !password) {
            toast.error("All fields are required");
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/register`, {
                name,
                email,
                phone,
                password,
                role: "receptionist",
                status: "active",
            });

            if (res.data?.success) {
                toast.success("Receptionist added successfully");
                setReceptionistData({ name: "", email: "", phone: "", password: "" });
                setShowReceptionistForm(false);
            } else {
                toast.error(res.data?.message || "Failed to add receptionist");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error adding receptionist");
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading profile...</div>;
    }

    const fields = [
        { label: "Name", name: "name", type: "text" },
        { label: "Email", name: "email", type: "email" },
        { label: "Phone", name: "phone", type: "text" },
        { label: "Role", name: "role", type: "text" },
        { label: "Status", name: "status", type: "text" },
    ];

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 relative">
                <img
                    src={
                        formData?.profile_image ||
                        admin?.profile_image ||
                        "https://via.placeholder.com/150?text=No+Image"
                    }
                    alt="Admin"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-100 shadow"
                />
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">{admin?.name}</h2>
                    <p className="text-blue-600 font-medium">{admin?.role}</p>
                    <span
                        className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-medium ${admin?.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {admin?.status}
                    </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        onClick={() => setShowReceptionistForm(!showReceptionistForm)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                    >
                        {showReceptionistForm ? "Close" : "Add Receptionist"}
                    </button>
                </div>
            </div>

            {/* Receptionist Form */}
            {showReceptionistForm && (
                <form
                    onSubmit={handleAddReceptionist}
                    className="mt-6 bg-white rounded-2xl shadow p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    {["name", "email", "phone", "password"].map((field) => (
                        <div key={field}>
                            <label className="block mb-1 text-gray-700 font-medium capitalize">
                                {field}
                            </label>
                            <input
                                type={field === "password" ? "password" : "text"}
                                name={field}
                                value={receptionistData[field]}
                                onChange={handleReceptionistChange}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                            />
                        </div>
                    ))}
                    <div className="col-span-1 sm:col-span-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowReceptionistForm(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Add Receptionist
                        </button>
                    </div>
                </form>
            )}

            {/* View Details */}
            {!isEditing && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-2xl shadow p-4 sm:p-6">
                    {[
                        ["Email", admin?.email],
                        ["Phone", admin?.phone],
                        ["Role", admin?.role],
                        ["Status", admin?.status],
                    ].map(([label, value], idx) => (
                        <div key={idx}>
                            <p className="text-gray-500">{label}</p>
                            <p className="font-semibold break-words">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Form */}
            {isEditing && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-6 bg-white rounded-2xl shadow p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    {fields.map(({ label, name, type }) => (
                        <div key={name}>
                            <label className="block mb-1 text-gray-700 font-medium">
                                {label}
                            </label>
                            <input
                                type={type}
                                name={name}
                                value={formData[name] || ""}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    ))}

                    {/* Profile Image */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Profile Image
                        </label>
                        <input type="file" onChange={handleFileChange} />
                    </div>

                    {/* Password */}
                    <div className="sm:col-span-2">
                        <label className="block mb-1 text-gray-700 font-medium">
                            Password
                        </label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="password"
                                name="password"
                                value={formData.password || ""}
                                onChange={handleChange}
                                disabled={!enablePassword}
                                className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                            />
                            {!enablePassword && (
                                <button
                                    type="button"
                                    onClick={handleEnablePassword}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                                >
                                    Change
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 sm:col-span-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminProfile;
