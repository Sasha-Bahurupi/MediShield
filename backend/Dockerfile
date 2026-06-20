# Stage 1: Build the application
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy the maven wrapper and pom.xml first to cache dependencies
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Ensure mvnw is executable and download dependencies
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy the source code and build the application
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application using a lightweight JRE
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
