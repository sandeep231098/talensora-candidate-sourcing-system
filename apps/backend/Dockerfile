FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY . ./
RUN mvn --batch-mode --no-transfer-progress -pl talensora-api -am clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
RUN groupadd --system talensora && useradd --system --gid talensora --home-dir /app talensora
WORKDIR /app
COPY --from=build --chown=talensora:talensora /workspace/talensora-api/target/talensora-api-0.0.1-SNAPSHOT.jar /app/talensora-api.jar
USER talensora
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/urandom"
EXPOSE 9093
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 CMD bash -c 'exec 3<>/dev/tcp/127.0.0.1/9093 && printf "GET /actuator/health HTTP/1.0\r\n\r\n" >&3 && grep -q "200" <&3'
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/talensora-api.jar"]
