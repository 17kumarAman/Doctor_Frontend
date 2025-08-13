import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
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

    // Validation
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    if (!formData.patient_name.trim()) {
      toast.error('Please enter patient name');
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

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          patient_email: formData.patient_email || null,
          patient_phone: formData.patient_phone || null,
          doctor_id: selectedDoctor.id,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          reason: formData.reason || null
        }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        toast.success(data.message || 'Appointment booked successfully!');
        // Clear form
        setFormData({
          patient_name: '',
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/contact-us')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contact
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Select a doctor and book your appointment</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Doctors Selection */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-lg shadow-sm h-fit">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Select Doctor
                  {selectedDoctor && (
                    <span className="ml-auto text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </h2>
              </div>

              <div className="p-4">
                {doctors.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No doctors available</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${selectedDoctor?.id === doctor.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedDoctor?.id === doctor.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                            <User className={`h-4 w-4 ${selectedDoctor?.id === doctor.id ? 'text-blue-600' : 'text-gray-500'
                              }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm truncate">{doctor.full_name}</h3>
                            <p className="text-xs text-gray-600 truncate">{doctor.specialization}</p>
                            {doctor.consultation_fee && (
                              <p className="text-xs text-green-600 font-medium">₹{doctor.consultation_fee}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Appointment Details
                </h2>
              </div>

              <div className="p-4">
                {!selectedDoctor ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Please select a doctor first</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selected Doctor Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedDoctor.full_name}</h3>
                          <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                          {selectedDoctor.consultation_fee && (
                            <p className="text-sm text-green-600 font-medium">Fee: ₹{selectedDoctor.consultation_fee}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.patient_name}
                          onChange={(e) =>
                            setFormData({ ...formData, patient_name: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.patient_email}
                          onChange={(e) =>
                            setFormData({ ...formData, patient_email: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.patient_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, patient_phone: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Date *
                        </label>
                        <input
                          type="date"
                          value={formData.appointment_date}
                          onChange={(e) =>
                            setFormData({ ...formData, appointment_date: e.target.value })
                          }
                          min={getMinDate()}
                          max={getMaxDate()}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Time Slots */}
                    {formData.appointment_date && selectedDoctor && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Available Time Slots *
                          {formData.appointment_time && (
                            <span className="text-sm font-normal text-blue-600 ml-2">
                              (Selected: {formatTime(formData.appointment_time)})
                            </span>
                          )}
                        </label>

                        {slotsLoading ? (
                          <div className="text-center py-8">
                            <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2 animate-spin" />
                            <p className="text-gray-600">Loading available slots...</p>
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {availableSlots.map((slot, index) => {
                                const timeValue = slot.fullTime || slot.time || slot.slot_time || slot;
                                const status = slot.status || 'available';
                                const isAvailable = status === 'available';
                                const isSelected = formData.appointment_time === timeValue;

                                return (
                                  <button
                                    key={slot.id || timeValue || index}
                                    type="button"
                                    onClick={() => {
                                      if (isAvailable) {
                                        setFormData({ ...formData, appointment_time: timeValue });
                                      }
                                    }}
                                    disabled={!isAvailable}
                                    className={`p-2 border rounded-md text-xs text-center transition-all duration-200 ${isSelected
                                        ? 'border-blue-500 bg-blue-500 text-white shadow-md transform scale-105'
                                        : isAvailable
                                          ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                  >
                                    <div className="font-medium">
                                      {formatTime(timeValue)}
                                    </div>
                                    {status === 'break' && (
                                      <div className="text-xs text-red-500 mt-1">Break</div>
                                    )}
                                    {status === 'booked' && (
                                      <div className="text-xs text-yellow-600 mt-1">Booked</div>
                                    )}
                                    {status === 'unavailable' && (
                                      <div className="text-xs text-red-500 mt-1">Full</div>
                                    )}
                                    {isAvailable && (
                                      <div className="text-xs text-green-600 mt-1">Available</div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-gray-200 rounded-lg">
                            <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-600">No available slots for this date</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Visit
                      </label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData({ ...formData, reason: e.target.value })
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please describe your symptoms or reason for visit..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading || !selectedDoctor || !formData.appointment_time || !formData.patient_name.trim()}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Booking...
                          </div>
                        ) : (
                          'Book Appointment'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;