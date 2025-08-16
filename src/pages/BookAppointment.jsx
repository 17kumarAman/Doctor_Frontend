import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from "../context/AuthContext";

const BookAppointment = () => {
  const { API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    patient_age: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });


  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && formData.appointment_date) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, formData.appointment_date]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/allDoctors`);
      const data = await response.json();
      if (data.status) {
        setDoctors(data.data.filter((doctor) => doctor.status === 'Active'));
      } else {
        toast.error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Error fetching doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/available-slots/${selectedDoctor.id}/${formData.appointment_date}`
      );
      const data = await response.json();

      console.log('Full API Response:', data);

      // Check multiple possible data structures
      let slots = [];
      if (data.allSlots && Array.isArray(data.allSlots)) {
        slots = data.allSlots;
      } else if (data.data && data.data.allSlots && Array.isArray(data.data.allSlots)) {
        slots = data.data.allSlots;
      } else if (data.data && Array.isArray(data.data)) {
        slots = data.data;
      } else if (Array.isArray(data)) {
        slots = data;
      }

      console.log('Processed slots:', slots);
      setAvailableSlots(slots);

      if (slots.length === 0) {
        console.warn('No slots found in response');
        toast.info('No available slots for this date');
      }

    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
      toast.error('Error fetching available time slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: all fields required
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }
    if (!formData.patient_name.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    if (!formData.patient_age) {
      toast.error('Please select age');
      return;
    }
    if (!formData.patient_phone.trim()) {
      toast.error('Please enter mobile number');
      return;
    }
    if (!formData.patient_email.trim()) {
      toast.error('Please enter email');
      return;
    }
    if (!formData.appointment_date) {
      toast.error('Please select appointment date');
      return;
    }
    if (!formData.appointment_time) {
      toast.error('Please select appointment time');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('Please enter message');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        patient_name: formData.patient_name,
        patient_age: formData.patient_age,
        patient_email: formData.patient_email,
        patient_phone: formData.patient_phone,
        doctor_id: selectedDoctor.id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason,
        status: 'Pending'
      };
      const response = await fetch(`${API_BASE_URL}/api/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        toast.success(data.message || 'Appointment booked successfully!');
        // Clear form
        setFormData({
          patient_name: '',
          patient_age: '',
          patient_email: '',
          patient_phone: '',
          appointment_date: '',
          appointment_time: '',
          reason: ''
        });
        setSelectedDoctor(null);
        navigate('/contact-us');
      } else {
        toast.error(data.error || data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Error booking appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', timeString);
      return timeString;
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-4">
      <h2 className="text-3xl font-semibold text-green-900 text-center mb-2">Appointment</h2>
      <h3 className="text-2xl font-normal text-green-800 text-center mb-4">If You Have Any Query, Please Contact Us</h3>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-7xl mx-auto">
        {/* Left Illustration */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <img src="https://res.cloudinary.com/dknrega1a/image/upload/v1755272923/uploads/rput9xnctyvea5rguix6.jpg" alt="Doctor and patient" className="max-w-[420px] w-full h-auto" loading="lazy" />
        </div>
        {/* Right Form Card */}
        <div className="flex-1 w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* <p className="text-gray-700 text-base mb-4">
              Our dedicated team is here to provide expert care whenever you need it.<br />
              Schedule your appointment easily and get the support you deserve—your health is our priority.
            </p> */}
            {/* --- FORM STARTS --- */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ...existing code... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDoctor?.id || ''}
                    onChange={e => {
                      const doc = doctors.find(d => d.id == e.target.value);
                      setSelectedDoctor(doc || null);
                      setFormData({ ...formData, appointment_time: '' });
                    }}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.full_name}{` (${doc.qualification})`} — {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.appointment_date}
                    onChange={e => setFormData({ ...formData, appointment_date: e.target.value, appointment_time: '' })}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time Slot */}
                {formData.appointment_date && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots {formData?.appointment_time}</label>
                    {!selectedDoctor ? (
                      <div className="text-gray-400 text-sm py-2">Select Doctor to see slots</div>
                    ) : slotsLoading ? (
                      <div className="text-gray-400 text-sm py-2">Loading slots...</div>
                    ) : availableSlots.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {availableSlots.map((slot, idx) => {
                            const timeValue = slot.fullTime || slot.time || slot.slot_time || slot;
                            const status = slot.status || 'available';
                            const isAvailable = status === 'available';
                            const isSelected = formData.appointment_time === timeValue;
                            return (
                              <button
                                key={slot.id || timeValue || idx}
                                type="button"
                                onClick={() => isAvailable && setFormData({ ...formData, appointment_time: timeValue })}
                                disabled={!isAvailable}
                                className={`relative p-2 border rounded-md text-xs text-center transition-all duration-200 overflow-hidden
                                  ${isSelected
                                    ? 'border-green-500 bg-green-50 text-green-900 shadow-md'
                                    : isAvailable
                                      ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}
                                `}
                              >
                                {/* Large tick overlay for selected slot */}
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="none" viewBox="0 0 38 38">
                                      <circle cx="19" cy="19" r="18" fill="#22c55e" fillOpacity="0.15"/>
                                      <path d="M12 20.5l5 5 9-9" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                )}
                                <div className={`flex items-center justify-center gap-1 font-medium relative z-20 ${isSelected ? 'font-bold' : ''}`}>
                                  {formatTime(timeValue)}
                                </div>
                                {status === 'break' && <div className="text-xs text-red-500 mt-1 relative z-20">Break</div>}
                                {status === 'booked' && <div className="text-xs text-yellow-600 mt-1 relative z-20">Booked</div>}
                                {status === 'unavailable' && <div className="text-xs text-red-500 mt-1 relative z-20">Full</div>}
                                {isAvailable && <div className="text-xs text-green-600 mt-1 relative z-20">Available</div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm py-2">No available slots for this date</div>
                    )}
                  </div>
                )}

              </div>
              {/* Name and Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Name"
                    value={formData.patient_name}
                    onChange={e => setFormData({ ...formData, patient_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.patient_age}
                    onChange={e => setFormData({ ...formData, patient_age: e.target.value })}
                    required
                  >
                    <option value="">Select Age</option>
                    <option value="0-18">0-18</option>
                    <option value="19-30">19-30</option>
                    <option value="31-45">31-45</option>
                    <option value="46-60">46-60</option>
                    <option value="61+">61+</option>
                  </select>
                </div>
              </div>
              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Mobile</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Mobile"
                    value={formData.patient_phone}
                    onChange={e => setFormData({ ...formData, patient_phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Email"
                    value={formData.patient_email}
                    onChange={e => setFormData({ ...formData, patient_email: e.target.value })}
                  />
                </div>
              </div>

              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Message"
                rows={3}
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-gray-700 text-gray-900 py-2 rounded-md hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Booking...' : 'Book An Appointment'}
              </button>
            </form>
            {/* --- FORM ENDS --- */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;