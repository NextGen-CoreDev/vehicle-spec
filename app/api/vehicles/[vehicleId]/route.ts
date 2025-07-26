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

    // Extract image URLs from the vehicle record
    const images = {
      "Front Image": vehicle.fields["Front Image"],
      "Rear Image": vehicle.fields["Rear Image"],
      "Drive Side Image": vehicle.fields["Drive Side Image"],
      "Passenger Side Image": vehicle.fields["Passenger Side Image"],
      "Interior Image": vehicle.fields["Interior Image"],
      "Dashboard Image": vehicle.fields["Dashboard Image"],
      "Tires Image": vehicle.fields["Tires Image"],
      "Window Sticker Image": vehicle.fields["Window Sticker Image"],
      "Add-ons Damage Image": vehicle.fields["Add-ons Damage Image"],
    };

    return NextResponse.json({
      vehicle: vehicle.fields,
      images,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
