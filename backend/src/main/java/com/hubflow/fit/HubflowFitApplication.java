package com.hubflow.fit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HubflowFitApplication {
    public static void main(String[] args) {
        SpringApplication.run(HubflowFitApplication.class, args);
    }
}
