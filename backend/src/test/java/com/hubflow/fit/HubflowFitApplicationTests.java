package com.hubflow.fit;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles({"docker", "demo", "test"})
@SpringBootTest
class HubflowFitApplicationTests {

    @Test
    void contextLoads() {
    }
}
