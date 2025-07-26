import Airtable from "airtable";

// Configure Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

// Define the table names
export const TABLES = {
  VEHICLES: "Vehicles",
} as const;

// Types for Airtable records
export interface VehicleRecord {
  id: string;
  fields: {
    "Vehicle ID": string;
    Year: number;
    Make: string;
    Model: string;
    Trim?: string;
    VIN: string;
    Mileage: number;
    "Zip Code"?: string;
    "Exterior Color": string;
    "Interior Color": string;
    "Vehicle Condition": string;
    "Tire Condition": string;
    "Add-ons": string;
    Status: "Active" | "Sold" | "Pending";
    Created: string;
    Updated: string;
    // Image URL columns
    "Front Image"?: string;
    "Rear Image"?: string;
    "Drive Side Image"?: string;
    "Passenger Side Image"?: string;
    "Interior Image"?: string;
    "Dashboard Image"?: string;
    "Tires Image"?: string;
    "Window Sticker Image"?: string;
    "Add-ons Damage Image"?: string;
  };
}

// Airtable service functions
export class AirtableService {
  // Get vehicle by ID
  static async getVehicle(vehicleId: string): Promise<VehicleRecord | null> {
    try {
      const records = await base(TABLES.VEHICLES)
        .select({
          filterByFormula: `{VIN} = '${vehicleId}'`,
          maxRecords: 1,
        })
        .firstPage();

      return records.length > 0 ? (records[0] as VehicleRecord) : null;
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return null;
    }
  }

  // Get all vehicles
  static async getAllVehicles(): Promise<VehicleRecord[]> {
    try {
      const records = await base(TABLES.VEHICLES)
        .select({
          filterByFormula: `{Status} = 'Active'`,
          sort: [{ field: "Created", direction: "desc" }],
        })
        .all();

      return records as VehicleRecord[];
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      return [];
    }
  }

  // Create a new vehicle
  static async createVehicle(
    vehicleData: Partial<VehicleRecord["fields"]>
  ): Promise<VehicleRecord | null> {
    try {
      const record = await base(TABLES.VEHICLES).create([
        {
          fields: {
            ...vehicleData,
            Status: "Active",
            Created: new Date().toISOString(),
            Updated: new Date().toISOString(),
          } as VehicleRecord["fields"],
        },
      ]);

      return record[0] as VehicleRecord;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      return null;
    }
  }

  // Update vehicle
  static async updateVehicle(
    recordId: string,
    vehicleData: Partial<VehicleRecord["fields"]>
  ): Promise<VehicleRecord | null> {
    try {
      const record = await base(TABLES.VEHICLES).update([
        {
          id: recordId,
          fields: {
            ...vehicleData,
            Updated: new Date().toISOString(),
          },
        },
      ]);

      return record[0] as VehicleRecord;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      return null;
    }
  }
}
