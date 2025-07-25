import VehicleDisplay from "@/components/VehicleDisplay"

interface PageProps {
  params: {
    vehicleId: string
  }
}

export default function VehiclePage({ params }: PageProps) {
  return <VehicleDisplay vehicleId={params.vehicleId} />
}

export async function generateMetadata({ params }: PageProps) {
  // You could fetch vehicle data here for SEO
  return {
    title: `TRADELUX - Vehicle ${params.vehicleId}`,
    description: `View detailed information and photos for vehicle ${params.vehicleId} on TRADELUX private network.`,
  }
}
