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
- **Basic Node**: A simple node with basic properties and a label.
- **Make Node**: A node that allows users to create new basic nodes.
- **Dark Node**: A node that toggles the application's dark mode.
- **Text Node**: A node for displaying and editing simple text content.
- **Image Node**: A node for displaying images.
- **Calculator Node**: A node with basic calculator functionalities.
- **Todo Node**: A node for managing a todo list.
- **Budget Node**: A comprehensive budgeting tool for tracking income and expenses, featuring:
  - Transaction history with categories
  - Income vs. expenses tracking
  - Real-time balance calculations
  - Date-based transaction logging
- **Debt Node**: A debt management tool with detailed tracking features:
  - Credit card and loan tracking
  - Credit utilization monitoring
  - Minimum payment calculations
  - Total debt overview
  - Individual debt item management

### Node Interaction Features
- **Multi-Node Selection**: Select multiple nodes using Ctrl/Cmd+Click
- **Node Locking**: Lock nodes to prevent accidental movement
- **Node Color Customization**: Change colors of individual or multiple selected nodes
- **Bulk Operations**: Apply changes to multiple selected nodes simultaneously
- **Node Labels**: Custom labels for better organization
- **Z-Index Management**: Control which nodes appear on top

### Theme and Visual Customization
- **Dark Mode Toggle**: Switch between light and dark modes using the Dark Node
- **Canvas Color**: Customize the canvas background color for both light and dark modes
- **Node Colors**: Personalize node colors via context menu
- **Visual Feedback**: Highlights and shadows for selected and interactive states

### Node Factory Panel
- **Resizable Interface**: Drag the panel edge to adjust width
- **Collapsible Design**: Toggle panel visibility with tab
- **Persistent Width**: Remember panel size between sessions
- **Quick Access**: Efficiently create new nodes with drag-and-drop

### Canvas Navigation
- **Pan Control**: Navigate large canvas layouts
- **Zoom Functionality**: Adjust view scale for detail work
- **Search Navigation**: Quickly locate specific nodes
- **Context Menus**: Right-click access to common actions

### Management Tools
- **Local Storage**: Persistent storage of node layouts and settings
- **Context Menus**: Advanced node and canvas operations
- **Search Functionality**: Quick node location and navigation
- **Responsive Design**: Adapts to different screen sizes
- **State Management**: Comprehensive Svelte store system

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
│   │   ├── Node.svelte
│   │   ├── NodeFactory.svelte
│   │   ├── SearchBar.svelte
│   │   ├── TextNode.svelte
│   │   ├── TodoNode.svelte
│   │   ├── BudgetNode.svelte
│   │   ├── DebtNode.svelte
│   │   ├── CalculatorNode.svelte
│   │   └── debt/
│   │       ├── DebtForm.svelte
│   │       ├── DebtItem.svelte
│   │       └── DebtItemEditor.svelte
│   ├── stores/
│   │   ├── darkMode.js
│   │   ├── nodeFactoryStore.js
│   │   ├── nodes.js
│   │   ├── panStore.js
│   │   ├── selectionStore.js
│   │   ├── zoomStore.js
│   │   └── zIndex.js
│   ├── utils/
│   │   ├── contextMenuHandlers.js
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
- Use Ctrl/Cmd+Click to select multiple nodes
- Right-click nodes or canvas for context menu options
- Drag the node factory tab to resize the panel
- Lock/unlock nodes to prevent accidental movement
- Use the zoom controls to adjust the view
- Customize node and canvas colors
- Create and manage budgets with the Budget Node
- Track debts and credit utilization with the Debt Node
- Use the search bar to quickly find nodes
- Save and load your workspace automatically

## Components

### Core Components
- **Canvas.svelte**: Main canvas component for rendering and managing nodes.
- **Node.svelte**: Base node component providing structure and behavior for all node types.
- **NodeFactory.svelte**: Manages node creation and factory panel interface.

### Utility Nodes
- **DarkNode.svelte**: Toggles dark mode and theme settings.
- **MakeNode.svelte**: Interface for creating new nodes with configurable properties.
- **SearchBar.svelte**: Quick node location and navigation.

### Content Nodes
- **TextNode.svelte**: Text content display and editing.
- **ImageNode.svelte**: Image display from URLs.
- **CalculatorNode.svelte**: Basic arithmetic operations.
- **TodoNode.svelte**: Task management and lists.

### Financial Management Nodes
- **BudgetNode.svelte**: Complete budget tracking and management.
- **DebtNode.svelte**: Debt and credit tracking system.
- **DebtForm.svelte**: Debt entry and editing interface.
- **DebtItem.svelte**: Individual debt item display and management.

### Interface Components
- **ContextMenu.svelte**: Right-click menu options.

## State Management

The application uses Svelte stores for state management:

- **nodes.js**: Central node state management
- **darkMode.js**: Theme state control
- **panStore.js**: Canvas navigation state
- **zoomStore.js**: View scaling control
- **selectionStore.js**: Multi-node selection state
- **zIndex.js**: Node layering management
- **nodeFactoryStore.js**: Factory panel state

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

