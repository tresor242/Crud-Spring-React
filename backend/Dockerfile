# =========================
# 1) BUILD STAGE
# =========================
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Cache
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline

# Build
COPY src src
RUN ./mvnw -q -DskipTests package

# =========================
# 2) RUNTIME STAGE
# =========================
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app


RUN useradd -r -u 10001 -g root appuser

COPY --from=build /app/target/*.jar /app/app.jar

ENV SERVER_PORT=8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080


HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

USER appuser

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar --server.port=${SERVER_PORT}"]