# syntax=docker/dockerfile:1.7

FROM maven:3.9.11-eclipse-temurin-21-alpine AS build

WORKDIR /workspace

COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode --no-transfer-progress package -Dmaven.test.skip=true

FROM eclipse-temurin:21-jre-alpine

RUN addgroup --system hubflow \
    && adduser --system --ingroup hubflow hubflow

WORKDIR /app

COPY --from=build --chown=hubflow:hubflow /workspace/target/hubflow-fit-api-*.jar app.jar

USER hubflow

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
