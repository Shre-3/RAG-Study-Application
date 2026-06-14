import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/upload" replace /> },
      { path: "upload", element: <UploadPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "quiz", element: <QuizPage /> },
      { path: "summary", element: <SummaryPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
