import { type NextRequest, NextResponse } from "next/server";
import { AirtableService } from "@/lib/airtable";

export async function GET(
  request: NextRequest,
  { params }: { params: { vehicleId: string } }
) {
  try {
    const { vehicleId } = params;

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    // Get vehicle data
    const vehicle = await AirtableService.getVehicle(vehicleId);

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Get vehicle images
    const images = await AirtableService.getVehicleImages(vehicleId);

    return NextResponse.json({
      vehicle: vehicle.fields,
      images: images.map((img) => img.fields),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
