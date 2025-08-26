# Video Viewer Application

## Introduction

This project is a full-stack web application built to serve as a comprehensive video management and analytics platform. The application is designed to handle video streaming, provide robust CRUD (Create, Read, Update, Delete) functionality for managing a list of cameras, and offer an interactive analytics dashboard. The core of the architecture is a custom data pipeline that logs user actions in real-time for detailed time-series analysis.

## Features

- **Role-Based Authentication:** A secure login system that grants different access levels based on user roles (`Admin` vs. `User`).
- **Real-time Video Streaming:** A live video player that streams video content via WebSockets. The frontend handles incoming `ArrayBuffer` data and renders it using **Blob** objects.
- **Video Management (CRUD):** Users with admin privileges can add, edit, and delete cameras. The system allows uploading a local video file with each new camera.
- **Custom Data Analytics Pipeline:** A powerful data flow system that logs all user actions (login, CRUD operations, video playback) and stores them for analysis.
- **Analytics Dashboard:** A dedicated dashboard page that presents visual analytics of camera usage, login activity, and other historical data, queried directly from a time-series database.

## Technologies Used

### Frontend
* **React:** For building the user interface and managing component state.
* **Heroicons:** For professional, clean icons.
* **clsx:** For conditionally joining CSS class names.
* **Zustand:** A lightweight state management library for global application state.

### Backend
* **Node.js (Express):** The server-side environment for building RESTful APIs and handling WebSocket connections.
* **Socket.IO:** The library used for real-time, bidirectional communication between the client and server for video streaming.

### Databases & Cache
* **MongoDB:** The primary database for storing camera details, user information, and other application data.
* **PostgreSQL with TimescaleDB:** A robust relational database used to store and query time-series data for the analytics dashboard.
* **Redis:** An in-memory data store used as a high-performance cache to quickly retrieve camera information and reduce database load.

### Messaging & Analytics Pipeline
* **MQTT:** A lightweight messaging protocol used as a message bus to log UI events in real-time.
* **Node-RED:** An event-based visual programming tool that subscribes to the MQTT topic, retrieves data from Redis, and pushes it into TimescaleDB for persistent analytics.

## Project Architecture & Data Flow



1.  **User Actions:** A user performs an action on the React frontend (e.g., adds a new camera, clicks play).
2.  **API & WebSocket Calls:** The frontend sends a REST API call to the Node.js backend for CRUD operations or a WebSocket message for real-time video control.
3.  **Backend Processing:**
    * **CRUD:** The backend saves the data to **MongoDB**.
    * **Caching:** Immediately after saving, it caches the updated data in **Redis**.
    * **Event Logging:** Simultaneously, it publishes an event message to an **MQTT** topic.
4.  **Analytics Pipeline:**
    * **Node-RED:** A Node-RED flow subscribes to the MQTT topic, pulls the necessary data from Redis, and inserts it into **TimescaleDB**.
5.  **Dashboard Display:** When the user navigates to the Dashboard, the frontend queries the Node.js backend, which executes optimized time-series queries against **TimescaleDB** to retrieve and display analytics data.
6.  **Video Stream:** When a user clicks 'Play', the backend reads the video file in `ArrayBuffer` chunks and sends them to the frontend via a dedicated WebSocket connection.

## Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

* Node.js (v18 or higher)
* npm
* MongoDB
* Redis
* PostgreSQL with TimescaleDB extension
* MQTT Broker (e.g., Mosquitto)
* Node-RED

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Vigneshwarrs/VideoViewer_frontend.git](https://github.com/Vigneshwarrs/VideoViewer_frontend.git)
    cd VideoViewer_frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```

### Running the Backend

This repository is for the frontend. You will need to run the corresponding backend application to get the full functionality. Please refer to the backend repository's documentation for setup instructions.

---
### Author
Vigneshwarrs

---
