export const CITIES=[
 {slug:'lagos',name:'Lagos',lat:6.5244,lon:3.3792},{slug:'abuja',name:'Abuja',lat:9.0765,lon:7.3986},
 {slug:'port-harcourt',name:'Port Harcourt',lat:4.8156,lon:7.0498},{slug:'kano',name:'Kano',lat:12.0022,lon:8.5920},
 {slug:'ibadan',name:'Ibadan',lat:7.3775,lon:3.9470},{slug:'enugu',name:'Enugu',lat:6.4584,lon:7.5464},
 {slug:'abeokuta',name:'Abeokuta (Ogun)',lat:7.1475,lon:3.3619},{slug:'asaba',name:'Asaba (Delta)',lat:6.1980,lon:6.7310},
 {slug:'onitsha',name:'Onitsha',lat:6.1667,lon:6.7833},{slug:'benin',name:'Benin City',lat:6.3350,lon:5.6037},
 {slug:'owerri',name:'Owerri (Imo)',lat:5.4836,lon:7.0333}];
const W=c=>c===0?['☀️','Clear sky']:c<=2?['🌤️','Partly cloudy']:c===3?['☁️','Overcast']:c<=48?['🌫️','Fog']:c<=57?['🌦️','Drizzle']:c<=67?['🌧️','Rain']:c<=77?['🌨️','Snow']:c<=82?['🌦️','Showers']:['⛈️','Thunderstorm'];
export async function getWeather(){
 try{const q=`latitude=${CITIES.map(c=>c.lat).join(',')}&longitude=${CITIES.map(c=>c.lon).join(',')}`;
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Africa%2FLagos&forecast_days=5`,{next:{revalidate:1800}});
  if(!r.ok)return null;const j=await r.json();const arr=Array.isArray(j)?j:[j];
  return CITIES.map((c,i)=>{const d=arr[i],[icon,text]=W(d.current.weather_code);
   return {...c,temp:Math.round(d.current.temperature_2m),icon,text,wind:Math.round(d.current.wind_speed_10m),humidity:d.current.relative_humidity_2m,
    days:d.daily.time.map((t,k)=>({date:t,icon:W(d.daily.weather_code[k])[0],max:Math.round(d.daily.temperature_2m_max[k]),min:Math.round(d.daily.temperature_2m_min[k]),rain:d.daily.precipitation_probability_max[k]}))}})}catch(e){return null}}