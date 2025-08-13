import { Calendar, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const DoctorAvailability = () => {
  const { user, API_BASE_URL } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    // available_date acts as start date when creating range
    available_date: '',
    end_date: '', // use only when creating (range)
    start_time: '',
    end_time: '',
    break_start: '',
    break_end: ''
  });


  const timeSlots = [
    '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45',
    '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45',
    '17:00', '17:15', '17:30', '17:45',
    '18:00', '18:15', '18:30', '18:45',
    '19:00', '19:15', '19:30', '19:45',
    '20:00'
  ];

  useEffect(() => {
    if (user?.id) {
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/getDoctorAvailability/${user.id}`);
      const data = await response.json();

      if (data.status) {
        setSchedules(data.data);
      } else {
        toast.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Error fetching schedules');
    } finally {
      setLoading(false);
    }
  };

  // helper to format HH:MM -> HH:MM:SS for API
  const formatTimeForAPI = (t) => (t && t.length === 5 ? `${t}:00` : t || null);

  // helper to display time (HH:MM:SS or HH:MM)
  const formatTime = (t) => {
    if (!t) return '';
    const timeOnly = t.length >= 5 ? t.slice(0, 5) : t;
    return new Date(`2000-01-01T${timeOnly}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // build array of YYYY-MM-DD between start and end inclusive
  const getDatesInRange = (startStr, endStr) => {
    const dates = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // produce YYYY-MM-DD
      const iso = new Date(d).toISOString().split('T')[0];
      dates.push(iso);
    }
    return dates;
  };

  const isTimeRangeValid = (start, end) => {
    if (!start || !end) return false;
    const a = new Date(`2000-01-01T${start}`);
    const b = new Date(`2000-01-01T${end}`);
    return a < b;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    // validations
    if (!formData.available_date) {
      toast.error('Please select start date');
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      toast.error('Please select start and end time');
      return;
    }
    if (!isTimeRangeValid(formData.start_time, formData.end_time)) {
      toast.error('Start time must be before end time');
      return;
    }

    setSubmitting(true);

    // Editing single schedule
    if (editingSchedule) {
      const payload = {
        doctor_id: user.id,
        available_date: formData.available_date,
        start_time: formatTimeForAPI(formData.start_time),
        end_time: formatTimeForAPI(formData.end_time),
        break_start: formData.break_start ? formatTimeForAPI(formData.break_start) : null,
        break_end: formData.break_end ? formatTimeForAPI(formData.break_end) : null
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/updateSchedule/${editingSchedule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Schedule updated');
          setShowForm(false);
          setEditingSchedule(null);
          resetForm();
          fetchSchedules();
        } else {
          // backend might return error message in data.error
          toast.error(data?.error || data?.message || 'Failed to update schedule');
        }
      } catch (err) {
        console.error('Error updating schedule:', err);
        toast.error('Error updating schedule');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Creating - possibly multiple dates in range
    const startDate = formData.available_date;
    // if end_date empty, create for single date
    const endDate = formData.end_date && formData.end_date.trim() !== '' ? formData.end_date : startDate;

    // validate end date >= start date
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date');
      setSubmitting(false);
      return;
    }

    const dates = getDatesInRange(startDate, endDate);

    const successes = [];
    const failures = [];

    // sequential loop (safer for DB)
    for (const date of dates) {
      const payload = {
        doctor_id: user.id,
        available_date: date,
        start_time: formatTimeForAPI(formData.start_time),
        end_time: formatTimeForAPI(formData.end_time),
        break_start: formData.break_start ? formatTimeForAPI(formData.break_start) : null,
        break_end: formData.break_end ? formatTimeForAPI(formData.break_end) : null
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/createNewSchedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          // backend returns created object (201)
          successes.push(date);
        } else {
          const errJson = await res.json().catch(() => ({}));
          const msg = errJson?.error || errJson?.message || res.statusText || `Status ${res.status}`;
          failures.push({ date, message: msg });
        }
      } catch (err) {
        console.error('Create error for', date, err);
        failures.push({ date, message: err.message || 'Network error' });
      }
    }

    // summarize
    if (successes.length > 0) {
      toast.success(`Created ${successes.length} schedule(s)`);
    }
    if (failures.length > 0) {
      // show first 3 failures in toast to avoid too long message
      const short = failures.slice(0, 3).map(f => `${f.date}: ${f.message}`).join('; ');
      const more = failures.length > 3 ? ` (+${failures.length - 3} more)` : '';
      toast.error(`Failed for ${failures.length} date(s): ${short}${more}`);
    }

    // close and refresh if any success; keep modal open so user can fix others? we'll close if at least 1 success
    if (successes.length > 0) {
      setShowForm(false);
      resetForm();
      fetchSchedules();
    }
    setSubmitting(false);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      available_date: schedule.available_date,
      end_date: '',
      start_time: schedule.start_time?.slice(0, 5) || '',
      end_time: schedule.end_time?.slice(0, 5) || '',
      break_start: schedule.break_start?.slice(0, 5) || '',
      break_end: schedule.break_end?.slice(0, 5) || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/deleteSchedule/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Schedule deleted');
        fetchSchedules();
      } else {
        toast.error(data?.error || data?.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Could not delete schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      available_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      break_start: '',
      break_end: ''
    });
  };

  const handleCancel = () => {
    if (submitting) return; // prevent closing while submitting
    setShowForm(false);
    setEditingSchedule(null);
    resetForm();
  };


  // Pagination Logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = schedules.slice(indexOfFirstAppointment, indexOfLastAppointment);

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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Availability</h1>
          <p className="text-gray-600">Set your available working dates</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSchedule(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {schedules.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-600">Add your working schedule to start receiving appointments.</p>
          </div>
        ) : (
          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAppointments.map((schedule, index) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1 + (currentPage - 1) * appointmentsPerPage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{formatDate(schedule.available_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{formatTime(schedule.start_time)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{formatTime(schedule.end_time)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {schedule.break_start && schedule.break_end
                      ? `${formatTime(schedule.break_start)} - ${formatTime(schedule.break_end)}`
                      : 'No Break'}
                  </td>
                  <td className="px-6  space-x-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className=" text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className=" text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}

      {schedules.length > appointmentsPerPage && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex shadow-sm">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
            >
              Previous
            </button>

            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white">
              Page {currentPage} of {Math.ceil(schedules.length / appointmentsPerPage)}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage * appointmentsPerPage >= schedules.length}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}


      {/* Popup Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              disabled={submitting}
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule (Date Range supported)'}
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date or Date Range */}
                {editingSchedule ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.available_date ? formData.available_date.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, available_date: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 bg-gray-50"
                      required
                      disabled
                    />
                  </div>

                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.available_date}
                        onChange={(e) => setFormData({ ...formData, available_date: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
                        disabled={submitting}
                      />
                    </div>
                  </>
                )}

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <select
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                    disabled={submitting}
                  >
                    <option value="">Select start time</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{formatTime(`${t}:00`)}</option>
                    ))}
                  </select>
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <select
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                    disabled={submitting}
                  >
                    <option value="">Select end time</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{formatTime(`${t}:00`)}</option>
                    ))}
                  </select>
                </div>

                {/* Break Start */}
                <div>
                  <label className="block text-sm font-medium mb-1">Break Start</label>
                  <select
                    value={formData.break_start}
                    onChange={(e) => setFormData({ ...formData, break_start: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    disabled={submitting}
                  >
                    <option value="">No break</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{formatTime(`${t}:00`)}</option>
                    ))}
                  </select>
                </div>

                {/* Break End */}
                <div>
                  <label className="block text-sm font-medium mb-1">Break End</label>
                  <select
                    value={formData.break_end}
                    onChange={(e) => setFormData({ ...formData, break_end: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    disabled={submitting}
                  >
                    <option value="">No break</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{formatTime(`${t}:00`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  <Save className="h-4 w-4" />
                  <span>{submitting ? 'Saving...' : (editingSchedule ? 'Update' : 'Save')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability;
