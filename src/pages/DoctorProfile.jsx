import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DoctorProfile = () => {
  const { user, setUser, API_BASE_URL } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [enablePassword, setEnablePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁 password toggle

  // ✅ Fetch Doctor Data
  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/doctor/${user.id}`);

      if (!res.data) {
        toast.error("Invalid response from server");
        return;
      }

      const data = res.data.data || res.data;

      const normalizeDate = (val) =>
        val ? new Date(val).toISOString().split("T")[0] : "";
      const normalizeTime = (val) => (val ? val.slice(0, 5) : "");

      const normalizedData = {
        ...data,
        available_date: normalizeDate(data.available_date),
        dob: normalizeDate(data.dob),
        start_time: normalizeTime(data.start_time),
        end_time: normalizeTime(data.end_time),
        break_start: normalizeTime(data.break_start),
        break_end: normalizeTime(data.break_end),
        password: "",
      };

      setDoctor(normalizedData);
      setFormData(normalizedData);
    } catch (err) {
      console.error("Fetch Doctor Error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch doctor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchDoctor();
  }, [user?.id]);

  // ✅ File Upload
  const handleFileUpload = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/upload`, formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
      console.error("Upload Error:", err);
      toast.error(err.response?.data?.message || "Error uploading image");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  // ✅ Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Enable Password Editing
  const handleEnablePassword = () => {
    const confirmChange = window.confirm("Are you sure you want to change your password?");
    if (confirmChange) {
      setEnablePassword(true);
      setFormData((prev) => ({ ...prev, password: "" }));
      setShowPassword(false);
    }
  };

  // ✅ Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = { ...formData };
      if (!enablePassword || !payload.password?.trim()) {
        delete payload.password;
      }

      const res = await axios.put(
        `${API_BASE_URL}/api/updateDoctor/${user.id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        toast.success("Profile updated successfully");

        const updatedDoctor = { ...doctor, ...payload, password: "" };
        setDoctor(updatedDoctor);
        setFormData(updatedDoctor);

        setUser(updatedDoctor);
        localStorage.setItem("doctor", JSON.stringify(updatedDoctor));

        setIsEditing(false);
        setEnablePassword(false);
      } else {
        toast.error(res.data?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update Error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Cancel Edit
  const handleCancel = () => {
    setFormData(doctor);
    setIsEditing(false);
    setEnablePassword(false);
    setShowPassword(false);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading profile...</div>;
  }

  const fields = [
    { label: "Full Name", name: "full_name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone", name: "phone", type: "text" },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "Available Days", name: "available_days", type: "text" },
    { label: "Available Time", name: "available_time", type: "text" },
    { label: "Specialization", name: "specialization", type: "text" },
    { label: "Qualification", name: "qualification", type: "text" },
    { label: "Experience (Years)", name: "experience_years", type: "number" },
    { label: "Consultation Fee", name: "consultation_fee", type: "number" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 relative">
        <img
          src={
            formData?.profile_image ||
            doctor?.profile_image ||
            "https://via.placeholder.com/150?text=No+Image"
          }
          alt="Doctor"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-100 shadow"
        />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800">{doctor?.full_name}</h2>
          <p className="text-blue-600 font-medium">{doctor?.specialization}</p>
          <p className="text-gray-500">
            {doctor?.qualification} • {doctor?.experience_years} yrs
          </p>
          <p className="text-gray-500">Fee: ₹{doctor?.consultation_fee}</p>
          <span
            className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-medium ${
              doctor?.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {doctor?.status}
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      {/* View Mode */}
      {!isEditing && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-2xl shadow p-4 sm:p-6">
          {[
            ["Email", doctor?.email],
            ["Phone", doctor?.phone],
            ["Gender", doctor?.gender],
            ["DOB", new Date(doctor?.dob).toLocaleDateString()],
            ["Available Days", doctor?.available_days],
            ["Available Time", doctor?.available_time],
            ["Bio", doctor?.bio],
          ].map(([label, value], idx) => (
            <div key={idx} className={label === "Bio" ? "sm:col-span-2" : ""}>
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

          {/* Gender */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Profile Image
            </label>
            <input type="file" onChange={handleFileChange} />
          </div>

          {/* Password */}
          <div className="sm:col-span-2">
            <label className="block mb-1 text-gray-700 font-medium">Password</label>
            <div className="flex gap-3 items-center relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                disabled={!enablePassword}
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
              />
              {enablePassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-12 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
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

export default DoctorProfile;
