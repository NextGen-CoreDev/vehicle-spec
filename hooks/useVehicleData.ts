"use client";

import { useState, useEffect } from "react";

export interface VehicleData {
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
  Status: string;
}

export interface VehicleImages {
  "Front Image"?: string[];
  "Rear Image"?: string[];
  "Drive Side Image"?: string[];
  "Passenger Side Image"?: string[];
  "Interior Image"?: string[];
  "Dashboard Image"?: string[];
  "Tires Image"?: string[];
  "Window Sticker Image"?: string[];
  "Add-ons Damage Image"?: string[];
}

export interface UseVehicleDataReturn {
  vehicleData: VehicleData | null;
  images: VehicleImages;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVehicleData(vehicleId: string): UseVehicleDataReturn {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [images, setImages] = useState<VehicleImages>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/vehicles/${vehicleId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setVehicleData(data.vehicle);
      setImages(data.images || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching vehicle data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  return {
    vehicleData,
    images,
    loading,
    error,
    refetch: fetchVehicleData,
  };
}
