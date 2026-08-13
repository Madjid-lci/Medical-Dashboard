#  AI-Powered Clinical Decision Support Dashboard

An **AI-powered Clinical Decision Support System (CDSS)** designed to assist healthcare professionals in identifying and prioritising patients in Critical Care Units (CCUs) who may require a **dietitian referral**.

The application combines **machine learning, patient data processing, interactive visualisations, and a cross-platform dashboard** to support faster and more consistent clinical decision-making.

> **Academic Group Project — UWE Bristol**
> Systems Development (UFCF7S-30-2)

---

##  Project Overview

Nutritional care is an important part of patient recovery in Critical Care Units. However, traditional referral processes can involve manually reviewing patient information distributed across different systems.

This project explores how **machine learning and clinical data visualisation** can support this process.

The dashboard allows healthcare professionals to:

* Upload patient datasets using CSV files
* Automatically process and validate patient data
* Predict whether patients may require dietitian referral
* Search and filter patient records
* View referral predictions and patient metrics
* Analyse patient data through interactive charts
* Export reports as **PDF or PNG**
* Use the application across **Windows, macOS, and Linux**

---

##  Machine Learning

The system uses supervised machine learning to classify patients into:

* **Needs Referral**
* **No Referral Needed**

Two machine-learning approaches were evaluated:

| Model             |   Accuracy |
| ----------------- | ---------: |
| **Random Forest** | **82.84%** |
| XGBoost           |     75.12% |

The final application uses a **Random Forest classifier**.

Although XGBoost demonstrated advantages in identifying some referral cases, Random Forest was selected because of its overall accuracy, stability, interpretability, and higher precision, helping reduce unnecessary referrals and clinical workload.

### Model Features

The model focuses on four physiological features:

* Feed Volume
* Oxygen Flow Rate
* Respiratory Rate
* BMI

These features are used to predict whether a patient should be prioritised for dietitian assessment.

---

##  Key Features

###  CSV Patient Data Upload

Upload patient datasets directly into the application. The backend validates and processes the data before making it available to the dashboard.

###  AI Referral Prediction

Patient information is processed by the trained Random Forest model to automatically generate referral predictions.

###  Patient Management

View all patients or filter records based on referral status and other patient attributes.

###  Real-Time Search & Filtering

Search and filter patient records dynamically without manually navigating large datasets.

###  Data Visualisation

Interactive graphs and charts help clinicians understand patient metrics and referral distributions.

###  Report Export

Dashboard reports and visualisations can be exported as **PDF and PNG** for documentation or further analysis.

###  Cross-Platform Desktop Application

Electron enables the dashboard to operate across:

* Windows
* macOS
* Linux

---

##  Technology Stack

### Frontend

* React.js
* Electron.js
* JavaScript
* HTML
* CSS
* Chart.js
* D3.js

### Backend

* Python
* Flask
* Pandas
* NumPy

### Machine Learning

* Scikit-learn
* Random Forest
* XGBoost

### Development & Design

* Git / GitHub
* Figma

---

##  Project Architecture

```text
Medical-Dashboard/
│
├── frontend/
│   └── User interface and dashboard components
│
├── backend/
│   └── Flask API, CSV processing and data handling
│
├── ml_model/
│   └── Machine-learning model and prediction logic
│
└── README.md
```

### Application Flow

```text
Patient CSV
     │
     ▼
CSV Validation & Processing
     │
     ▼
Flask Backend API
     │
     ▼
Machine Learning Model
     │
     ▼
Referral Prediction
     │
     ▼
React / Electron Dashboard
     │
     ├── Patient Records
     ├── Search & Filtering
     ├── Referral Status
     ├── Data Visualisations
     └── PDF / PNG Reports
```

---

##  Model Development

The machine-learning pipeline involved:

1. Loading patient data
2. Cleaning and validating the dataset
3. Selecting relevant physiological features
4. Preprocessing the data
5. Training classification models
6. Comparing Random Forest and XGBoost
7. Evaluating model performance
8. Integrating the selected model with the Flask backend
9. Displaying predictions through the dashboard

The final Random Forest model achieved approximately **82.8% accuracy**.

---

##  Dashboard Workflow

### 1. Upload Data

The user uploads a CSV file containing patient information.

### 2. Validate & Process

The Flask backend validates the dataset and processes the required patient attributes.

### 3. Run ML Predictions

Patient information is passed to the trained machine-learning model.

### 4. Display Results

The dashboard displays patient information alongside the predicted dietitian referral status.

### 5. Analyse

Users can search, filter, and visualise patient information.

### 6. Export

Reports and visualisations can be exported for documentation and sharing.

---

##  Running the Project

Clone the repository:

```bash
git clone https://github.com/Madjid-lci/Medical-Dashboard.git
cd Medical-Dashboard
```

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it.

**Windows:**

```bash
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask backend using the appropriate entry point contained in the `backend` directory.

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

> The exact launch command may depend on the version/configuration of the repository.

---

##  Team

This project was developed by a **five-person team** as part of the Systems Development module at UWE Bristol.

| Team Member          | Primary Role                                        |
| -------------------- | --------------------------------------------------- |
| **Madjid Lachichi**  | Frontend Developer, ML Developer, UX/UI Designer    |
| Thuraiya Al Marhoobi | Project Manager, Systems Analyst, Backend Developer |
| Mohammad Faraj       | Data Analyst, Frontend Developer                    |
| Raeez Jaldin         | UX/UI Designer, Frontend Developer, Technical Lead  |
| Amira Soumid         | UI/UX Designer, Frontend Developer, Data Analyst    |

### My Contribution

My primary responsibilities included:

* Developing the **machine-learning model**
* Comparing ML approaches
* Implementing frontend functionality
* Integrating ML predictions into the dashboard
* Contributing to the dashboard's **UI/UX design**
* Supporting frontend/backend integration and testing

---

##  Project Outcomes

The completed system demonstrates the integration of:

**Machine Learning + Full-Stack Development + Clinical Decision Support + Data Visualisation**

The project successfully delivered a working cross-platform dashboard capable of processing patient datasets, generating ML-assisted referral predictions, filtering patient records, visualising clinical information, and producing exportable reports.

---

##  Disclaimer

This project was developed for **academic and educational purposes**.

The machine-learning predictions produced by this application are experimental and **must not be used as a substitute for professional medical judgement or deployed for real-world clinical decision-making without appropriate clinical validation, regulatory review, security controls, and further testing**.

---

##  Repository

**GitHub:**
https://github.com/Madjid-lci/Medical-Dashboard

---

##  Author

**Madjid Lachichi**
BSc (Hons) Computer Science (Artificial Intelligence)
University of the West of England (UWE Bristol)
