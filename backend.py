from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import requests
from config import Config
import re

app = Flask(__name__)
CORS(app)

# Load dataset globally
df = pd.read_csv("GlobalWeatherRepository.csv")

def sanitize_input(text):
    """Sanitize input strings by removing special characters and extra whitespace"""
    if not isinstance(text, str):
        return ""
    return re.sub(r'[^\w\s-]', '', text).strip().lower()

def validate_zip_code(zip_code):
    """Validate ZIP code format"""
    # Adjust pattern based on your supported ZIP code formats
    return bool(re.match(r'^[0-9A-Za-z-]{3,10}$', zip_code))

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Weather Prediction API!"})

@app.route("/countries", methods=["GET"])
def get_countries():
    try:
        countries = sorted(df["country"].dropna().str.strip().str.lower().unique())
        return jsonify({"countries": countries})
    except Exception as e:
        return jsonify({"error": "Internal server error while fetching countries"}), 500

@app.route("/towns", methods=["GET"])
def get_towns():
    try:
        towns = sorted(df["location_name"].dropna().str.strip().str.lower().unique())
        return jsonify({"towns": towns})
    except Exception as e:
        return jsonify({"error": "Internal server error while fetching towns"}), 500

@app.route("/resolve_zip", methods=["GET"])
def resolve_zip():
    zip_code = sanitize_input(request.args.get("zip", ""))

    if not zip_code:
        return jsonify({"error": "Please provide a ZIP code"}), 400

    if not validate_zip_code(zip_code):
        return jsonify({"error": "Invalid ZIP code format"}), 400

    try:
        response = requests.get(
            f"https://api.opencagedata.com/geocode/v1/json?q={zip_code}&key={Config.API_KEY}",
            timeout=5  # Add timeout
        )
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])
        if not results:
            return jsonify({"error": "Location not found for the provided ZIP code"}), 404

        components = results[0]["components"]
        country = sanitize_input(components.get("country", ""))
        town = sanitize_input(components.get("city", "") or components.get("town", ""))

        if not country and not town:
            return jsonify({"error": "Unable to resolve location details"}), 404

        return jsonify({"country": country, "town": town})

    except requests.Timeout:
        return jsonify({"error": "Request timed out while resolving ZIP code"}), 504
    except requests.RequestException as e:
        return jsonify({"error": "Failed to connect to location service"}), 502
    except Exception as e:
        return jsonify({"error": "Internal server error while resolving ZIP code"}), 500

@app.route("/predict", methods=["GET"])
def predict():
    country = sanitize_input(request.args.get("country", ""))
    town = sanitize_input(request.args.get("town", ""))

    if not country and not town:
        return jsonify({"error": "Please provide either a country or town"}), 400

    try:
        # Create case-insensitive filters
        filtered_data = df[
            (df["country"].str.strip().str.lower() == country) |
            (df["location_name"].str.strip().str.lower() == town)
        ]

        if filtered_data.empty:
            return jsonify({"error": "No weather data available for the specified location"}), 404

        # Handle null values and convert to numeric
        temperatures = pd.to_numeric(filtered_data["temperature_celsius"], errors='coerce')
        
        if temperatures.isna().all():
            return jsonify({"error": "No valid temperature data available"}), 404

        summary = {
            "max": f"{round(temperatures.max(), 2)} °C",
            "average": f"{round(temperatures.mean(), 2)} °C",
            "min": f"{round(temperatures.min(), 2)} °C",
            "data_points": len(temperatures.dropna())
        }

        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": "Internal server error while processing weather data"}), 500

if __name__ == "__main__":
    app.run(debug=True, host=Config.HOST, port=Config.PORT)
