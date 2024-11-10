import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./routes/Root";
import { RouterProvider } from "react-router-dom";
import router from "./router";

const root = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  root
);
