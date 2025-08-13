# Doctor Appointment Booking System - Frontend

## 🏥 Overview

A comprehensive appointment booking system with separate interfaces for:
- **Patients**: Book appointments with doctors
- **Doctors**: Manage appointments and availability
- **Admins**: Oversee all appointments and system management

## ✨ Features

### For Patients
- ✅ Browse available doctors
- ✅ View doctor specializations and consultation fees
- ✅ Select appointment dates and available time slots
- ✅ Real-time slot availability checking
- ✅ 15-minute appointment intervals
- ✅ Maximum 4 appointments per hour per doctor
- ✅ Form validation and error handling

### For Doctors
- ✅ View all appointments with filtering options
- ✅ Accept/Reject pending appointments
- ✅ Set working hours and availability schedules
- ✅ Manage break times
- ✅ View appointment details and patient information
- ✅ Status-based appointment management

### For Admins
- ✅ Comprehensive appointment overview with statistics
- ✅ Filter appointments by status, doctor, date
- ✅ Search patients by name, email, phone
- ✅ Manage all appointments (confirm, reject, delete)
- ✅ View detailed appointment information
- ✅ Real-time appointment statistics

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Backend server running on `http://localhost:3000`

### Installation

1. **Install dependencies:**
```bash
cd FrontTest
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
```
http://localhost:5173
```

## 📱 User Interfaces

### Public Interface (Patients)
- **URL**: `http://localhost:5173/contact-us`
- **Features**:
  - Contact form
  - Book appointment link
  - Doctor information

- **Appointment Booking**: `http://localhost:5173/book-appointment`
  - Select doctor
  - Choose date and time slot
  - Fill patient information
  - Submit booking

### Doctor Interface
- **Login**: `http://localhost:5173/login` (select doctor login)
- **Dashboard**: Overview and quick actions
- **My Appointments**: `/appointments`
  - View all appointments
  - Filter by status and date
  - Accept/Reject pending appointments
  - View appointment details

- **My Availability**: `/availability`
  - Set working hours for each day
  - Configure break times
  - Manage schedule

### Admin Interface
- **Login**: `http://localhost:5173/login` (select admin login)
- **Dashboard**: System overview
- **Appointment Management**: `/appointments`
  - View all appointments
  - Advanced filtering and search
  - Manage appointment status
  - Delete appointments

## 🎯 Key Features Explained

### 1. Slot Management System
- **15-minute intervals**: Appointments can only be booked at 00, 15, 30, 45 minutes
- **4 appointments per hour**: Maximum limit enforced per doctor per hour
- **Real-time availability**: Shows only available slots
- **Break time handling**: Automatically excludes break times from available slots

### 2. Doctor Availability
- **Day-wise scheduling**: Set different hours for each day of the week
- **Break time configuration**: Optional break periods
- **Time validation**: Ensures start time is before end time
- **Schedule management**: Add, edit, delete schedules

### 3. Appointment Status Management
- **Pending**: New appointments awaiting doctor approval
- **Confirmed**: Approved by doctor
- **Rejected**: Declined by doctor
- **Cancelled**: Cancelled appointments

### 4. Advanced Filtering
- **Status-based**: Filter by appointment status
- **Date-based**: Filter by specific dates
- **Doctor-based**: Filter by specific doctors (admin only)
- **Search**: Find patients by name, email, or phone

## 🔧 Technical Implementation

### Frontend Technologies
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **React Toastify**: Toast notifications
- **Axios**: HTTP client for API calls

### State Management
- **React Context**: Authentication and user state
- **Local Storage**: Persistent login state
- **React Hooks**: Component state management

### API Integration
- **RESTful APIs**: Backend communication
- **Error Handling**: Comprehensive error management
- **Loading States**: User feedback during API calls
- **Real-time Updates**: Immediate UI updates after actions

## 📊 Data Flow

### Appointment Booking Flow
1. Patient selects doctor
2. Chooses appointment date
3. System fetches available slots
4. Patient selects time slot
5. Fills patient information
6. Submits booking
7. System validates and creates appointment

### Doctor Management Flow
1. Doctor logs in
2. Views appointments dashboard
3. Filters appointments as needed
4. Accepts/Rejects pending appointments
5. Manages availability schedules

### Admin Oversight Flow
1. Admin logs in
2. Views comprehensive appointment overview
3. Uses advanced filtering and search
4. Manages appointments and system

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Touch-friendly**: Easy interaction on mobile devices
- **Accessible**: Proper ARIA labels and keyboard navigation

### User Experience
- **Loading states**: Visual feedback during operations
- **Error handling**: Clear error messages
- **Success notifications**: Confirmation of successful actions
- **Form validation**: Real-time validation feedback

### Visual Design
- **Clean interface**: Modern, professional design
- **Color coding**: Status-based color indicators
- **Icons**: Intuitive iconography
- **Typography**: Readable and accessible text

## 🔒 Security Features

### Authentication
- **Role-based access**: Different interfaces for different user types
- **Protected routes**: Secure access to sensitive pages
- **Session management**: Persistent login state

### Data Validation
- **Frontend validation**: Real-time form validation
- **Backend validation**: Server-side validation
- **Input sanitization**: Clean data handling

## 📱 Mobile Responsiveness

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- **Touch-friendly buttons**: Large touch targets
- **Swipe gestures**: Intuitive navigation
- **Optimized forms**: Mobile-friendly input fields

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Vercel Deployment
The project includes `vercel.json` for easy deployment on Vercel.

## 🔧 Configuration

### API Base URL
Update the API base URL in components:
```javascript
const API_BASE_URL = 'http://localhost:3000/api/doctors';
```

### Backend Requirements
Ensure the backend provides these endpoints:
- `GET /api/doctors/allDoctors`
- `GET /api/doctors/appointments/available-slots/:doctor_id/:date`
- `POST /api/doctors/appointments`
- `GET /api/doctors/appointments/doctor/:doctor_id`
- `PUT /api/doctors/appointments/:id`
- `DELETE /api/doctors/appointments/:id`
- `POST /api/doctors/createDoctorAvailability`
- `GET /api/doctors/getDoctorAvailability/:doctor_id`
- `PUT /api/doctors/updateDoctorAvailability/:id`
- `DELETE /api/doctors/deleteDoctorAvailability/:id`

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend server is running
   - Check API base URL configuration
   - Verify CORS settings

2. **Slot Availability Issues**
   - Check doctor availability schedules
   - Verify date format (YYYY-MM-DD)
   - Ensure time format (HH:MM)

3. **Authentication Issues**
   - Clear browser cache
   - Check localStorage for user data
   - Verify login credentials

### Debug Mode
Enable debug logging:
```javascript
console.log('Debug:', data);
```

## 📈 Future Enhancements

### Planned Features
- **Email notifications**: Appointment confirmations
- **SMS reminders**: Appointment reminders
- **Calendar integration**: Google/Outlook calendar sync
- **Video consultations**: Telemedicine features
- **Payment integration**: Online payment processing
- **Patient portal**: Patient account management

### Technical Improvements
- **PWA support**: Progressive web app features
- **Offline support**: Service worker implementation
- **Performance optimization**: Code splitting and lazy loading
- **Testing**: Unit and integration tests

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use consistent formatting
- Follow React best practices
- Add proper comments
- Include error handling

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for better healthcare management** 