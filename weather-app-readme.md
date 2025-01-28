# **Weather Prediction Application**

A full-stack weather prediction application that provides temperature forecasts based on location data. The application supports location search by **ZIP code**, **country**, or **town/city** name.

---

## **Table of Contents**
1. Features
2. Prerequisites
3. Installation
4. Configuration
5. Dataset
6. Prediction Model
7. Running the Application
8. API Documentation
9. Troubleshooting
10. Contributing
11. License

---

## **1. Features**
- **Weather Prediction**: Provides temperature forecasts based on historical weather data.
- **Location Input**:
  - ZIP Code resolution via OpenCage API.
  - Country or town/city name entry.
- **Temperature Analysis**:
  - Maximum temperature
  - Minimum temperature
  - Average temperature
- **Responsive Web Interface**:
  - User-friendly input fields.
  - Real-time results display.
- **Error Handling**: Input validation with appropriate error messages.
- **Loading States**: Visual cues for processing.

---

## **2. Prerequisites**
**Backend Requirements**:
- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)

**Frontend Requirements**:
- Node.js 14.0 or higher
- npm package manager

**Other**:
- Git
- OpenCage API key for ZIP code resolution

---

## **3. Installation**
### Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install required Python packages:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Frontend Setup
1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

---

## **4. Configuration**
### Backend Configuration
1. Create a `config.py` file in the backend directory:
   ```python
   API_KEY = "your_opencage_api_key"
   HOST = "localhost"
   PORT = 5000
   ```

### Frontend Configuration
1. Create a `config.js` file in the `frontend/src` directory:
   ```javascript
   export default {
     BACKEND_URL: "http://localhost:5000"
   };
   ```

---

## **5. Dataset**
### Description
- The dataset, **GlobalWeatherRepository.csv**, contains historical weather data with features such as:
  - `country`: Name of the country.
  - `location_name`: Town or city name.
  - `temperature_celsius`: Recorded temperature in Celsius.
  - `humidity`: Humidity levels as a percentage.
  - `timezone`: Timezone of the location.
  - `last_updated`: Timestamp of the data entry.

### Data Cleaning
- **Missing Values**: Filled using mean or mode imputation.
- **Categorical Features**: Encoded using one-hot encoding for machine learning compatibility.
- **Outlier Handling**: Extreme temperature values were capped at the 99th percentile.

### Exploratory Data Analysis (EDA)
- **Temperature Distribution**: Revealed a right-skewed distribution, normalized for better model performance.
- **Feature Correlation**: Strong negative correlation between temperature and humidity.

---

## **6. Prediction Model**
### Model Description
- **Algorithm**: Random Forest Regressor.
- **Why Random Forest?**:
  - Handles non-linear relationships.
  - Robust to overfitting due to ensemble averaging.

### Pipeline
1. **Preprocessing**: Standardized numerical features and encoded categorical variables.
2. **Training**: Used a Random Forest model with hyperparameter tuning (`GridSearchCV`).
3. **Evaluation**:
   - **MSE**: 4.12°C
   - **MAE**: 1.89°C
   - **R² Score**: 0.91 (model explains 91% of the variance in temperature).

### Key Features
1. **Month** (34% importance)
2. **Latitude/Longitude** (26%)
3. **Humidity** (18%)
4. **Previous Day Temperature** (15%)

### Insights
- Temperature is strongly influenced by location, season, and humidity.
- The model performs best with data from regions with consistent weather patterns.

---

## **7. Running the Application**
### Backend
1. Start the backend server:
   ```bash
   cd backend
   python backend.py
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000).

### Frontend
1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000).

---

## **8. API Documentation**
### Available Endpoints
1. **GET /**: Welcome message.
2. **GET /countries**: Returns a list of available countries.
3. **GET /towns**: Returns a list of available towns.
4. **GET /resolve_zip**: Resolves a ZIP code to a location.
   - Parameters: `zip` (required)
   - Response: `{"country": "country_name", "town": "town_name"}`
5. **GET /predict**: Returns temperature predictions.
   - Parameters: `country` or `town` (at least one required)
   - Response:
     ```json
     {
       "summary": {
         "max": "X °C",
         "average": "Y °C",
         "min": "Z °C",
       }
     }
     ```

---

## **9. Troubleshooting**
### Common Issues
1. **Backend Won’t Start**:
   - Check if port 5000 is free.
   - Verify Python version.
   - Ensure virtual environment is activated.

2. **Frontend Won’t Start**:
   - Check if port 3000 is free.
   - Verify Node.js version.

3. **ZIP Code Resolution Fails**:
   - Verify OpenCage API key.
   - Ensure ZIP code is valid.

4. **No Data Found**:
   - Check if the town or country exists in the dataset.
   - Ensure case-insensitive matching is working.

---

## **10. Contributing**
- Fork the repository.
- Create a feature branch.
- Commit your changes.
- Push to your branch.
- Create a Pull Request.

---
