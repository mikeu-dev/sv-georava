# Georava

**Georava** is a professional-grade Geospatial Toolkit designed for power users, analysts, and developers. Built with a focus on precision, performance, and a "Technical-Dense" industrial aesthetic.

![Georava UI](/docs/screenshots/hero.png)

## 🚀 Vision

Moving away from generic SaaS dashboards, Georava is designed as a **high-precision instrument**. It prioritizes information density, professional typography, and a "Command Center" layout to minimize friction in geospatial workflows.

## 🛠️ Core Technology Stack

- **Framework**: [Svelte 5 (Runes)](https://svelte.dev) & [SvelteKit 2](https://kit.svelte.dev)
- **Map Engine**: [OpenLayers 10+](https://openlayers.org)
- **3D Engine**: [CesiumJS](https://cesium.com/platform/cesiumjs/) (via OpenLayers-Cesium)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (Industrial Minimalist theme)
- **Icons**: [Lucide Svelte](https://lucide.dev)
- **Components**: [Bits UI](https://bits-ui.com) (Headless components)
- **Database**: [Drizzle ORM](https://orm.drizzle.team) & [PostgreSQL](https://www.postgresql.org)

## ✨ Key Features

- **Technical-Dense UI**: Industrial minimalist design with `2px` precision geometry and Inter/JetBrains Mono typography.
- **Floating Islands Architecture**: Organized map controls grouped by function (Navigation, Tools, Engine, Config).
- **Dual-View Inspection**: Seamlessly switch between GeoJSON code editing and a structured property inspector.
- **Unified Activity Bar**: Rapid mode switching for JSON editing, Layer management, and Spatial analysis.
- **Advanced Tools**:
    - High-performance GeoJSON/TopoJSON rendering.
    - Precision measurement tools (Distance & Area).
    - Map screenshot/export engine.
    - Integrated Location Search (Nominatim).
    - 2D/3D synchronized view switching.

## 📦 Project Structure

```text
src/
 ├── lib/
 │    ├── components/
 │    │    ├── atoms/       # Base UI elements (Button, Input)
 │    │    ├── molecules/   # Combined elements (IconButton, Field)
 │    │    ├── organisms/   # Complex units (MapCanvas, Sidebar)
 │    │    └── templates/   # Page layouts (MapWorkspace)
 │    ├── stores/           # Svelte 5 reactive states
 │    ├── services/         # API & GIS logic (nominatim, url-state)
 │    └── utils/            # Shared utilities (cn, math)
 └── routes/                # SvelteKit App Router
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v20+)
- [pnpm](https://pnpm.io)

### Installation

```bash
# Clone the repository
git clone https://github.com/mikeu-dev/sv-georava.git

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Building for Production

```bash
pnpm build
pnpm preview
```

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Crafted with precision by the Georava Team.*
