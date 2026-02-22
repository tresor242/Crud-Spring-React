# Crud Spring React

Monorepo contenant :

- `backend/` → API REST Spring Boot (Java 17)
- `frontend/` → Application React (à venir)

Le backend utilise **MySQL via Docker Compose** et expose une API REST.

---

# 📦 Stack Technique

## Backend
- Java 17
- Spring Boot
- Spring Data JPA
- MySQL 8
- Docker Compose
- phpMyAdmin

## Frontend (à venir)
- React
- Axios

---


# 🚀 Lancer le projet

## 🐳 1️⃣ Lancer MySQL avec Docker

Depuis la racine du projet :

```bash
cd backend
docker compose up -d

#Vérifier
docker compose ps
