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

    // Helper function to convert single image to array or handle existing arrays
    const normalizeImageField = (imageField: any): string[] => {
      if (!imageField) return [];
      if (Array.isArray(imageField)) return imageField.filter(Boolean);
      return typeof imageField === "string" && imageField.trim()
        ? [imageField]
        : [];
    };

    // Extract image URLs from the vehicle record and convert to arrays
    const images = {
      "Front Image": normalizeImageField(vehicle.fields["Front Image"]),
      "Rear Image": normalizeImageField(vehicle.fields["Rear Image"]),
      "Drive Side Image": normalizeImageField(
        vehicle.fields["Drive Side Image"]
      ),
      "Passenger Side Image": normalizeImageField(
        vehicle.fields["Passenger Side Image"]
      ),
      "Interior Image": normalizeImageField(vehicle.fields["Interior Image"]),
      "Dashboard Image": normalizeImageField(vehicle.fields["Dashboard Image"]),
      "Tires Image": normalizeImageField(vehicle.fields["Tires Image"]),
      "Window Sticker Image": normalizeImageField(
        vehicle.fields["Window Sticker Image"]
      ),
      "Add-ons Damage Image": normalizeImageField(
        vehicle.fields["Add-ons Damage Image"]
      ),
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
