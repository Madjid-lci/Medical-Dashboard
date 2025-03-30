import React from "react";
import "./apd.modal.css";

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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: Patient | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, selectedPatient }) => {
  if (!isOpen || !selectedPatient) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>

        {/*  ID Section with Unique Styling */}
        <div className="modal-header">
          <h2 className="patient-id">Patient ID: {selectedPatient.encounterId}</h2>
        </div>

        {/*  Patient Details */}
        <div className="modal-body">
          <div className="patient-detail">
            <span className="label">End Tidal CO2:</span>
            <span>{selectedPatient.end_tidal_co2 ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Feed Volume:</span>
            <span>{selectedPatient.feed_vol ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Feed Volume Administered:</span>
            <span>{selectedPatient.feed_vol_adm ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">FIO2:</span>
            <span>{selectedPatient.fio2 ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">FIO2 Ratio:</span>
            <span>{selectedPatient.fio2_ratio ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Inspiratory Time:</span>
            <span>{selectedPatient.insp_time ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Oxygen Flow Rate:</span>
            <span>{selectedPatient.oxygen_flow_rate ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">PEEP:</span>
            <span>{selectedPatient.peep ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">PIP:</span>
            <span>{selectedPatient.pip ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Respiratory Rate:</span>
            <span>{selectedPatient.resp_rate ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">SIP:</span>
            <span>{selectedPatient.sip ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Tidal Volume:</span>
            <span>{selectedPatient.tidal_vol ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Tidal Volume Actual:</span>
            <span>{selectedPatient.tidal_vol_actual ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Tidal Volume Kg:</span>
            <span>{selectedPatient.tidal_vol_kg ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">Tidal Volume Spon:</span>
            <span>{selectedPatient.tidal_vol_spon ?? "N/A"}</span>
          </div>
          <div className="patient-detail">
            <span className="label">BMI:</span>
            <span>{selectedPatient.bmi ?? "N/A"}</span>
          </div>

          {/*  Referral Section with Color Coding (Specific for Modal) */}
          <div className="patient-detail">
            <span className="label">Referral:</span>
            <span
              className={
                selectedPatient.referral === 1
                  ? "modal-need-referral"
                  : "modal-no-referral"
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

export default Modal;