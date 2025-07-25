import { type NextRequest, NextResponse } from "next/server"
import { AirtableService } from "@/lib/airtable"

export async function GET() {
  try {
    const vehicles = await AirtableService.getAllVehicles()

    return NextResponse.json({
      vehicles: vehicles.map((vehicle) => vehicle.fields),
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const vehicle = await AirtableService.createVehicle(body)

    if (!vehicle) {
      return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
    }

    return NextResponse.json(
      {
        vehicle: vehicle.fields,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
