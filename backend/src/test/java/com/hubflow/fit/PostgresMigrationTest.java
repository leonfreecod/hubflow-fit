package com.hubflow.fit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ActiveProfiles("test")
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class PostgresMigrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void flywayCreatesTheOperationalSchemaOnRealPostgres() {
        Integer tableCount = jdbcTemplate.queryForObject("""
                SELECT count(*)
                  FROM information_schema.tables
                 WHERE table_schema = 'public'
                   AND table_name IN (
                     'organization_settings', 'students', 'users', 'payments',
                     'schedule_events', 'workout_plans', 'workout_plan_students',
                     'monthly_revenues', 'student_progress_points', 'account_tokens',
                     'workout_sessions', 'workout_exercises', 'workout_completions',
                     'pix_charges', 'pix_webhook_events'
                   )
                """, Integer.class);
        Integer migrationCount = jdbcTemplate.queryForObject("""
                SELECT count(*)
                  FROM flyway_schema_history
                 WHERE success = true
                """, Integer.class);

        assertEquals(15, tableCount);
        assertEquals(7, migrationCount);
    }
}
