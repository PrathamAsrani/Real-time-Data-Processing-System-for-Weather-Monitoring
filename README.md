# 🌤️ Real-Time Weather Monitoring System with Rollups and Aggregates

This project is a **Real-Time Weather Monitoring System** built using **PostgreSQL**, **FastAPI**, and **React.js**. It tracks and displays live weather data for current locations and major metro cities, offering features such as temperature conversion, data visualization, and alert thresholds. The system processes real-time data efficiently, offering weather summaries and insights to users.

## 💻 Tech Stack

- **Database**: PostgreSQL (with psycopg2)
- **Backend**: Python (FastAPI, uvicorn)
- **Frontend**: React.js (Axios, ChartJS, React-ChartJS-2)
- **Visualization**: Chart.js (for real-time weather data visualization)
- **Security**: Hashing IP addresses to prevent DDoS attacks
- **Notifications**: EmailJS for alerting temperature thresholds
- **Real-Time Updates**: Using `setInterval()` with async/await for continuous data updates

## 🚀 Features

1. **Display Real-Time Weather Data**:
   - Weather conditions, temperature, humidity, and more for current locations and major metro cities.
   - Uses Axios to fetch data from weather APIs.
   
2. **Real-Time Data Updates**:
   - Automatically updates weather data every 10 minutes using `setInterval()`.
   - Handles asynchronous data fetch with `async/await` in the JavaScript event loop.
   
3. **Temperature Conversion**:
   - Converts temperatures between Celsius, Fahrenheit, and Kelvin using an O(1) time complexity formula.
   
4. **Data Storage and Analysis**:
   - Stores weather data in PostgreSQL for future analysis and visualization.
   - Enables historical data plotting, such as temperature trends over time.

5. **Weather Summaries**:
   - Generates summaries using the **Gemini-1.5 Pro Model**, selected for its faster and more efficient output compared to Flash.

6. **Interactive Data Visualization**:
   - Displays temperature trends in a **Line Graph** using **Chart.js** and **react-chartjs-2**.
   - The X-axis represents the time of data updates, while the Y-axis shows the temperature.

7. **Security**:
   - Implements IP hashing to mitigate DDoS attacks.
   - Requests exceeding a threshold from the same IP trigger a 2-second response delay.

8. **Alert Thresholds**:
   - Users can set temperature thresholds and receive alerts when the temperature exceeds those limits.
   - Uses **EmailJS** to send alert notifications.

9. **Additional Weather Information**:
   - Provides extra data such as humidity, wind speed, minimum and maximum temperatures, and average temperature.

10. **Responsive Design**:
    - Ensures the website is fully responsive and adapts seamlessly to all screen sizes.

## ⚙️ Installation and Setup

### Backend Setup (Terminal 1)

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2. Navigate to the backend directory:
    ```bash
    cd <backend-directory>
    ```
3. Create a virtual environment:
    ```bash
    python -m venv backend
    ```
4. Activate the virtual environment:
    - **Windows**:
        ```bash
        backend\Scripts\activate
        ```
    - **Mac/Linux**:
        ```bash
        source backend/bin/activate
        ```
5. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
6. Start the backend server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend Setup (Terminal 2)

1. Navigate to the frontend directory:
    ```bash
    cd <frontend-directory>
    ```
2. Install the required packages:
    ```bash
    npm install
    ```
3. Start the frontend development server:
    ```bash
    npm start
    ```

### PostgreSQL Database Setup

Ensure PostgreSQL is running on your system. Create the necessary table by executing the following SQL:

```sql
CREATE TABLE IF NOT EXISTS weather_data (
    city VARCHAR(255) NOT NULL,
    temperature FLOAT NOT NULL,
    weather_description VARCHAR(255) NOT NULL,
    humidity FLOAT NOT NULL,
    minTemp FLOAT NOT NULL,
    maxTemp FLOAT NOT NULL,
    dominantWeather VARCHAR(255) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    avgTemp FLOAT NOT NULL,
    PRIMARY KEY (city)
);
```

## 🛠️ Usage

1. **Start the Backend**: 
    - Run the backend server in Terminal 1: 
      ```bash
      uvicorn main:app --reload
      ```

2. **Start the Frontend**:
    - Run the frontend server in Terminal 2: 
      ```bash
      npm start
      ```

3. **Open the Application**: 
    - Open your browser and navigate to `http://localhost:3000`.

4. **Set Temperature Alerts**:
    - Set a temperature threshold and receive alerts when the temperature exceeds the specified limit.

5. **Visualize Weather Data**:
    - View real-time temperature trends on the line graph, updated every 10 minutes.

## 🔮 Future Enhancements

- **User Authentication**: 
  - Add user profiles to save personalized settings and thresholds.
  
- **Enhanced Data Visualization**: 
  - Add additional chart types (e.g., bar charts, pie charts) for different weather metrics.
  
- **API Integration**:
  - Expand support to more cities and integrate with multiple weather APIs for improved accuracy.
