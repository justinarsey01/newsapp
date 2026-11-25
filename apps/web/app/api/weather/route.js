import {getWeather} from '../../../lib/weather';
export const revalidate=1800;
export async function GET(){const w=await getWeather();return Response.json(w||[],{headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=3600'}})}