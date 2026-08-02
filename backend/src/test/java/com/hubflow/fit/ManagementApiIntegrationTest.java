package com.hubflow.fit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles({"dev", "demo", "test"})
@SpringBootTest
@AutoConfigureMockMvc
class ManagementApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void adminCanListCreateAndDeleteStudents() throws Exception {
        String token = login("admin@hubflow.fit");

        mockMvc.perform(get("/api/students").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6));

        mockMvc.perform(get("/api/dashboard/monthly-revenue")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[5].month").value("Jul"));

        String createdBody = mockMvc.perform(post("/api/students")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Aluno Integração",
                                  "email": "integracao@hubflow.fit",
                                  "phone": "(11) 90000-0000",
                                  "status": "ACTIVE",
                                  "plan": "Essencial",
                                  "monthlyFee": 189.90,
                                  "joinedAt": "2026-07-25",
                                  "nextBillingDate": "2026-08-25",
                                  "goal": "Validar a integração",
                                  "coach": "Rafael Martins",
                                  "initials": "AI",
                                  "progress": 20
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.email").value("integracao@hubflow.fit"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(createdBody).path("id").asText();
        mockMvc.perform(delete("/api/students/{id}", id)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    void studentOnlySeesOwnRecordsAndCannotCreateStudents() throws Exception {
        String token = login("aluno@hubflow.fit");

        mockMvc.perform(get("/api/students").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("mariana.costa@email.com"));

        mockMvc.perform(get("/api/payments").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].studentName").value(
                        org.hamcrest.Matchers.everyItem(
                                org.hamcrest.Matchers.equalTo("Mariana Costa")
                        )
                ));

        mockMvc.perform(get("/api/dashboard/student-progress")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[5].consistency").value(88));

        mockMvc.perform(post("/api/students")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Tentativa",
                                  "email": "tentativa@hubflow.fit",
                                  "phone": "(11) 90000-0001",
                                  "status": "ACTIVE",
                                  "plan": "Essencial",
                                  "monthlyFee": 1.00,
                                  "joinedAt": "2026-07-25",
                                  "nextBillingDate": "2026-08-25",
                                  "goal": "Sem permissão",
                                  "coach": "Rafael Martins",
                                  "initials": "TE",
                                  "progress": 0
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    void deletingStudentAlsoRemovesDependentRecordsAndPortalAccount() throws Exception {
        String token = login("admin@hubflow.fit");
        String studentsResponse = mockMvc.perform(get("/api/students")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode students = objectMapper.readTree(studentsResponse);
        String marianaId = null;
        for (JsonNode student : students) {
            if ("mariana.costa@email.com".equals(student.path("email").asText())) {
                marianaId = student.path("id").asText();
                break;
            }
        }
        if (marianaId == null) {
            throw new AssertionError("Mariana seed was not found");
        }

        mockMvc.perform(delete("/api/students/{id}", marianaId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/payments").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.studentId == '%s')]".formatted(marianaId)).isEmpty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "aluno@hubflow.fit",
                                  "password": "hubflow123"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    private String login(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "hubflow123"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode body = objectMapper.readTree(response);
        return body.path("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
