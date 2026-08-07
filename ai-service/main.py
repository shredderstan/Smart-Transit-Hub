import os
import json
import requests
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from langchain_core.tools import tool

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Smart Transit Hub - AI Chatbot Service",
    description="Python microservice powered by LangChain & Groq API with OpenWeather API integration",
    version="1.1.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_query: str
    role: str = "parent"  # "parent" or "driver"
    context_data: Optional[Dict[str, Any]] = None



def get_weather_from_openweather(location_query: str = "", lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    """
    Fetch live weather data from OpenWeatherMap API using city name or latitude/longitude.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key or api_key == "your_openweather_api_key_here":
        return {
            "status": "simulated",
            "message": "OPENWEATHER_API_KEY not configured in .env. Returning contextual fallback weather.",
            "temperature": "24°C",
            "condition": "Partly Cloudy",
            "humidity": "65%",
            "wind_speed": "12 km/h"
        }

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"appid": api_key, "units": "metric"}

        if lat is not None and lon is not None:
            params["lat"] = lat
            params["lon"] = lon
        elif location_query.strip():
            params["q"] = location_query.strip()
        else:
            params["q"] = "Pune"  # Default fallback city

        res = requests.get(url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            return {
                "status": "live",
                "city": data.get("name", location_query),
                "temperature": f"{round(data['main']['temp'])}°C",
                "feels_like": f"{round(data['main']['feels_like'])}°C",
                "condition": data['weather'][0]['description'].title(),
                "humidity": f"{data['main']['humidity']}%",
                "wind_speed": f"{round(data['wind']['speed'] * 3.6, 1)} km/h",
                "clouds": f"{data.get('clouds', {}).get('all', 0)}%"
            }
        else:
            return {
                "status": "error",
                "message": f"OpenWeather API returned status code {res.status_code}: {res.text}"
            }
    except Exception as err:
        return {
            "status": "error",
            "message": f"Failed to fetch OpenWeather data: {str(err)}"
        }


@tool
def get_open_weather(location_or_city: str) -> str:
    """
    Use this tool to fetch current live weather details for a specific city or location name (e.g. 'London', 'New York', 'Mumbai').
    """
    result = get_weather_from_openweather(location_query=location_or_city)
    return json.dumps(result, indent=2)




@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Smart Transit Hub AI Service",
        "engine": "LangChain + Groq API + OpenWeather API"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "groq_api_key_configured": bool(os.getenv("GROQ_API_KEY")),
        "openweather_api_key_configured": bool(os.getenv("OPENWEATHER_API_KEY"))
    }

@app.post("/api/chat")
async def chat_with_transit_ai(request: ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    # Check if context contains bus location coordinates to fetch real-time OpenWeather data
    context = request.context_data or {}
    bus_loc = context.get("busLocation") or {}
    
    live_weather_info = None
    if isinstance(bus_loc, dict) and "latitude" in bus_loc and "longitude" in bus_loc:
        try:
            lat = float(bus_loc["latitude"])
            lon = float(bus_loc["longitude"])
            live_weather_info = get_weather_from_openweather(lat=lat, lon=lon)
            context["live_openweather"] = live_weather_info
        except (ValueError, TypeError):
            pass

    # Format context nicely for the LLM
    context_str = json.dumps(context, indent=2) if context else "No live context provided."
    
    # Fallback response if GROQ_API_KEY is not configured yet
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        weather_summary = (
            f"Weather: {live_weather_info['condition']}, {live_weather_info['temperature']}" 
            if live_weather_info and live_weather_info.get("status") == "live" 
            else "Weather API ready."
        )
        return {
            "response": (
                f"[Simulated AI Mode]: Hello! I received your query: '{request.user_query}'. "
                f"{weather_summary} "
                f"(Note: Set GROQ_API_KEY in ai-service/.env to enable live Groq LLM responses)."
            ),
            "role": request.role,
            "simulated": True
        }

    try:
        from langchain_groq import ChatGroq
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        
        llm = ChatGroq(
            temperature=0.2,
            model_name="llama-3.3-70b-versatile",
            groq_api_key=groq_api_key
        )

        system_instruction = (
            "You are SmartTransit AI, an intelligent assistant for a smart school bus & transit system.\n"
            "Your user is a {role}.\n"
            "Use the provided REAL-TIME CONTEXT JSON (which includes live bus location, stops, ETA, and OpenWeather data) "
            "to answer questions regarding bus location, stops, estimated time of arrival (ETA), current weather along the route, and travel safety.\n\n"
            "RULES:\n"
            "1. Be concise, direct, helpful, and polite.\n"
            "2. If the user is a DRIVER: Keep answers very brief, clear, and safety-focused (hands-free readability).\n"
            "3. If the user is a PARENT: Be reassuring, precise about pickup/dropoff times, stops, and weather alerts.\n"
            "4. Base your answers strictly on the REAL-TIME CONTEXT when applicable.\n"
            "5. Do not answer any questions unrelated to weather and smart transit hub context. For any general questions, politely refuse to answer and suggest using proper sources.\n\n"
            "REAL-TIME CONTEXT:\n{context_str}"
        )

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_instruction),
            ("human", "{user_query}")
        ])

        chain = prompt_template | llm | StrOutputParser()

        ai_response = await chain.ainvoke({
            "role": request.role.upper(),
            "context_str": context_str,
            "user_query": request.user_query
        })

        return {
            "response": ai_response,
            "role": request.role,
            "simulated": False
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error communicating with AI Service / Groq API: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
