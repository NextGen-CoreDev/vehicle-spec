"use client"

import { useState, useEffect } from "react"

export interface VehicleData {
  "Vehicle ID": string
  Year: number
  Make: string
  Model: string
  Trim?: string
  VIN: string
  Mileage: number
  "Zip Code"?: string
  "Exterior Color": string
  "Interior Color": string
  "Vehicle Condition": string
  "Tire Condition": string
  "Add-ons": string
  Status: string
}

export interface VehicleImage {
  "Vehicle ID": string
  "Image Type": string
  "Image URL": string
  "Alt Text"?: string
  Order: number
}

export interface UseVehicleDataReturn {
  vehicleData: VehicleData | null
  images: VehicleImage[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVehicleData(vehicleId: string): UseVehicleDataReturn {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [images, setImages] = useState<VehicleImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicleData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/vehicles/${vehicleId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setVehicleData(data.vehicle)
      setImages(data.images || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching vehicle data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData()
    }
  }, [vehicleId])

  return {
    vehicleData,
    images,
    loading,
    error,
    refetch: fetchVehicleData,
  }
}
