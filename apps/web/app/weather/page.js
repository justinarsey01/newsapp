import {getWeather} from '../../lib/weather';
export const revalidate=1800;
export const metadata={title:'Weather in Nigerian cities',description:'Current weather and 5-day forecast for Lagos, Abuja, Port Harcourt, Kano, Ibadan, Enugu and more.'};
const day=d=>new Date(d+'T12:00:00').toLocaleDateString('en-NG',{weekday:'short'});
export default async function Weather(){const w=await getWeather();
 return <main><h1 style={{textAlign:'center'}}>Weather across Nigeria</h1>
  <p className="mut" style={{textAlign:'center'}}>Updated every 30 minutes. Forecast data from Open-Meteo.com.</p>
  {!w&&<p className="mut" style={{textAlign:'center'}}>Weather is unavailable right now. Please try again shortly.</p>}
  <div className="wgrid">{(w||[]).map(c=><div className="card wcard" key={c.slug}><div className="whead"><b>{c.name}</b><span className="wtemp">{c.icon} {c.temp}°C</span></div>
   <div className="mut">{c.text} · Wind {c.wind} km/h · Humidity {c.humidity}%</div>
   <div className="wdays">{c.days.map(d=><div key={d.date}><small>{day(d.date)}</small><div>{d.icon}</div><b>{d.max}°</b><small className="mut"> {d.min}°</small><div className="mut"><small>💧{d.rain??0}%</small></div></div>)}</div></div>)}</div></main>}