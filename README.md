# TRADELUX Vehicle Display

A professional vehicle display page built with Next.js for the TRADELUX private network.

## Features

- 🚗 **Vehicle Specifications Display** - Clean grid layout showing all vehicle details
- 🖼️ **Interactive Image Gallery** - 9 vehicle photos with zoom and pan functionality
- 📱 **Responsive Design** - Optimized for all screen sizes
- ⚡ **Next.js Optimization** - Image optimization and performance enhancements
- 🎨 **TRADELUX Branding** - Black background with gold accents

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd tradelux-vehicle-display
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Airtable Setup

### 1. Create Airtable Base

Create a new Airtable base with two tables:

**Vehicles Table:**
- Vehicle ID (Single line text, Primary field)
- Year (Number)
- Make (Single line text)
- Model (Single line text)
- Trim (Single line text, optional)
- VIN (Single line text)
- Mileage (Number)
- Zip Code (Single line text, optional)
- Exterior Color (Single line text)
- Interior Color (Single line text)
- Vehicle Condition (Single select: Excellent, Good, Fair, Poor)
- Tire Condition (Single select: New, Good, Medium Wear, Needs Replacement)
- Add-ons (Long text)
- Status (Single select: Active, Sold, Pending)
- Created (Date)
- Updated (Date)

**Vehicle Images Table:**
- Vehicle ID (Single line text)
- Image Type (Single select: Front, Rear, Driver Side, Passenger Side, Interior, Dashboard, Tires, Window Sticker, Add-Ons Damage)
- Image URL (URL)
- Alt Text (Single line text, optional)
- Order (Number)

### 2. Get API Credentials

1. Go to [Airtable API page](https://airtable.com/api)
2. Select your base
3. Copy your Base ID from the URL
4. Generate a Personal Access Token from your [Account page](https://airtable.com/account)

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

### 4. Usage

- **View vehicle**: `/vehicle/[vehicleId]` (e.g., `/vehicle/MERC2023001`)
- **API endpoints**: 
  - `GET /api/vehicles` - List all vehicles
  - `GET /api/vehicles/[vehicleId]` - Get specific vehicle
  - `POST /api/vehicles` - Create new vehicle

## Project Structure

\`\`\`
tradelux-vehicle-display/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── VehicleDisplay.tsx
├── public/
│   └── images/
├── next.config.js
├── tailwind.config.js
└── package.json
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

Build the project:
\`\`\`bash
npm run build
npm start
\`\`\`

## Customization

### Vehicle Data
Edit the `vehicleData` object in `components/VehicleDisplay.tsx` to update vehicle specifications.

### Images
Replace the image URLs in the `photoSections` array with your vehicle images.

### Styling
Modify `tailwind.config.js` and `app/globals.css` to customize the appearance.

## License

Private project for TRADELUX.
