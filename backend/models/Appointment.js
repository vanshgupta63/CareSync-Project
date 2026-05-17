import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['in-person', 'video'], default: 'in-person' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  reason: { type: String },
  notes: { type: String },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
