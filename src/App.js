import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import config from "./config";
import "./App.css";

const { BACKEND_URL } = config;

const ZIP_CODE_REGEX = /^[0-9A-Za-z-]{3,10}$/;

function App() {
  const [zipCode, setZipCode] = useState("");
  const [resolvedCountry, setResolvedCountry] = useState("");
  const [resolvedTown, setResolvedTown] = useState("");
  const [countries, setCountries] = useState([]);
  const [towns, setTowns] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch locations with error handling and loading state
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const [countryResponse, townResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/countries`),
          fetch(`${BACKEND_URL}/towns`)
        ]);

        if (!countryResponse.ok || !townResponse.ok) {
          throw new Error("Failed to fetch location data");
        }

        const [countryData, townData] = await Promise.all([
          countryResponse.json(),
          townResponse.json()
        ]);

        setCountries(
          countryData.countries.map((country) => ({
            value: country,
            label: country.charAt(0).toUpperCase() + country.slice(1)
          }))
        );

        setTowns(
          townData.towns.map((town) => ({
            value: town,
            label: town.charAt(0).toUpperCase() + town.slice(1)
          }))
        );
      } catch (err) {
        setError("Failed to load location data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleZipCodeChange = (e) => {
    const value = e.target.value;
    setZipCode(value);
    if (value === "") {
      setResolvedCountry("");
      setResolvedTown("");
    }
  };

  const resolveZipCode = async (zip) => {
    const response = await fetch(`${BACKEND_URL}/resolve_zip?zip=${encodeURIComponent(zip)}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to resolve ZIP code");
    }
    return response.json();
  };

  const getPrediction = async (country, town) => {
    const response = await fetch(
      `${BACKEND_URL}/predict?country=${encodeURIComponent(country)}&town=${encodeURIComponent(town)}`
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to get prediction");
    }
    return response.json();
  };

  const handlePredict = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      // Input validation
      if (zipCode && !ZIP_CODE_REGEX.test(zipCode)) {
        throw new Error("Invalid ZIP code format");
      }

      if (!zipCode && !resolvedCountry && !resolvedTown) {
        throw new Error("Please provide a ZIP code, country, or town");
      }

      // Resolve ZIP code if provided
      if (zipCode) {
        const data = await resolveZipCode(zipCode);
        await new Promise(resolve => setTimeout(resolve, 0)); // Ensure state updates
        setResolvedCountry(data.country || "");
        setResolvedTown(data.town || "");
        
        // Use the resolved data directly instead of depending on state
        const predictionData = await getPrediction(data.country || "", data.town || "");
        displayResult(predictionData, data.town || data.country);
      } else {
        // Use existing country/town selection
        const predictionData = await getPrediction(resolvedCountry, resolvedTown);
        displayResult(predictionData, resolvedTown || resolvedCountry);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayResult = (data, location) => {
    const { average, max, min } = data.summary;
    setResult(
      `Prediction for ${location}:\n` +
      `Maximum Temperature: ${max}\n` +
      `Average Temperature: ${average}\n` +
      `Minimum Temperature: ${min}\n` 
    );
  };

  return (
    <div className="container">
      <button
        onClick={() => window.open("https://www.linkedin.com/school/pmaccelerator/", "_blank")}
        className="linkedin-button"
        aria-label="Visit PM Accelerator on LinkedIn"
      >
        Visit PM Accelerator
      </button>

      <h1>Weather Prediction</h1>
      
      <div className="form-group">
        <div className="input-group">
          <label htmlFor="zip-code-input">ZIP Code:</label>
          <input
            type="text"
            id="zip-code-input"
            value={zipCode}
            onChange={handleZipCodeChange}
            placeholder="Enter ZIP code"
            maxLength={10}
            aria-label="Enter ZIP code"
          />
        </div>

        <div className="input-group">
          <label htmlFor="country-select">Country:</label>
          <Select
            id="country-select"
            options={countries}
            value={countries.find((option) => option.value === resolvedCountry)}
            onChange={(selectedOption) => {
              setResolvedCountry(selectedOption?.value || "");
              setResolvedTown("");
              setZipCode("");
            }}
            placeholder="Select a country..."
            isClearable
            isDisabled={isLoading}
            aria-label="Select country"
          />
        </div>

        <div className="input-group">
          <label htmlFor="town-select">Town/City:</label>
          <Select
            id="town-select"
            options={towns}
            value={towns.find((option) => option.value === resolvedTown)}
            onChange={(selectedOption) => {
              setResolvedTown(selectedOption?.value || "");
              setZipCode("");
            }}
            placeholder="Select or type a town/city..."
            isClearable
            isDisabled={isLoading}
            aria-label="Select town or city"
          />
        </div>

        <div className="button-group">
          <button 
            onClick={handlePredict} 
            disabled={isLoading}
            className="primary-button"
          >
            {isLoading ? "Loading..." : "Get Prediction"}
          </button>
        </div>
      </div>

      {result && (
        <div className="result" role="region" aria-label="Weather prediction results">
          <h3>Results</h3>
          <pre>{result}</pre>
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
