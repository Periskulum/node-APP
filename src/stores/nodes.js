// nodes.js
// This file defines a Svelte store for managing nodes in the application.
// It initializes the store with data from localStorage if available, or with default nodes.
// The store is automatically synchronized with localStorage whenever it changes.

import { writable } from "svelte/store";

// Retrieve nodes from localStorage, if they exist
const storedNodes = localStorage.getItem("nodes");

// Parse the stored nodes or use default nodes if none are found
const initialNodes = storedNodes
  ? JSON.parse(storedNodes)
  : [
      {
        id: 1,
        component: "Node",
        props: { x: 100, y: 100, label: "node.1", color: "#3498db" },
      },
      {
        id: 2,
        component: "Node",
        props: { x: 300, y: 100, label: "node.2", color: "#3498db" },
      },
      {
        id: 3,
        component: "Node",
        props: { x: 500, y: 100, label: "node.3", color: "#3498db" },
      },
      {
        id: 4,
        component: "MakeNode",
        props: { x: 100, y: 300, label: "make.node" },
      },
      {
        id: 5,
        component: "DarkNode",
        props: { x: 300, y: 300, label: "dark.node" },
      },
      {
        id: 6,
        component: "TextNode",
        props: { x: 500, y: 300, content: "hello.world", title: "text.node" },
      },
      {
        id: 7,
        component: "ImageNode",
        props: {
          x: 200,
          y: 500,
          imageUrl: "https://picsum.photos/300/200",
          title: "image.node",
        },
      },
      {
        id: 8,
        component: "CalculatorNode",
        props: { x: 600, y: 500, label: "calc.node" },
      },
      {
        id: 9,
        component: "TodoNode",
        props: { x: 700, y: 400, title: "todo.node", tasks: [] },
      },
    ];

// Create a writable store with the initial nodes
export const nodes = writable(initialNodes);

// Subscribe to changes in the store and update localStorage accordingly
nodes.subscribe((value) => {
  localStorage.setItem("nodes", JSON.stringify(value));
});
