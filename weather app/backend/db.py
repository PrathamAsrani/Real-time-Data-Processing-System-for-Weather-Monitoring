import psycopg2 as pg
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Database connection parameters
params = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'database': os.getenv('DB_NAME'),
    'password': os.getenv('DB_PASSWORD'),
    'port': os.getenv('DB_PORT')
}

def connect():
    """ Connect to the PostgreSQL database server and fetch data from weather_data table """
    conn = None
    try:
        conn = pg.connect(**params)
        cur = conn.cursor()
        cur.execute("SELECT * FROM weather_data;")
        rows = cur.fetchall()
        cur.close()
        return rows
    except (Exception, pg.DatabaseError) as error:
        print(error)
        return None
    finally:
        if conn is not None:
            conn.close()

def add_data(data):
    """ Add weather data to the weather_data table """
    conn = None
    try:
        conn = pg.connect(**params)
        cur = conn.cursor()
        insert_query = """
            INSERT INTO weather_data (
                city, temperature, weather_description, humidity,
                minTemp, maxTemp, dominantWeather, reason, avgTemp, time_stamp
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        cur.execute(insert_query, (
            data['city'], data['temperature'], data['weather_description'], data['humidity'], 
            data['minTemp'], data['maxTemp'], data['dominantWeather'], data['reason'], data['avgTemp'], data['time_stamp']
        ))
        conn.commit()
        cur.close()
        return True
    except (Exception, pg.DatabaseError) as error:
        print(error)
        return False
    finally:
        if conn is not None:
            conn.close()

def fetch_data(city):
    conn = None
    try:
        conn = pg.connect(**params)
        cur = conn.cursor()
        query = f"""
            select temperature, time_stamp
            from weather_data
            where city = '{city}';
        """
        cur.execute(query)
        data = {}
        data['rows'] = cur.fetchall()
        data['success'] = True
        cur.close()
        print("Connection is closed in try block")
        return data
    except(Exception, pg.DatabaseError) as error:
        print("Error in getting data", error)
        return {
            rows: None,
            success: False
        }
    finally:
        if conn is not None:
            conn.close()
            print("Connection is closed in finally block")