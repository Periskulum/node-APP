# node.app
## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
5. [Usage](#usage)
6. [Components](#components)
7. [State Management](#state-management)
8. [Detailed Component Interactions](#detailed-component-interactions)
9. [Styling](#styling)
10. [Build and Deployment](#build-and-deployment)
11. [Contributing](#contributing)
12. [License](#license)
13. [Acknowledgements](#acknowledgements)


## Introduction
node.app is an interactive, node-based application built with Svelte and Vite. It allows users to create, manipulate, and connect various types of nodes in a canvas-like environment. This project demonstrates the power and flexibility of Svelte for building complex, interactive user interfaces.

## Features

### Interactive Canvas with Draggable Nodes
The core feature of the application is an interactive canvas where users can drag and drop nodes. Each node can be moved around freely, allowing for a highly customizable layout.

### Multiple Node Types
The application supports various node types, each with unique functionalities:
- **Basic Node**: A simple node with basic properties.
- **Make Node**: A node that allows users to create new nodes.
- **Dark Node**: A node that toggles the application's dark mode.
- **Text Node**: A node for displaying and editing text content.
- **Image Node**: A node for displaying images.
- **Calculator Node**: A node with basic calculator functionalities.
- **Todo Node**: A node for managing a todo list.

### Node Factory
The Node Factory component provides an interface for users to create new nodes. It includes options for selecting node types and configuring their initial properties.

### Dark Mode Toggle
Users can switch between light and dark modes using the Dark Node. This feature enhances the user experience by providing a comfortable viewing option in different lighting conditions.

### Context Menu
A context menu is available for both nodes and the canvas. Users can right-click to access additional options such as deleting nodes, editing properties, and more.

### Search Functionality
The Search Bar component allows users to quickly find and navigate to specific nodes on the canvas. This is particularly useful in large projects with many nodes.

### Local Storage Persistence
The state of the nodes is saved in the browser's local storage. This ensures that the user's layout and configurations are preserved across sessions.

### Responsive Design
The application is designed to be responsive, ensuring a seamless experience across different devices and screen sizes.

## Project Structure

```
node-APP/
├── src/
│   ├── components/
│   │   ├── Canvas.svelte
│   │   ├── ContextMenu.svelte
│   │   ├── DarkNode.svelte
│   │   ├── ImageNode.svelte
│   │   ├── MakeNode.svelte
│   │   ├── Modal.svelte
│   │   ├── Node.svelte
│   │   ├── NodeFactory.svelte
│   │   ├── SearchBar.svelte
│   │   ├── TextNode.svelte
│   │   ├── TodoNode.svelte
│   │   └── CalculatorNode.svelte
│   ├── stores/
│   │   ├── darkMode.js
│   │   ├── nodes.js
│   │   ├── panStore.js
│   │   ├── selectionStore.js
│   │   └── zIndex.js
│   ├── utils/
│   │   ├── contextMenuHandlers.js
│   │   ├── modalHandlers.js
│   │   ├── NodeManager.js
│   │   └── nodeHandlers.js
│   ├── App.svelte
│   ├── app.css
│   └── main.js
├── public/
│   └── (static assets)
├── index.html
├── package.json
├── vite.config.js
├── svelte.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:
    ```
    git clone https://github.com/Periskulum/node-APP.git
    cd node-APP
    ```

2. Install dependencies:
    ```
    npm install
    ```

### Running the Application

To start the development server:

```
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

- Drag nodes from the node factory onto the canvas
- Use the context menu (right-click) on nodes or the canvas for additional options
- Toggle dark mode using the dark mode node
- Search for nodes using the search bar at the top of the canvas
- Create new nodes using the make node
- Interact with specialized nodes like the calculator, todo, or text nodes

## Components

- **Canvas.svelte**: Main canvas component for rendering and managing nodes.
- **Node.svelte**: Base node component providing structure and behavior for all node types.
- **DarkNode.svelte**: Toggles dark mode, changing the application's theme.
- **MakeNode.svelte**: Interface for creating new nodes with configurable properties.
- **TextNode.svelte**: Displays and edits text content with a text area.
- **ImageNode.svelte**: Renders images specified by URL.
- **CalculatorNode.svelte**: Performs basic arithmetic operations.
- **TodoNode.svelte**: Manages a todo list with task management features.
- **ContextMenu.svelte**: Provides additional options for node and canvas interactions.
- **Modal.svelte**: Reusable component for displaying forms or information.
- **NodeFactory.svelte**: Manages node types and their properties.
- **SearchBar.svelte**: Allows quick location and navigation to specific nodes.

## State Management

The application uses Svelte stores:

- **nodes.js**: Manages node state, including adding, updating, deleting, and persisting in local storage.
- **darkMode.js**: Toggles the theme between light and dark modes.
- **panStore.js**: Tracks canvas position for panning and zooming.
- **selectionStore.js**: Tracks selected nodes and manages selection state.
- **zIndex.js**: Ensures correct node layering based on z-index.

## Detailed Component Interactions

### Communication

#### Parent-Child Communication
- **Canvas.svelte**: Acts as the parent component, managing the layout and interactions of all nodes. It passes down properties and event handlers to child components like **Node.svelte**.
- **NodeFactory.svelte**: Communicates with **Canvas.svelte** to add new nodes. It emits events that **Canvas.svelte** listens to for creating nodes.

#### Data Flow
- **Node.svelte**: Receives data from **Canvas.svelte** and updates its state based on user interactions. It can also emit events to notify **Canvas.svelte** of changes.
- **SearchBar.svelte**: Emits events to **Canvas.svelte** to highlight or navigate to specific nodes.

### Event Handling

#### Emitted Events
- **Node.svelte**: Emits events like `nodeMove`, `nodeClick`, and `nodeDelete` to **Canvas.svelte**.
- **Canvas.svelte**: Listens for events from **Node.svelte** and **NodeFactory.svelte** to update the state of the canvas and nodes.

#### Event Handling in Parent Components
- **Canvas.svelte**: Handles events emitted by **Node.svelte** to update the position, selection, or deletion of nodes. It also handles events from **NodeFactory.svelte** to add new nodes.

### State Changes

#### State Dependencies
- **nodes.js**: The central store for managing the state of all nodes. Changes in this store affect all components that depend on node data.
- **darkMode.js**: Affects the theme of the entire application. Components like **DarkNode.svelte** can toggle this state, affecting the appearance of all components.

#### Propagation of State Changes
- When a node's position or properties are updated in **Node.svelte**, these changes are propagated to **Canvas.svelte** and then to the **nodes.js** store.
- Changes in the **nodes.js** store are reflected across all components that subscribe to this store, ensuring a consistent state throughout the application.


## Styling

Styles are scoped to individual components using Svelte's built-in style encapsulation. Global styles are defined in `src/app.css`.

## Build and Deployment

To build the application for production:

```
npm run build
```

This will generate a production-ready build in the `dist` directory.

To preview the production build:

```
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [Svelte](https://svelte.dev/)
- [Vite](https://vitejs.dev/)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

