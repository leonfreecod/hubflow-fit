package com.hubflow.fit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hubflow.fit.config.DevDataInitializer;
import com.hubflow.fit.repository.AppUserRepository;
import com.hubflow.fit.repository.WorkoutPlanRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles({"dev", "demo", "test"})
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:hubflow-portfolio-test;"
                + "MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "app.portfolio-demo.enabled=true",
        "app.portfolio-demo.email=demo@hubflow.fit",
        "app.portfolio-demo.password=123456"
})
@AutoConfigureMockMvc
class PortfolioDemoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private WorkoutPlanRepository workoutPlanRepository;

    @Autowired
    private DevDataInitializer devDataInitializer;

    @Test
    void seedsPublicCredentialsWithReadOnlyAdminAccess() throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "demo@hubflow.fit",
                                  "password": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.readOnly").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(response).path("token").asText();
        String bearer = "Bearer " + token;

        mockMvc.perform(get("/api/students").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6));

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(
                        "Esta conta de demonstração é somente leitura. Alterações estão desativadas."
                ));

        org.junit.jupiter.api.Assertions.assertEquals(1, appUserRepository.count());
    }

    @Test
    @Transactional
    void canBackfillWorkoutSessionsWhenTheDemoSeedRunsAgain() {
        var existingPlan = workoutPlanRepository.findAll().getFirst();
        existingPlan.getSessions().clear();
        workoutPlanRepository.saveAndFlush(existingPlan);

        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() ->
                devDataInitializer.run(new DefaultApplicationArguments(new String[0]))
        );

        var reloadedPlan = workoutPlanRepository.findById(existingPlan.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(2, reloadedPlan.getSessions().size());
    }
}
