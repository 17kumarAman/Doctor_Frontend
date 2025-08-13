# Medical System Frontend

A modern React-based frontend for a medical system with admin and doctor management capabilities.

## Features

### 🔐 Authentication
- **Dual Login System**: Support for both Admin and Doctor login
- **State Management**: React Context for authentication state
- **Profile Dropdown**: User profile with logout functionality
- **Protected Routes**: Secure access to admin-only pages

### 🎨 UI/UX
- **Modern Design**: Clean, responsive design with Tailwind CSS
- **Sidebar Navigation**: Collapsible sidebar with role-based menu items
- **Responsive Layout**: Mobile-friendly design
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: User feedback for actions

### 👨‍⚕️ Doctor Management
- **Doctor Listing**: Paginated table with search functionality
- **Add/Edit Doctors**: Comprehensive form for doctor information
- **Action Menu**: 3-dot menu with edit and delete options
- **Status Indicators**: Visual status badges for doctors
- **Search & Filter**: Real-time search across multiple fields

### 📧 Enquiry Management
- **Enquiry Listing**: View all contact form submissions
- **Search Functionality**: Search by name, email, subject, or message
- **Pagination**: Navigate through large datasets
- **Date Formatting**: Human-readable timestamps

### 📊 Dashboard
- **Statistics Cards**: Overview of key metrics
- **Recent Activity**: Latest enquiries and doctors
- **Visual Indicators**: Icons and color-coded status

### 🧭 Navigation
- **Role-based Sidebar**: Different menus for admin and doctor users
- **Active State**: Visual indication of current page
- **Mobile Responsive**: Collapsible sidebar on mobile devices

## Tech Stack

- **React 19**: Latest React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client for API calls
- **React Toastify**: Toast notifications
- **Context API**: State management

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open `http://localhost:5173` in your browser
   - Navigate to `/login` to access the login page
   - Use admin credentials to access the dashboard

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar
│   └── ProtectedRoute.jsx   # Route protection
├── context/
│   └── AuthContext.jsx      # Authentication state
├── pages/
│   ├── AdminDashBoard.jsx   # Admin dashboard
│   ├── Contact.jsx          # Contact form
│   ├── DoctorForm.jsx       # Add/Edit doctor
│   ├── DoctorPage.jsx       # Doctor management
│   ├── Enquiries.jsx        # Enquiry management
│   └── Login.jsx            # Login page
├── App.jsx                  # Main app component
├── Navbar.jsx              # Top navigation
└── main.jsx                # App entry point
```

## Features Overview

### Admin Features
- ✅ Dashboard with statistics
- ✅ Doctor management (CRUD operations)
- ✅ Enquiry management with search
- ✅ User authentication and logout
- ✅ Responsive sidebar navigation

### Doctor Features
- ✅ Doctor-specific dashboard
- ✅ Profile management
- ✅ Appointment management (planned)

### General Features
- ✅ Modern, responsive UI
- ✅ Search and pagination
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Click-outside handlers for dropdowns

## API Integration

The frontend integrates with the backend API endpoints:
- `POST /api/admin/login` - Admin authentication
- `POST /api/doctor/login` - Doctor authentication
- `GET /api/allDoctors` - Fetch all doctors
- `POST /api/createDoctor` - Create new doctor
- `PUT /api/updateDoctor/:id` - Update doctor
- `DELETE /api/deleteDoctor/:id` - Delete doctor
- `GET /api/contact` - Fetch enquiries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
