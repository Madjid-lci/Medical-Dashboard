import React from "react"; // Import React
import "./modal.css"; // Import modal-specific CSS

// Define the Patient interface for type-checking patient data
interface Patient {
  encounterId: number;
  end_tidal_co2: number | null;
  feed_vol: number | null;
  feed_vol_adm: number | null;
  fio2: number | null;
  fio2_ratio: number | null;
  insp_time: number | null;
  oxygen_flow_rate: number | null;
  peep: number | null;
  pip: number | null;
  resp_rate: number | null;
  sip: number | null;
  tidal_vol: number | null;
  tidal_vol_actual: number | null;
  tidal_vol_kg: number | null;
  tidal_vol_spon: number | null;
  bmi: number | null;
  referral: number;
}

// Define props for the Modal component
interface ModalProps {
  isOpen: boolean;            // Whether the modal is visible
  onClose: () => void;        // Function to close the modal
  selectedPatient: Patient | null; // Patient data to display
}

// Modal component for displaying patient details
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, selectedPatient }) => {
  // If modal is closed or no patient is selected, render nothing
  if (!isOpen || !selectedPatient) return null;

  return (
    // Modal overlay listens for click to close modal
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal content stops propagation to prevent closing when clicked inside */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Button to close the modal */}
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>

        {/* ID Section with unique styling */}
        <div className="modal-header">
          <h2 className="patient-id">Patient ID: {selectedPatient.encounterId}</h2>
        </div>

        {/* Patient Details */}
        <div className="modal-body">
          {/* Display End Tidal CO2 value */}
          <div className="patient-detail">
            <span className="label">End Tidal CO2:</span>
            <span>{selectedPatient.end_tidal_co2 ?? "N/A"}</span>
          </div>
          {/* Display Feed Volume */}
          <div className="patient-detail">
            <span className="label">Feed Volume:</span>
            <span>{selectedPatient.feed_vol ?? "N/A"}</span>
          </div>
          {/* Display Feed Volume Administered */}
          <div className="patient-detail">
            <span className="label">Feed Volume Administered:</span>
            <span>{selectedPatient.feed_vol_adm ?? "N/A"}</span>
          </div>
          {/* Display FIO2 value */}
          <div className="patient-detail">
            <span className="label">FIO2:</span>
            <span>{selectedPatient.fio2 ?? "N/A"}</span>
          </div>
          {/* Display FIO2 Ratio */}
          <div className="patient-detail">
            <span className="label">FIO2 Ratio:</span>
            <span>{selectedPatient.fio2_ratio ?? "N/A"}</span>
          </div>
          {/* Display Inspiratory Time */}
          <div className="patient-detail">
            <span className="label">Inspiratory Time:</span>
            <span>{selectedPatient.insp_time ?? "N/A"}</span>
          </div>
          {/* Display Oxygen Flow Rate */}
          <div className="patient-detail">
            <span className="label">Oxygen Flow Rate:</span>
            <span>{selectedPatient.oxygen_flow_rate ?? "N/A"}</span>
          </div>
          {/* Display PEEP */}
          <div className="patient-detail">
            <span className="label">PEEP:</span>
            <span>{selectedPatient.peep ?? "N/A"}</span>
          </div>
          {/* Display PIP */}
          <div className="patient-detail">
            <span className="label">PIP:</span>
            <span>{selectedPatient.pip ?? "N/A"}</span>
          </div>
          {/* Display Respiratory Rate */}
          <div className="patient-detail">
            <span className="label">Respiratory Rate:</span>
            <span>{selectedPatient.resp_rate ?? "N/A"}</span>
          </div>
          {/* Display SIP */}
          <div className="patient-detail">
            <span className="label">SIP:</span>
            <span>{selectedPatient.sip ?? "N/A"}</span>
          </div>
          {/* Display Tidal Volume */}
          <div className="patient-detail">
            <span className="label">Tidal Volume:</span>
            <span>{selectedPatient.tidal_vol ?? "N/A"}</span>
          </div>
          {/* Display Tidal Volume Actual */}
          <div className="patient-detail">
            <span className="label">Tidal Volume Actual:</span>
            <span>{selectedPatient.tidal_vol_actual ?? "N/A"}</span>
          </div>
          {/* Display Tidal Volume Kg */}
          <div className="patient-detail">
            <span className="label">Tidal Volume Kg:</span>
            <span>{selectedPatient.tidal_vol_kg ?? "N/A"}</span>
          </div>
          {/* Display Tidal Volume Spon */}
          <div className="patient-detail">
            <span className="label">Tidal Volume Spon:</span>
            <span>{selectedPatient.tidal_vol_spon ?? "N/A"}</span>
          </div>
          {/* Display BMI */}
          <div className="patient-detail">
            <span className="label">BMI:</span>
            <span>{selectedPatient.bmi ?? "N/A"}</span>
          </div>

          {/* Referral Section with color coding */}
          <div className="patient-detail">
            <span className="label">Referral:</span>
            <span
              className={
                selectedPatient.referral === 1
                  ? "modal-need-referral" // Apply style if referral is needed
                  : "modal-no-referral"  // Apply style if referral is not needed
              }
            >
              {selectedPatient.referral === 1 ? "Needs Referral" : "No Referral Needed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; // Export the Modal component