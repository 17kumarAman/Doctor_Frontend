import axios from "axios";
import { MessageSquare, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const [contacts, setContacts] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { API_BASE_URL,user } = useAuth();


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [contactRes, doctorRes, appointmentsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/contact`),
                    axios.get(`${API_BASE_URL}/api/allDoctors`),
                    axios.get(`${API_BASE_URL}/api/appointments`),
                ]);

                setContacts(contactRes?.data?.contacts || []);
                setDoctors(doctorRes?.data?.data || []);
                setAppointments(appointmentsRes?.data?.data || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setContacts([]);
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const getDoctorName = (doctorId) => {
        const doctor = doctors.find(d => d.id == doctorId);
        return doctor ? doctor.full_name : 'Unknown Doctor';
    };
    const getDoctorSpecialization = (doctorId) => {
        const doctor = doctors.find(d => d.id == doctorId);
        return doctor ? doctor.specialization : 'Unknown Specialization';
    };
    const getDoctorProfilePicture = (doctorId) => {
        const doctor = doctors.find(d => d.id == doctorId);
        return doctor ? doctor.profile_image : '';
    };

    // Updated date format: DD-MM-YYYY
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const stats = [
        {
            title: "Total Doctors",
            value: doctors.length,
            icon: Users,
            color: "bg-green-500",
            textColor: "text-green-500",
        },
        {
            title: "Total Appointments",
            value: appointments.length,
            icon: UserPlus,
            color: "bg-purple-500",
            textColor: "text-purple-500",
        },
        {
            title: "Total Enquiries",
            value: contacts.length,
            icon: MessageSquare,
            color: "bg-blue-500",
            textColor: "text-blue-500",
        },
    ];

    const TableCard = ({ title, data, columns, onViewAll }) => (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <button
                    onClick={onViewAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    View All
                </button>
            </div>
            <div className="overflow-x-auto">
                {data.length > 0 ? (
                    <table className="min-w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className="px-4 py-2 font-medium text-gray-600 whitespace-nowrap"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 5).map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    {columns.map((col, i) => (
                                        <td
                                            key={i}
                                            className="px-4 py-2 whitespace-nowrap align-middle"
                                        >
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 text-center py-4">No data found</p>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">{`Welcome to your ${user?.role === 'super_admin'? 'admin':''} dashboard`}</p>
            </div>

            {/* Stats Grid */}
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-6 min-w-max sm:grid sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow p-6 flex items-center flex-shrink-0 w-64 sm:w-auto"
                            >
                                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            <TableCard
                title="Recent Appointments"
                data={appointments}
                onViewAll={() => navigate("/appointments")}
                columns={[
                    { header: "Name", render: (c) => c.patient_name },
                    {
                        header: "Email", render: (c) => (
                            <div className="flex items-center">

                                <div className="">
                                    <div className="text-sm font-medium text-gray-900">
                                        {c.patient_email}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {c.patient_phone}
                                    </div>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Doctor", render: (c) => (
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                    <div className="flex items-center justify-center">
                                        <img
                                            src={getDoctorProfilePicture(c.doctor_id)}
                                            alt="Doctor"
                                            className="h-10 w-10 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {getDoctorName(c.doctor_id)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {getDoctorSpecialization(c.doctor_id)}
                                    </div>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Date",
                        render: (c) =>
                        (
                            <div className="flex items-center">

                                <div className="">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatDate(c.appointment_date)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatTime(c.appointment_time)}
                                    </div>
                                </div>
                            </div>
                        )
                    },
                ]}
            />
            {/* Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TableCard
                    title="Recent Enquiries"
                    data={contacts}
                    onViewAll={() => navigate("/enquiries")}
                    columns={[
                        { header: "Name", render: (c) => c.name },
                        { header: "Email", render: (c) => c.email },

                        {
                            header: "Date",
                            render: (c) =>
                                new Date(c.createdAt).toLocaleDateString("en-GB"),
                        },
                    ]}
                />

                <TableCard
                    title="Recent Doctors"
                    data={doctors}
                    onViewAll={() => navigate("/doctors")}
                    columns={[
                        {
                            header: "Name",
                            render: (d) => (
                                <div className="flex items-center gap-2">
                                    {d.profile_image && <img
                                        src={d.profile_image}
                                        alt={d.full_name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />}
                                    {d.full_name}
                                </div>
                            ),
                        },
                        { header: "Specialization", render: (d) => d.specialization },
                        {
                            header: "Status",
                            render: (d) => (
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${d.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {d.status}
                                </span>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}

export default Dashboard;
