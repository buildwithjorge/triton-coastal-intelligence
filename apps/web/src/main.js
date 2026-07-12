import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Module:
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "leaflet/dist/leaflet.css";
import "./styles/index.css";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
