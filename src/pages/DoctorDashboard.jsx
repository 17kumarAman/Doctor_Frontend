import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const DoctorDashboard = () => {
  const { user, API_BASE_URL } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/appointments/doctor/${user.id}`);
      const data = await res.json();

      if (data.status) {
        setAppointments(data.data);
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Availability
  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/getDoctorAvailability/${user.id}`);
      const data = await res.json();

      if (data.status) {
        setSchedules(data.data);
      } else {
        toast.error("Failed to fetch schedules");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching schedules");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchSchedules();
  }, []);

  // Stats
  const today = new Date().toISOString().split('T')[0];
  // console.log(today);

  const todaysAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.appointment_date).toISOString().split('T')[0];
    console.log(appointmentDate, today);
    return appointmentDate === today;
  });


  const confirmedCount = appointments.filter((apt) => apt.status === "Confirmed").length;
  const pendingCount = appointments.filter((apt) => apt.status === "Pending").length;


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

  return (
    <div className="flex min-h-screen ">


      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">
          Welcome, Dr. {user?.full_name || "Unknown"}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold">Today’s Appointments</h2>
            <p className="text-3xl font-bold text-blue-500">{todaysAppointments.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold">Confirmed</h2>
            <p className="text-3xl font-bold text-green-500">{confirmedCount}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold">Pending</h2>
            <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <TableCard
            title="Recent schedules"
            data={schedules}
            onViewAll={() => navigate("/availability")}
            columns={[
              {
                header: "Date",
                render: (d) => (
                  d.available_date
                ),
              },
              {
                header: "Start Time",
                render: (d) => (
                  d.start_time
                ),
              },
              {
                header: "End Time",
                render: (d) => (
                  d.end_time
                ),
              },
              {
                header: "Break Start",
                render: (d) => (
                  d.break_start
                ),
              },
              {
                header: "Break End",
                render: (d) => (
                  d.break_end
                ),
              },
            ]}
          />

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
                        {c.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {c.patient_phone}
                      </div>
                    </div>
                  </div>
                )
              },

              {
                header: "Date",
                render: (c) => (
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

        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
