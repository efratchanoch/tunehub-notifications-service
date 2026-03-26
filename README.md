# TuneHub Notification Service 🔔

This is a microservice designed to handle real-time notifications for the **TuneHub** platform. It acts as a bridge between the Java Backend and the End-User, using a message-driven architecture.

## 🚀 Overview
The service listens to events from the Java Backend via **RabbitMQ**, stores notification history in **MongoDB**, and pushes real-time updates to clients using **Socket.io**.

## 🛠 Tech Stack
* **Runtime:** Node.js (v18+)
* **Message Broker:** RabbitMQ
* **Database:** MongoDB
* **Communication:** Socket.io / WebSockets

---

## 🏗 Infrastructure Setup
This project uses **Docker** to ensure a consistent environment across different machines. 

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* [Node.js](https://nodejs.org/) installed locally (for development).

### Starting the Environment
To spin up the required databases and message brokers, run the following command in your terminal:

```bash
docker-compose up -d
```

## RabbitMQ (The Messenger)
* **Management UI:** http://localhost:15672
* **Username:** `guest`
* **Password:** `guest`
* **Port:** `5672` (AMQP)

## MongoDB (The Storage)
* **Connection String:** `mongodb://localhost:27017/notifications`
* **Default Port:** `27017`

---

## 📝 Features (Under Development)
- [x] Infrastructure Setup (Docker, RabbitMQ, MongoDB)
- [ ] RabbitMQ Consumer Integration
- [ ] Follow Request Notifications
- [ ] Real-time Like/Favorite Counters
- [ ] Admin System Alerts

---

## 🤝 Collaboration
1. Clone the repository.
2. Run `docker-compose up -d`.
3. Check the **RabbitMQ Management UI** to ensure the connection is active.

