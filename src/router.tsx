import RootPage from "./routes/Root";
import App from "./routes/Root";
import React from "react";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootPage />,
  },
]);

export default router;
