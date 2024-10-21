from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from db import connect, add_data, fetch_data
from collections import defaultdict
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default dictionary to track IP requests
ip_request_counts = defaultdict(int)
delayThreshold = 5
response_delay = 2

# WeatherData schema for validation
class WeatherData(BaseModel):
    city: str
    temperature: float
    weather_description: str
    humidity: int
    minTemp: float
    maxTemp: float
    dominantWeather: str
    reason: str
    avgTemp: float
    time_stamp: str

@app.post('/add-data', status_code=201)
async def add_weather_data(request: Request, data: WeatherData):
    ip_address = request.client.host
    ip_request_counts[ip_address] += 1
    
    if ip_request_counts[ip_address] > delayThreshold:
        time.sleep(response_delay)
    
    try:
        # Add data to the database
        success = add_data(data.dict())
        if success:
            return {"message": "Data added successfully"}
        else:
            raise HTTPException(status_code=500, detail="Error in adding data to the database")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", status_code=200)
async def home(request: Request):
    ip_address = request.client.host
    ip_request_counts[ip_address] += 1
    
    if ip_request_counts[ip_address] > delayThreshold:
        time.sleep(response_delay)
    
    return {"message": "I am Pratham Asrani, and soon I will join Zeotap"}

@app.get('/get-data/{city}', status_code=200)
async def get_city_data(city: str, request: Request):
    ip_address = request.client.host
    ip_request_counts[ip_address] += 1
    
    if ip_request_counts[ip_address] > delayThreshold:
        time.sleep(response_delay)
    
    print("debug: ", city)
    data = fetch_data(city)
    print(data)
    if data['success'] == True:
        return {"data": data['rows']}
    else:
        raise HTTPException(status_code=404, detail="No data found")
