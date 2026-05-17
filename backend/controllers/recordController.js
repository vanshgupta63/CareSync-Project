import MedicalRecord from '../models/MedicalRecord.js';

// Doctor creates/adds record
export const createRecord = async (req, res) => {
  const { patientId, diagnosis, prescription, notes, appointmentId } = req.body;
  try {
    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId,
      diagnosis,
      prescription,
      notes,
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient views own records
export const getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor views a patient's records
export const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
