import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { GoogleGenerativeAI as googleGenAI } from '@google/generative-ai';
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'
import '../styles/weather.css'; // Importing the CSS file

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
)

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('metric');
  const [threshold, setThreshold] = useState();
  const [email, setEmail] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [optionsData, setOptionsData] = useState(null);
  const genAI = new googleGenAI(process.env.REACT_APP_GEMINI_API);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
  const thresholdInputRef = useRef();
  const metros = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Kolkata', 'Chennai'];

  // get cordinates of each city
  const getCoordinates = async (city) => {
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city},India&limit=1&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );
      return response.data[0];
    } catch (err) {
      console.error(`Error fetching coordinates for ${city}: ${err}`);
      return null;
    }
  };

  // get details of weather data from api
  const getWeatherData = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=${unit}`
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching weather data: ${err}`);
      return null;
    }
  };

  // get the forecasted data from api, doesnot support limit on the response
  const getForecastData = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=${unit}`
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching forecast data: ${err}`);
      return null;
    }
  };

  // add the data to the postgres via FastAPI and do the visualization and further anaylsis
  const addWeatherData = async (data) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_ROUTE}/add-data`, data);
      console.log('Data added successfully:', response.data);
    } catch (err) {
      console.error('Error adding weather data:', err.response?.data);
    }
  };



  // get data for all the cities
  const getData = async () => {
    const coordinates = await Promise.all(metros.map(getCoordinates));

    // Fetch weather data for all coordinates
    const weatherPromises = coordinates.map(async (coord) => {
      if (coord) {
        const weather = await getWeatherData(coord.lat, coord.lon);
        if (weather) {
          const weatherDetails = {
            city: weather.name,
            lat: coord.lat,
            lon: coord.lon,
            temperature: weather.main.temp,
            weather_description: weather.weather[0].description,
            humidity: weather.main.humidity,
            minTemp: weather.main.temp_min,
            maxTemp: weather.main.temp_max,
            windSpeed: weather.wind.speed,
            dominantWeather: weather.weather[0].main,
            reason: weather.weather[0].description,
            avgTemp: (weather.main.temp_min + weather.main.temp_max) / 2,
            time_stamp: new Date().toLocaleTimeString('en-US', { hour12: true }),
          };
          await addWeatherData(weatherDetails);
          return weatherDetails;
        }
      }
      return null;
    });

    const weatherData = await Promise.all(weatherPromises);
    console.log("debug: ", weatherData)
    setWeatherData(weatherData.filter((data) => data !== null));
    setLoading(false);
  };

  // get data for current location
  const getCurrentLocationWeather = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const weather = await getWeatherData(latitude, longitude);
        if (weather) {
          const weatherDetails = {
            city: weather.name,
            lat: latitude,
            lon: longitude,
            temperature: weather.main.temp,
            weather_description: weather.weather[0].description,
            humidity: weather.main.humidity,
            minTemp: weather.main.temp_min,
            maxTemp: weather.main.temp_max,
            windSpeed: weather.wind.speed,
            dominantWeather: weather.weather[0].main,
            reason: weather.weather[0].description,
            avgTemp: (weather.main.temp_min + weather.main.temp_max) / 2,
            time_stamp: new Date().toLocaleTimeString('en-US', { hour12: true }),
          };

          await addWeatherData(weatherDetails);
          setCurrentLocationWeather(weatherDetails);
          checkThresholdAlert(weatherDetails, threshold);
        }
      }, (error) => {
        console.error('Error getting current location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // get data from postgres
  const generateWeatherSummary = async (data) => {
    try {
      const prompt = `generate a short 100 words summary on weather using weather data: city: ${data.city}, temperature: ${data.temperature}, humidity: ${data.humidity}%, current weather: ${data.weather}, wind speed: ${data.windSpeed}m/s, specific weather condition is same as current weather`;
      const { response } = await model.generateContent(prompt);
      return response?.text();
    }
    catch (error) {
      console.log(`Error in getting data from model gemini-1.5pro`)
      console.error(error)
      return null
    }
  }

  // getting specific city historial data for line chart
  const getCityWeatherData = async (city) => {
    try {
      const result = await axios.get(`${process.env.REACT_APP_BACKEND_ROUTE}/get-data/${city}`)
      return { result };
    }
    catch (err) {
      console.log(`Error in getting data from DB`)
      console.error(err)
      return null
    }
  }

  useEffect(() => {
    getData();
    getCurrentLocationWeather();

    const intervalId = setInterval(() => {
      setLoading(true);
      getData();
      getCurrentLocationWeather();
    }, 300000); // 5 minutes

    return () => clearInterval(intervalId);
  }, []); // Removed 'unit' from the dependency array

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
  };

  const handleThresholdUpdate = () => {
    const newThreshold = parseInt(thresholdInputRef.current.value);
    setThreshold(newThreshold);

    const userEmail = prompt("Please enter your email address to receive alerts:");
    if (userEmail) {
      setEmail(userEmail);
      checkThresholdAlert(currentLocationWeather, newThreshold);
    }
  };

  const checkThresholdAlert = (weatherDetails, newThreshold) => {
    if (weatherDetails && email) {
      const thresholdTemp = unit === 'metric' ? newThreshold : unit === 'imperial' ? (newThreshold - 32) * (5 / 9) : newThreshold - 273.15;

      if (weatherDetails.temperature > thresholdTemp) {
        alert(`Alert: ${weatherDetails.city} temperature exceeds the threshold of ${newThreshold}°${unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}`);
        sendEmail(email, weatherDetails); // Ensure this line remains commented
      }
    }
  };

  const sendEmail = (userEmail, weatherDetails) => {
    const templateParams = {
      email: userEmail,
      to_name: userEmail.split('@')[0],
      from_name: 'Weather App -- (Pratham Asrani)',
      message: `The current temperature in ${weatherDetails.city} is ${weatherDetails.temperature}°${unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'} and has exceeded the threshold limit.`,
    };

    emailjs
      .send(process.env.REACT_APP_EMAIL_SERVICE_ID, process.env.REACT_APP_TEMPLATE_ID, templateParams, process.env.REACT_APP_USERID)
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
      });
  };

  const handleViewForecast = async (lat, lon, city) => {
    const forecast = await getForecastData(lat, lon);
    if (forecast) {
      const limitedForecast = forecast.list.slice(0, 5);
      setForecastData({ ...forecast, list: limitedForecast });
      setSelectedCity(city);
    }
  };

  const convertTemperature = (temp, unit) => {
    switch (unit) {
      case 'imperial':
        return (temp * 9 / 5) + 32;
      case 'standard':
        return temp + 273.15;
      default:
        return temp;
    }
  };

  const handleViewSummary = async (data) => {
    try {
      setSelectedCity(data.city);
      const result = await generateWeatherSummary(data);
      if (result === null) console.log("error in generating summary")
      else {
        setWeatherSummary(result);
        console.log("weather summary: ", result)
      }

      const arr = ((await getCityWeatherData(data.city))?.['result']?.['data']?.['data']);
      console.log("getCityWeatherData: ", arr);
      const x = [], y = []
      for (let i = 0; i < Math.min(8, arr.length); i++) {
        x.push(arr[i][1])
        y.push(arr[i][0])
        console.log(arr[i])
      }
      console.log(x)
      console.log(y)

      const finalChartData = {
        labels: x,
        datasets: [{
          data: y
        }]
      }
      console.log(finalChartData)
      setOptionsData({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: 'white', // Make x-axis labels white
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)', // Light grid color
            },
          },
          y: {
            ticks: {
              color: 'white', // Make y-axis labels white
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)', // Light grid color
            },
          },
        },
        elements: {
          line: {
            borderColor: 'white', // Make the line white
            borderWidth: 2,
          },
          point: {
            backgroundColor: 'black', // Make the points white if needed
          },
        },
        plugins: {
          legend: {
            labels: {
              color: 'white', // Make the legend text white
            },
          },
        },
      })
      setChartData(finalChartData)
    } catch (error) {
      console.error(error)
      console.log(`Error in handleViewSummary ${error}`)
    }
  }

  return (
    <div className="weather-container">
      <h1>Real-Time Weather Data for Indian Metros</h1>
      <label htmlFor="unit-select" className="unit-label">Select Temperature Unit </label>
      <select id="unit-select" value={unit} onChange={handleUnitChange}>
        <option value="metric">Celsius (°C)</option>
        <option value="imperial">Fahrenheit (°F)</option>
        <option value="standard">Kelvin (K)</option>
      </select>

      <div className="threshold-container">
        <input
          id="threshold-input"
          type="number"
          ref={thresholdInputRef}
          placeholder="Set Temperature Threshold"
        />
        <button onClick={handleThresholdUpdate}>Set Threshold</button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="weather-cards">
          {currentLocationWeather && (
            <div className="weather-card">
              <h2>Current Location: {currentLocationWeather.city}</h2>
              <p>Temperature: {convertTemperature(currentLocationWeather.temperature, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Minimum Temperature: {convertTemperature(currentLocationWeather.minTemp, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Maximum Temperature: {convertTemperature(currentLocationWeather.maxTemp, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Average Temperature: {convertTemperature(currentLocationWeather.avgTemp, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Weather: {currentLocationWeather.weather_description}</p>
              <p>Wind Speed: {currentLocationWeather.windSpeed} m/s</p>
              <p>Timestamp: {currentLocationWeather.time_stamp}</p>
              <button onClick={() => handleViewForecast(currentLocationWeather.lat, currentLocationWeather.lon, currentLocationWeather.city)}>View Forecast</button>
              <button onClick={() => handleViewSummary(currentLocationWeather)}>View summary</button>
            </div>
          )}


          {weatherData.map((data, index) => (
            <div key={index} className="weather-card">
              <h2>{data.city}</h2>
              <p>Temperature: {convertTemperature(data.temperature, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Minimum Temperature: {convertTemperature(data.minTemp, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Maximum Temperature: {convertTemperature(data.maxTemp, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Average Temperature: {convertTemperature(data.avgTemp, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
              <p>Weather: {data.weather_description}</p>
              <p>Wind Speed: {data.windSpeed} m/s</p>
              <p>Timestamp: {currentLocationWeather.time_stamp}</p>
              <button onClick={() => handleViewForecast(data.lat, data.lon, data.city)}>View Forecast</button>
              <button onClick={() => handleViewSummary(data)}>View summary</button>
            </div>
          ))}
        </div>
      )}

      {forecastData && (
        <div className="forecast-container">
          <h2 style={{ color: "white" }}>Today's forecast for {selectedCity}</h2>
          <div className="forecast-grid">
            {forecastData.list.map((item, index) => (
              <div key={index} className="forecast-item">
                <p><strong>{new Date(item.dt * 1000).toLocaleString()}</strong></p>
                <p>Temp: {convertTemperature(item.main.temp, unit).toFixed(2)}°{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
                <p>Weather: {item.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {weatherSummary && chartData && (
        <div className="forecast-container">
          <h2 style={{ color: "white" }}>Weather Summary for {selectedCity}</h2>
          <p>
            {weatherSummary}
          </p>
          <Line
            className='chart-container'
            data={chartData}
            options={optionsData}
            style={{ maxHeight: "300px" }}
          ></Line>
        </div>
      )}

    </div>
  );
};

export default Weather;
