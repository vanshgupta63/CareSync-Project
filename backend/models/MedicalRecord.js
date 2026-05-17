import mongoose from 'mongoose';

const medicalRecordSchema = mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String },
  prescription: [{ 
    medicine: String, 
    dosage: String, 
    duration: String, 
    instructions: String 
  }],
  labResults: [{ name: String, value: String, unit: String, normalRange: String }],
  notes: { type: String },
  attachments: [{ name: String, url: String, type: String }],
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
