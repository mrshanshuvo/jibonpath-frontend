import { NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

interface NominatimAddress {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { success: false, message: "Invalid lat/lng" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(
      `${NOMINATIM_URL}?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          // Nominatim requires a UA identifying the app
          "User-Agent": "EmergencyAmbulanceDispatch/1.0",
          Accept: "application/json",
        },
      },
    );

    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, message: "Geocoding provider error" },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as NominatimResponse;

    const address =
      data.display_name ??
      [data.address?.road, data.address?.suburb, data.address?.city]
        .filter(Boolean)
        .join(", ");

    if (!address) {
      return NextResponse.json(
        { success: false, message: "No address found for coordinates" },
        { status: 404 },
      );
    }

    const area =
      data.address?.suburb ?? data.address?.neighbourhood ?? data.address?.city;

    return NextResponse.json({ address, area });
  } catch {
    return NextResponse.json(
      { success: false, message: "Geocoding lookup failed" },
      { status: 500 },
    );
  }
}
