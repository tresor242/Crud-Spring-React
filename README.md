# 🚀 Crud Spring React

Monorepo **Full-Stack** contenant :

- `backend/` → API REST Spring Boot (Java 17)
- `frontend/` → Application React (Vite + MUI + Axios)

Application de gestion complète avec :

- Customers  
- Products  
- Orders (avec items et gestion de status)

---

## 📦 Stack Technique

### 🖥 Backend
- Java 17  
- Spring Boot 3  
- Spring Data JPA  
- Jakarta Validation  
- MySQL 8  
- Docker Compose  

### 🌐 Frontend
- React (Vite)  
- Material UI (MUI)  
- Axios  
- React Router  

---


---

## 🚀 Lancer le projet en local

### 1️⃣ Lancer MySQL

```bash
cd backend
docker compose up -d
docker compose ps

### Lancer le Backend

./mvnw spring-boot:run

### Lancer le Frontend

cd frontend
npm install
npm run dev

## 🏗 Architecture
