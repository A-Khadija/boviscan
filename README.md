# BoviScan UI v2.0 - Cattle Biometrics Web Application

A production-ready React application for cattle identification using muzzle print biometrics, powered by a Hugging Face Gradio API and MongoDB database.

## Features

- **Live Camera Capture**: Real-time camera feed with capture popup instructions
- **Drag & Drop Upload**: Intuitive image upload with preview
- **Dark/Light Theme**: Toggle between professional dark and light modes
- **Bilingual (FR/AR)**: Full French and Arabic support with RTL layout
- **MongoDB Integration**: Fetches cow details (parents, lactations) using partial ID matching
- **Simplified Results**: Clean Cow ID + Confidence display with database pipeline
- **No Cropping**: Direct flow from capture/upload to API analysis

## Tech Stack

- React 18 (Functional Components + Hooks)
- Vite (Build Tool)
- TailwindCSS (Styling with CSS variables for themes)
- i18next + react-i18next (Internationalization)
- Lucide React (Icons)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_MONGODB_API_URL=http://localhost:5000/api
```

### API Endpoints

**Hugging Face Gradio API:**
- **Upload**: `POST /gradio_api/upload`
- **Predict**: `POST /gradio_api/call/v2/identify_cattle`
- **Result (SSE)**: `GET /gradio_api/call/identify_cattle/{event_id}`

**MongoDB API (your backend):**
- **Search Cow**: `GET /api/cattle/search?nniEndsWith={last4digits}`
- **Get Lactations**: `GET /api/lactations?nni={fullNNI}`

## MongoDB Data Structure

The API returns partial IDs (e.g., "1670"), which are matched against full NNIs in the database (e.g., "MAR06BA000401670").

### Collections

**identifications:**
- `nni`: Full national ID (e.g., "MAR06BA000401670")
- `race`: Breed
- `dtenai`: Birth date
- `sexe`: Sex
- `type`: Type
- `mere`, `pere`, `gpp`, `gmp`, `gpm`, `gmm`: Parent objects

**lactations:**
- `nni`: Cow NNI
- `numlact`: Lactation number
- `dtevel`: Date
- `kg_lait`: Milk (kg)
- `p_mg`: Fat %
- `kg_mg`: Fat (kg)
- `p_prot`: Protein %
- `kg_prot`: Protein (kg)
- `cin_eleveur`: Farmer ID

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx           # Top nav with theme + language switchers
│   ├── CameraComponent.jsx  # Live camera with popup instructions
│   ├── UploadComponent.jsx  # Drag & drop upload
│   └── ResultComponent.jsx  # Results + database info panel
├── context/
│   └── ThemeContext.jsx     # Dark/light theme provider
├── hooks/
│   ├── useCamera.js         # Camera management
│   └── useImageUpload.js    # File upload management
├── services/
│   └── apiService.js        # HF API + MongoDB integration
├── utils/
│   ├── cn.js                # Tailwind class merging
│   └── imageUtils.js        # Image processing
├── i18n/
│   ├── i18n.js              # i18n configuration
│   └── locales/
│       ├── fr.json          # French translations
│       └── ar.json          # Arabic translations
├── App.jsx                  # Main app with stepper flow
├── main.jsx                 # Entry point
└── index.css                # Global styles with CSS variables
```

## Design System

### Themes
- **Dark**: Black background (#0A0A0A), neon green accent (#00FF66)
- **Light**: White background (#F8F9FA), green accent (#00A844)

### CSS Variables
All colors use CSS custom properties for instant theme switching without re-rendering.

## License

MIT
# asehnoune
# asehnoune
