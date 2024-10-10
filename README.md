# Svelte Flow Web App

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
8. [Styling](#styling)
9. [Build and Deployment](#build-and-deployment)
10. [Contributing](#contributing)
11. [License](#license)
12. [Acknowledgements](#acknowledgements)
13. [Contact](#contact)

## Introduction

Svelte Flow Web App is an interactive, node-based application built with Svelte and Vite. It allows users to create, manipulate, and connect various types of nodes in a canvas-like environment. This project demonstrates the power and flexibility of Svelte for building complex, interactive user interfaces.

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
svelte-flow-webapp/
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
    git clone https://github.com/your-username/svelte-flow-webapp.git
    cd svelte-flow-webapp
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

### Canvas.svelte
The main canvas component for rendering and managing nodes. It handles the layout and interactions of all nodes.

### Node.svelte
The base node component. It provides the fundamental structure and behavior for all node types.

### DarkNode.svelte
A node for toggling dark mode. It changes the application's theme between light and dark modes.

### MakeNode.svelte
A node for creating new nodes. It provides an interface for users to select node types and configure their properties.

### TextNode.svelte
A node for displaying and editing text content. It includes a text area for user input and displays the content on the canvas.

### ImageNode.svelte
A node for displaying images. Users can specify an image URL, and the node will render the image on the canvas.

### CalculatorNode.svelte
A node with basic calculator functionalities. It allows users to perform simple arithmetic operations.

### TodoNode.svelte
A node for managing a todo list. Users can add, edit, and delete tasks, and set due dates and priorities.

### ContextMenu.svelte
A context menu for node and canvas interactions. It provides additional options such as deleting nodes, editing properties, and more.

### Modal.svelte
A reusable modal component. It can be used for various purposes, such as displaying forms or additional information.

### NodeFactory.svelte
A component for creating and managing node types. It provides an interface for users to select node types and configure their properties.

### SearchBar.svelte
A search functionality for finding nodes. It allows users to quickly locate and navigate to specific nodes on the canvas.

## State Management

The application uses Svelte stores for state management:

### nodes.js
Manages the state of all nodes on the canvas. It includes functions for adding, updating, and deleting nodes, and persists the state in local storage.

### darkMode.js
Manages the dark mode state. It provides functions for toggling the theme between light and dark modes.

### panStore.js
Manages the canvas panning state. It tracks the position of the canvas and provides functions for panning and zooming.

### selectionStore.js
Manages the state of selected nodes. It tracks which nodes are currently selected and provides functions for selecting and deselecting nodes.

### zIndex.js
Manages the z-index of nodes for proper layering. It ensures that nodes are rendered in the correct order based on their z-index.

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

## Contact

For any inquiries or issues, please contact [your-email@example.com].

