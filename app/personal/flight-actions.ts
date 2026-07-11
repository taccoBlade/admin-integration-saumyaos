"use server";

export async function getLiveFlights() {
  try {
    // Airplanes.live Public API - Center point Ahmedabad SVPI (23.0772, 72.6346) with 150NM radius
    // Completely open, excellent coverage over India, no API keys required.
    const centerLat = 23.0772;
    const centerLon = 72.6346;
    const radiusNM = 150;

    const API_URL = `https://api.airplanes.live/v2/point/${centerLat}/${centerLon}/${radiusNM}`;

    const response = await fetch(API_URL, {
      cache: 'no-store',
      headers: {
        "User-Agent": "PersonalSite/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Airplanes.live API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.ac) {
      return [];
    }

    // Filter within our visual bounding box
    const lamin = 22.0;
    const lamax = 24.0;
    const lomin = 71.0;
    const lomax = 74.0;

    const flights = data.ac
      .filter((ac: any) => {
        const lat = ac.lat;
        const lon = ac.lon;
        return lat >= lamin && lat <= lamax && lon >= lomin && lon <= lomax;
      })
      .map((ac: any) => {
        const callsign = ac.flight?.trim() || ac.r || "UNKNOWN";
        const aircraft = ac.desc || ac.t || "AIRCRAFT";
        const altFeet = ac.alt_baro === "ground" ? 0 : (ac.alt_baro || 0);
        const speedKnots = ac.gs || 0;
        const heading = ac.track || 0;
        const lat = ac.lat;
        const lon = ac.lon;

        // Calculate distance in degrees for sorting
        const dLat = Math.abs(lat - centerLat);
        const dLon = Math.abs(lon - centerLon);
        const distance = dLat + dLon;

        return {
          callsign,
          aircraft,
          origin: "LIVE",
          destination: "RADAR",
          altitude: altFeet / 3.28084, // convert to meters since UI converts back to feet (Math.round(flight.altitude * 3.28084))
          speed: speedKnots,
          distance,
          lat,
          lon,
          heading
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance);

    // Return the top 3 closest flights to SVPI airport
    return flights.slice(0, 3);

  } catch (error) {
    console.error("Failed to fetch live flights via Airplanes.live:", error);
    return [];
  }
}
