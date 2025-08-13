import { Calendar, CheckCircle, Eye, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const DoctorAppointments = () => {
  const { user, API_BASE_URL } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);


  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user, filter, dateFilter, currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/appointments/doctor/${user?.id}`);

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      if (data?.status) {
        let filteredAppointments = data?.data || [];

        if (filter !== 'all') {
          filteredAppointments = filteredAppointments.filter(
            apt => (apt?.status || '').toLowerCase() === filter.toLowerCase()
          );
        }

        if (dateFilter) {
          filteredAppointments = filteredAppointments.filter(apt => {
            if (!apt?.appointment_date) return false;
            // Extract YYYY-MM-DD directly from original ISO string to avoid timezone shift
            const aptDate = apt.appointment_date.slice(0, 10);
            return aptDate === dateFilter;
          });
        }

        setAppointments(filteredAppointments);
      } else {
        toast.error(data?.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(error.message || 'Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      if (data?.status) {
        toast.success(`Appointment ${status.toLowerCase()} successfully`);
        fetchAppointments();
      } else {
        toast.error(data?.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.message || 'Error updating appointment');
    }
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC', // ensures no shift
    }) : 'N/A';

  const formatTime = (timeString) =>
    timeString ? new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) : 'N/A';

  // Pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Appointments</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
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

        <button
          onClick={() => { setFilter('all'); setDateFilter(''); }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear Filters
        </button>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="p-8 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                      <p className="text-gray-600">You don't have any appointments matching your current filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentAppointments.map((apt, index) => (
                  <tr key={apt?.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {index + 1 + (currentPage - 1) * appointmentsPerPage}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {apt?.patient_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(apt?.appointment_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatTime(apt?.appointment_time)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt?.status)}`}>
                        {apt?.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-3">
                      <button
                        title="View"
                        onClick={() => viewAppointmentDetails(apt)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {apt?.status === 'Pending' && (
                        <>
                          <button
                            title="Accept"
                            onClick={() => updateAppointmentStatus(apt?.id, 'Confirmed')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            title="Reject"
                            onClick={() => updateAppointmentStatus(apt?.id, 'Rejected')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Pagination */}
      {appointments.length > appointmentsPerPage && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex items-center space-x-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>{currentPage} / {Math.ceil(appointments.length / appointmentsPerPage)}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage * appointmentsPerPage >= appointments.length}
              className="px-4 py-2 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Appointment Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Patient Information</h3>
                <p><strong>Name:</strong> {selectedAppointment?.patient_name || 'N/A'}</p>
                {selectedAppointment?.patient_email && <p><strong>Email:</strong> {selectedAppointment.patient_email}</p>}
                {selectedAppointment?.patient_phone && <p><strong>Phone:</strong> {selectedAppointment.patient_phone}</p>}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Appointment Details</h3>
                <p><strong>Date:</strong> {formatDate(selectedAppointment?.appointment_date)}</p>
                <p><strong>Time:</strong> {formatTime(selectedAppointment?.appointment_time)}</p>
                <p><strong>Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment?.status)}`}>
                    {selectedAppointment?.status}
                  </span>
                </p>
                {selectedAppointment?.reason && <p><strong>Reason:</strong> {selectedAppointment.reason}</p>}
              </div>
              {selectedAppointment?.status === 'Pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => { updateAppointmentStatus(selectedAppointment?.id, 'Confirmed'); setShowModal(false); }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => { updateAppointmentStatus(selectedAppointment?.id, 'Rejected'); setShowModal(false); }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
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

export default DoctorAppointments;
