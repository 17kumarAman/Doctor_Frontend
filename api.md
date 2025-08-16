# API Documentation

All API endpoints are relative to your `API_BASE_URL`, e.g. `${API_BASE_URL}/api/...`

---

## Contact APIs

### 1. Get All Contacts

- **GET** `/api/contact`
- **Params:** None
- **Query:** None
- **Payload:** None

### 2. Submit Contact Form

- **POST** `/api/contact`
- **Payload:**
  ```json
  {
    "name": string,
    "email": string,
    "subject": string,
    "message": string
  }
  ```

---

## Doctor APIs

### 1. Get All Doctors

- **GET** `/api/allDoctors`
- **Params:** None
- **Query:** None
- **Payload:** None

### 2. Get Doctor By ID

- **GET** `/api/doctor/{doctorId}`
- **Params:**
  - `doctorId`: Doctor's ID
- **Query:** None
- **Payload:** None

### 3. Create Doctor

- **POST** `/api/createDoctor`
- **Payload:**
  ```json
  {
    "full_name": string,
    "email": string,
    "password": string,
    "phone": string,
    "gender": string,
    "dob": string (YYYY-MM-DD),
    "specialization": string,
    "qualification": string,
    "experience_years": string,
    "bio": string,
    "consultation_fee": string,
    "available_days": string,
    "available_time": string,
    "created_by": string,
    "status": string
  }
  ```

### 4. Update Doctor

- **PUT** `/api/updateDoctor/{doctorId}`
- **Params:**
  - `doctorId`: Doctor's ID
- **Payload:** (same as Create Doctor, password optional)

### 5. Delete Doctor

- **DELETE** `/api/deleteDoctor/{doctorId}`
- **Params:**
  - `doctorId`: Doctor's ID

---

## Appointment APIs

### 1. Get All Appointments (Admin)

- **GET** `/api/appointments`

### 2. Get Appointments for Doctor

- **GET** `/api/appointments/doctor/{doctorId}`
- **Params:**
  - `doctorId`: Doctor's ID

### 3. Book Appointment

- **POST** `/api/book`
- **Payload:**
  ```json
  {
    "patient_name": string,
    "patient_email": string,
    "patient_phone": string,
    "appointment_date": string (YYYY-MM-DD),
    "appointment_time": string (HH:MM),
    "reason": string,
    "doctor_id": string
  }
  ```

### 4. Update Appointment Status

- **PUT** `/api/appointments/{appointmentId}`
- **Params:**
  - `appointmentId`: Appointment ID
- **Payload:**
  ```json
  {
    "status": string
  }
  ```

### 5. Delete Appointment

- **DELETE** `/api/appointments/{appointmentId}`
- **Params:**
  - `appointmentId`: Appointment ID

---

## Doctor Availability (Schedule) APIs

### 1. Get Doctor Availability

- **GET** `/api/getDoctorAvailability/{doctorId}`
- **Params:**
  - `doctorId`: Doctor's ID

### 2. Create New Schedule

- **POST** `/api/createNewSchedule`
- **Payload:**
  ```json
  {
    "doctor_id": string,
    "available_date": string (YYYY-MM-DD),
    "start_time": string (HH:MM:SS),
    "end_time": string (HH:MM:SS),
    "break_start": string (HH:MM:SS | null),
    "break_end": string (HH:MM:SS | null)
  }
  ```

### 3. Update Schedule

- **PUT** `/api/updateSchedule/{scheduleId}`
- **Params:**
  - `scheduleId`: Schedule ID
- **Payload:** (same as Create New Schedule)

### 4. Delete Schedule

- **DELETE** `/api/deleteSchedule/{scheduleId}`
- **Params:**
  - `scheduleId`: Schedule ID

---

## Slot APIs

### 1. Get Available Slots for Doctor

- **GET** `/api/available-slots/{doctorId}/{date}`
- **Params:**
  - `doctorId`: Doctor's ID
  - `date`: Date (YYYY-MM-DD)

---

## File Upload API

### 1. Upload Image

- **POST** `/api/upload`
- **Payload:**
  - FormData: `{ image: File }`

---

## Admin APIs

### 1. Get Admin By ID

- **GET** `/api/admin/getAdmin/{adminId}`
- **Params:**
  - `adminId`: Admin's ID

### 2. Update Admin

- **PUT** `/api/admin/updateAdmin/{adminId}`
- **Params:**
  - `adminId`: Admin's ID
- **Payload:**
  ```json
  {
    "name": string,
    "email": string,
    "phone": string,
    "profile_image": string,
    "password": string (optional)
  }
  ```

### 3. Register Admin

- **POST** `/api/admin/register`
- **Payload:**
  ```json
  {
    "name": string,
    "email": string,
    "phone": string,
    "password": string
  }
  ```

---

_Note: All endpoints may require authentication headers as per your backend requirements._
