import { Calendar, Clock, Edit, Eye, Filter, Search, Trash2,XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminAppointments = () => {
  const { API_BASE_URL } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;


  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [filter, doctorFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments`);
      const data = await response.json();

      if (data.status) {
        let filteredAppointments = data.data;

        if (filter !== 'all') {
          filteredAppointments = filteredAppointments.filter(apt => apt.status === filter);
        }
        if (doctorFilter) {
          filteredAppointments = filteredAppointments.filter(apt => apt.doctor_id == doctorFilter);
        }
        if (dateFilter) {
          filteredAppointments = filteredAppointments.filter(apt => apt.appointment_date === dateFilter);
        }
        if (searchTerm) {
          filteredAppointments = filteredAppointments.filter(apt =>
            apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.patient_phone?.includes(searchTerm)
          );
        }

        setAppointments(filteredAppointments);
        setCurrentPage(1); // reset to first page after filter change
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/allDoctors`);
      const data = await response.json();
      if (data.status) setDoctors(data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.status) {
        toast.success('Appointment deleted successfully');
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Error deleting appointment');
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success(`Appointment ${status.toLowerCase()} successfully`);
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error updating appointment');
    }
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled':
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const getStats = () => {
    const total = appointments.length;
    const pending = appointments.filter(apt => apt.status === 'Pending').length;
    const confirmed = appointments.filter(apt => apt.status === 'Confirmed').length;
    const cancelled = appointments.filter(apt => apt.status === 'Cancelled').length;
    const rejected = appointments.filter(apt => apt.status === 'Rejected').length;
    return { total, pending, confirmed, cancelled, rejected };
  };

  const stats = getStats();

  // Pagination logic
  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Management</h1>
        <p className="text-gray-600">Manage and oversee all appointments in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Doctor:</label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>{doctor.full_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setFilter('all');
              setDoctorFilter('');
              setDateFilter('');
              setSearchTerm('');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600">No appointments match your current filters.</p>
                  </td>
                </tr>
              ) : (
                currentAppointments.map((appointment, index) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {index + 1 + (currentPage - 1) * appointmentsPerPage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {appointment.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">

                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient_email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient_phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="flex items-center justify-center">
                            <img
                              src={getDoctorProfilePicture(appointment.doctor_id)}
                              alt="Doctor"
                              className="h-10 w-10 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getDoctorName(appointment.doctor_id)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getDoctorSpecialization(appointment.doctor_id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(appointment.appointment_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(appointment.appointment_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewAppointmentDetails(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {appointment.status === "Pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateAppointmentStatus(appointment.id, "Confirmed")
                              }
                              className="text-green-600 hover:text-green-900"
                              title="Confirm"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateAppointmentStatus(appointment.id, "Rejected")
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Pagination Controls */}
      {appointments.length > appointmentsPerPage && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>{currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}


      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedAppointment.patient_name}</p>
                  {selectedAppointment.patient_email && (
                    <p><span className="font-medium">Email:</span> {selectedAppointment.patient_email}</p>
                  )}
                  {selectedAppointment.patient_phone && (
                    <p><span className="font-medium">Phone:</span> {selectedAppointment.patient_phone}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Doctor:</span> {getDoctorName(selectedAppointment.doctor_id)}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(selectedAppointment.appointment_date)}</p>
                  <p><span className="font-medium">Time:</span> {formatTime(selectedAppointment.appointment_time)}</p>
                  <p><span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </p>
                  {selectedAppointment.reason && (
                    <p><span className="font-medium">Reason:</span> {selectedAppointment.reason}</p>
                  )}
                </div>
              </div>

              {selectedAppointment.status === 'Pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.id, 'Confirmed');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.id, 'Rejected');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments; 