import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// Patient books an appointment
export const createAppointment = async (req, res) => {
  const { doctorId, date, time, type, reason } = req.body;
  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
      type,
      reason,
    });
    const populated = await appointment.populate(['patient', 'doctor']);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointments for logged-in user (patient or doctor)
export const getMyAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'patient'
      ? { patient: req.user._id }
      : { doctor: req.user._id };
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor updates appointment status
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments (admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
