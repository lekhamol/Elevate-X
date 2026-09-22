package com.elevatortwin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ElevatorTwinApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElevatorTwinApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🚀 ELEVATOR SAFETY DIGITAL TWIN SPRING BOOT BACKEND IS ONLINE!");
        System.out.println("📡 Telemetry REST Endpoint: http://localhost:8080/api/telemetry");
        System.out.println("🏢 Elevator Twin Endpoint: http://localhost:8080/api/elevator/state");
        System.out.println("🚨 Safety Alerts Endpoint:  http://localhost:8080/api/alerts");
        System.out.println("⚙️  H2 Console (fallback):   http://localhost:8080/h2-console");
        System.out.println("==================================================================");
    }
}
