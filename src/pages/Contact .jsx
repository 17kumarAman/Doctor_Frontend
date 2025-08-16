import axios from 'axios';
import { ArrowRight, Calendar, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from "../context/AuthContext";

function Contact() {
    const { API_BASE_URL } = useAuth();
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (values) => {
        const newErrors = {};

        if (!values.name.trim()) {
            newErrors.name = "Name is required";
        } else if (values.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!values.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(values.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!values.phone.trim()) {
            newErrors.phone = "Phone is required";
        }

        if (!values.message.trim()) {
            newErrors.message = "Message is required";
        } else if (values.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters";
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);

        const newErrors = validate(updatedData);
        setErrors(newErrors);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const newErrors = validate(formData);
        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate(formData);
        setErrors(validationErrors);
        setTouched({
            name: true,
            email: true,
            phone: true,
            message: true,
        });

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Please fix form errors before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/contact`, formData);
            toast.success("Form submitted successfully!");
            setFormData({ name: "", email: "", phone: "", message: "" });
            setTouched({});
            setErrors({});
        } catch (err) {
            toast.error(err.response?.data?.error || "Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* <Navbar /> */}
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                        <p className="text-xl text-gray-600">Get in touch with us for any questions or concerns</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Phone className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Phone</h3>
                                            <p className="text-gray-600">+1 (555) 123-4567</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <Mail className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Email</h3>
                                            <p className="text-gray-600">info@medicalclinic.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <MapPin className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Address</h3>
                                            <p className="text-gray-600">123 Medical Center Dr.<br />Healthcare City, HC 12345</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Book Appointment CTA */}
                                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Book an Appointment</h3>
                                    </div>
                                    <p className="text-gray-600 mb-4">Ready to see a doctor? Book your appointment online.</p>
                                    <Link
                                        to="/book-appointment"
                                        className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Book Now
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-lg shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                                {/* Name */}
                                <div>
                                    <label className="text-sm font-medium block mb-2 text-slate-900">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-2.5 px-4 text-sm bg-gray-100 border ${touched.name && errors.name ? 'border-red-500' : 'border-gray-200'} focus:border-slate-900 outline-0`}
                                    />
                                    {touched.name && errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-sm font-medium block mb-2 text-slate-900">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-2.5 px-4 text-sm bg-gray-100 border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-slate-900 outline-0`}
                                    />
                                    {touched.email && errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-sm font-medium block mb-2 text-slate-900">Phone</label>
                                    <input
                                        type="number"
                                        name="phone"
                                        maxLength={10}
                                        placeholder="Enter Phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-2.5 px-4 text-sm bg-gray-100 border ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-200'} focus:border-slate-900 outline-0`}
                                    />
                                    {touched.phone && errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-sm font-medium block mb-2 text-slate-900">Message</label>
                                    <textarea
                                        name="message"
                                        placeholder="Enter Message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-4 pt-3 text-sm bg-gray-100 border ${touched.message && errors.message ? 'border-red-500' : 'border-gray-200'} focus:border-slate-900 outline-0`}
                                    ></textarea>
                                    {touched.message && errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2.5 w-full transition-colors"
                                >
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Contact;
