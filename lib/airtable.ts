import Airtable from "airtable";

// Configure Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

// Define the table names
export const TABLES = {
  VEHICLES: "Vehicles",
  VEHICLE_IMAGES: "Vehicle Images",
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
  };
}

export interface VehicleImageRecord {
  id: string;
  fields: {
    "Vehicle ID": string;
    "Image Type":
      | "Front"
      | "Rear"
      | "Driver Side"
      | "Passenger Side"
      | "Interior"
      | "Dashboard"
      | "Tires"
      | "Window Sticker"
      | "Add-Ons Damage";
    "Image URL": string;
    "Alt Text"?: string;
    Order: number;
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

  // Get vehicle images
  static async getVehicleImages(
    vehicleId: string
  ): Promise<VehicleImageRecord[]> {
    try {
      const records = await base(TABLES.VEHICLE_IMAGES)
        .select({
          filterByFormula: `{VIN} = '${vehicleId}'`,
          sort: [{ field: "Order", direction: "asc" }],
        })
        .all();

      return records as VehicleImageRecord[];
    } catch (error) {
      console.error("Error fetching vehicle images:", error);
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

  // Add vehicle image
  static async addVehicleImage(
    imageData: Partial<VehicleImageRecord["fields"]>
  ): Promise<VehicleImageRecord | null> {
    try {
      const record = await base(TABLES.VEHICLE_IMAGES).create([
        {
          fields: imageData as VehicleImageRecord["fields"],
        },
      ]);

      return record[0] as VehicleImageRecord;
    } catch (error) {
      console.error("Error adding vehicle image:", error);
      return null;
    }
  }
}
