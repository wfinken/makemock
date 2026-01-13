# MakeMock

**MakeMock** is a highly customizable 3D mockup generator for the iPhone 17 Pro Max. Built with React and Three.js (via React Three Fiber), it allows users to showcase their app designs on a realistic 3D model with extensive control over appearance and animation.

## Features

- **Realistic 3D Model**: Accurate rendering of the iPhone 17 Pro Max geometry.
- **Customizable Appearance**:
  - **Body Color**: Change the phone's casing color to match any aesthetic.
  - **Screen Texture**: Upload a URL to display your own app screenshots or designs on the screen.
- **Dynamic Animations**:
  - **Static**: Typical product shot view.
  - **Auto-Rotate**: Smooth 360-degree rotation.
  - **Bounce & Wiggle**: Lively, floating animation ideal for capturing attention.
- **Fine-Tuned Controls**:
  - Adjust rotation speed.
  - Customize bounce height and speed.
  - Control wiggle intensity and speed.
- **Camera Control**:
  - **Orbit Controls**: Interactively rotate, zoom, and pan around the model.
  - **Camera Lock**: Feature to capture and lock specific camera angles.
- **Environment**: Adjust background transparency for easy integration into other designs.

## Getting Started

### Prerequisites

- Node.js (version 18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/makemock.git
   cd makemock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Building for Production

To build the application for deployment:

```bash
npm run build
```

## Tech Stack

- **[React](https://react.dev/)**: UI Library.
- **[Vite](https://vitejs.dev/)**: Build tool and development server.
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)**: React renderer for Three.js.
- **[React Three Drei](https://github.com/pmndrs/drei)**: Useful helpers for React Three Fiber.
- **[Three.js](https://threejs.org/)**: JavaScript 3D library.

## Project Structure

- `src/components/ModelViewer.jsx`: The core component rendering the 3D scene and handling animations.
- `src/components/ConfigPanel.jsx`: UI for user controls (colors, textures, sliders).
- `src/model.js`: Definition of the 3D model geometry.
- `src/App.jsx`: Main application wrapper managing state.

## License

[MIT](LICENSE)
