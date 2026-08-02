package com.hubflow.fit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hubflow.fit.domain.PixCharge;
import com.hubflow.fit.repository.PixChargeRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles({"dev", "demo", "test"})
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OperationalFlowsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PixChargeRepository pixChargeRepository;

    @Test
    void cookieSessionRequiresCsrfForMutationsAndCanLogoutSafely() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("admin@hubflow.fit", "hubflow123")))
                .andExpect(status().isOk())
                .andExpect(header().stringValues(
                        HttpHeaders.SET_COOKIE,
                        hasItem(containsString("HttpOnly"))
                ))
                .andExpect(header().stringValues(
                        HttpHeaders.SET_COOKIE,
                        hasItem(containsString("SameSite=Strict"))
                ))
                .andReturn();

        Cookie session = login.getResponse().getCookie("hubflow_session");
        if (session == null) throw new AssertionError("Session cookie was not issued");

        mockMvc.perform(get("/api/auth/me").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@hubflow.fit"));

        mockMvc.perform(post("/api/auth/logout").cookie(session))
                .andExpect(status().isForbidden());

        MvcResult csrfResult = mockMvc.perform(get("/api/auth/csrf").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andReturn();
        String csrfToken = objectMapper.readTree(
                csrfResult.getResponse().getContentAsString()
        ).path("token").asText();
        Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
        if (csrfCookie == null) throw new AssertionError("CSRF cookie was not issued");

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(session, csrfCookie)
                        .header("X-XSRF-TOKEN", csrfToken))
                .andExpect(status().isNoContent())
                .andExpect(header().stringValues(
                        HttpHeaders.SET_COOKIE,
                        hasItem(containsString("Max-Age=0"))
                ));
    }

    @Test
    void studentInvitationActivatesExactlyOnceAndEnablesLogin() throws Exception {
        String adminToken = login("admin@hubflow.fit", "hubflow123");
        String email = "activation-flow@hubflow.fit";
        String created = mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentPayload(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String studentId = objectMapper.readTree(created).path("id").asText();

        String invitation = mockMvc.perform(post("/api/students/{id}/invitation", studentId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activationUrl", containsString("/activate?token=")))
                .andReturn().getResponse().getContentAsString();
        String activationUrl = objectMapper.readTree(invitation).path("activationUrl").asText();
        String activationToken = activationUrl.substring(activationUrl.indexOf("token=") + 6);

        String activationBody = objectMapper.writeValueAsString(new ActivationPayload(
                activationToken,
                "new-strong-password"
        ));
        mockMvc.perform(post("/api/auth/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(activationBody))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(email, "new-strong-password")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("STUDENT"))
                .andExpect(jsonPath("$.user.linkedStudentId").value(studentId));

        mockMvc.perform(post("/api/auth/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(activationBody))
                .andExpect(status().isConflict());
    }

    @Test
    void appliesPaymentRulesAndRejectsScheduleConflictsAcrossRecurrence() throws Exception {
        String token = login("admin@hubflow.fit", "hubflow123");
        String studentId = firstId("/api/students", token);
        String yesterday = LocalDate.now().minusDays(1).toString();

        mockMvc.perform(post("/api/payments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(paymentPayload(studentId, "0", yesterday)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/payments")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(paymentPayload(studentId, "159.90", yesterday)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OVERDUE"));

        String eventDate = LocalDate.now().plusDays(20).toString();
        String eventPayload = schedulePayload(studentId, eventDate, 3);
        String createdEvent = mockMvc.perform(post("/api/schedule")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recurrenceGroupId", notNullValue()))
                .andReturn().getResponse().getContentAsString();
        String recurrenceGroupId = objectMapper.readTree(createdEvent)
                .path("recurrenceGroupId").asText();

        JsonNode schedule = readCollection("/api/schedule", token);
        long occurrenceCount = schedule.valueStream()
                .filter(event -> recurrenceGroupId.equals(
                        event.path("recurrenceGroupId").asText()
                ))
                .count();
        org.junit.jupiter.api.Assertions.assertEquals(3, occurrenceCount);

        mockMvc.perform(post("/api/schedule")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(schedulePayload(studentId, eventDate, 1)))
                .andExpect(status().isConflict());
    }

    @Test
    void persistsWorkoutCompletionAndProcessesPixWebhookIdempotently() throws Exception {
        String token = login("aluno@hubflow.fit", "hubflow123");
        JsonNode workouts = readCollection("/api/workouts", token);
        JsonNode plan = workouts.get(0);
        String planId = plan.path("id").asText();
        String sessionId = plan.path("sessions").get(0).path("id").asText();

        mockMvc.perform(patch("/api/workouts/{planId}/sessions/{sessionId}/complete", planId, sessionId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions[0].completed").value(true));
        mockMvc.perform(delete("/api/workouts/{planId}/sessions/{sessionId}/complete", planId, sessionId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions[0].completed").value(false));

        JsonNode payments = readCollection("/api/payments", token);
        JsonNode openPixPayment = payments.valueStream()
                .filter(payment -> "PIX".equals(payment.path("method").asText()))
                .filter(payment -> !"PAID".equals(payment.path("status").asText()))
                .findFirst()
                .orElseThrow();
        String paymentId = openPixPayment.path("id").asText();
        String firstCharge = mockMvc.perform(post("/api/payments/{id}/pix-charge", paymentId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.simulated").value(true))
                .andReturn().getResponse().getContentAsString();
        String chargeId = objectMapper.readTree(firstCharge).path("id").asText();

        mockMvc.perform(post("/api/payments/{id}/pix-charge", paymentId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(chargeId));

        PixCharge charge = pixChargeRepository.findByPaymentId(UUID.fromString(paymentId))
                .orElseThrow();
        String webhookPayload = objectMapper.writeValueAsString(new WebhookPayload(
                "event-operational-flow",
                charge.getProviderChargeId(),
                "PAID"
        ));
        mockMvc.perform(post("/api/webhooks/pix/local")
                        .header("X-HubFlow-Webhook-Secret", "invalid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isForbidden());

        for (int request = 0; request < 2; request++) {
            mockMvc.perform(post("/api/webhooks/pix/local")
                            .header("X-HubFlow-Webhook-Secret", "hubflow-local-webhook-secret")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(webhookPayload))
                    .andExpect(status().isNoContent());
        }
        mockMvc.perform(get("/api/payments/{id}", paymentId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    private String login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(email, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("token").asText();
    }

    private String firstId(String endpoint, String token) throws Exception {
        return readCollection(endpoint, token).get(0).path("id").asText();
    }

    private JsonNode readCollection(String endpoint, String token) throws Exception {
        String response = mockMvc.perform(get(endpoint)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response);
    }

    private String credentials(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(new Credentials(email, password));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String studentPayload(String email) {
        return """
                {
                  "name": "Aluno Ativação",
                  "email": "%s",
                  "phone": "(11) 98888-0000",
                  "status": "ACTIVE",
                  "plan": "Essencial",
                  "monthlyFee": 189.90,
                  "joinedAt": "%s",
                  "nextBillingDate": "%s",
                  "goal": "Validar ativação",
                  "coach": "Rafael Martins",
                  "initials": "AA",
                  "progress": 10
                }
                """.formatted(email, LocalDate.now(), LocalDate.now().plusMonths(1));
    }

    private String paymentPayload(String studentId, String amount, String dueDate) {
        return """
                {
                  "studentId": "%s",
                  "description": "Teste de regra financeira",
                  "amount": %s,
                  "dueDate": "%s",
                  "status": "PENDING",
                  "method": "PIX"
                }
                """.formatted(studentId, amount, dueDate);
    }

    private String schedulePayload(String studentId, String date, int recurrenceWeeks) {
        return """
                {
                  "studentId": "%s",
                  "title": "Sessão recorrente de teste",
                  "date": "%s",
                  "time": "08:15",
                  "durationMinutes": 45,
                  "location": "Studio Hub",
                  "status": "SCHEDULED",
                  "type": "PERSONAL",
                  "recurrenceWeeks": %d
                }
                """.formatted(studentId, date, recurrenceWeeks);
    }

    private record Credentials(String email, String password) {
    }

    private record ActivationPayload(String token, String password) {
    }

    private record WebhookPayload(String eventId, String providerChargeId, String status) {
    }
}
