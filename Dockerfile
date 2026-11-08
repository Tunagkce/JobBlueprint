# 1) Build the React app. Vite writes it into src/main/resources/static/app (see frontend/vite.config.ts).
FROM node:24-alpine AS frontend

WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm test && npm run build

# 2) Build the Spring Boot jar with the React app bundled as static resources.
FROM eclipse-temurin:17-jdk AS build

WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src src
COPY --from=frontend /workspace/src/main/resources/static/app src/main/resources/static/app
RUN chmod +x mvnw && ./mvnw -B -DskipTests package

# 3) Runtime image.
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

USER 10001
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
