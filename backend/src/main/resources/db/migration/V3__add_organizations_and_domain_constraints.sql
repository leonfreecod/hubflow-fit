ALTER TABLE students ADD COLUMN organization_id UUID;
ALTER TABLE users ADD COLUMN organization_id UUID;
ALTER TABLE users ADD COLUMN account_status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL;
ALTER TABLE workout_plans ADD COLUMN organization_id UUID;
ALTER TABLE monthly_revenues ADD COLUMN organization_id UUID;

UPDATE students
SET organization_id = (SELECT id FROM organization_settings ORDER BY id LIMIT 1)
WHERE organization_id IS NULL;

UPDATE users
SET organization_id = (SELECT id FROM organization_settings ORDER BY id LIMIT 1)
WHERE organization_id IS NULL;

UPDATE workout_plans
SET organization_id = (SELECT id FROM organization_settings ORDER BY id LIMIT 1)
WHERE organization_id IS NULL;

UPDATE monthly_revenues
SET organization_id = (SELECT id FROM organization_settings ORDER BY id LIMIT 1)
WHERE organization_id IS NULL;

ALTER TABLE students ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE monthly_revenues ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE students
    ADD CONSTRAINT fk_students_organization
        FOREIGN KEY (organization_id) REFERENCES organization_settings (id);
ALTER TABLE users
    ADD CONSTRAINT fk_users_organization
        FOREIGN KEY (organization_id) REFERENCES organization_settings (id);
ALTER TABLE workout_plans
    ADD CONSTRAINT fk_workout_plans_organization
        FOREIGN KEY (organization_id) REFERENCES organization_settings (id);
ALTER TABLE monthly_revenues
    ADD CONSTRAINT fk_monthly_revenues_organization
        FOREIGN KEY (organization_id) REFERENCES organization_settings (id);

ALTER TABLE students DROP CONSTRAINT uk_students_email;
ALTER TABLE students
    ADD CONSTRAINT uk_students_organization_email UNIQUE (organization_id, email);

DROP INDEX uk_monthly_revenues_display_order;
CREATE UNIQUE INDEX uk_monthly_revenues_organization_order
    ON monthly_revenues (organization_id, display_order);

CREATE INDEX idx_students_organization ON students (organization_id);
CREATE INDEX idx_users_organization ON users (organization_id);
CREATE INDEX idx_workout_plans_organization ON workout_plans (organization_id);

ALTER TABLE students
    ADD CONSTRAINT ck_students_monthly_fee CHECK (monthly_fee >= 0);
ALTER TABLE students
    ADD CONSTRAINT ck_students_progress CHECK (progress BETWEEN 0 AND 100);

ALTER TABLE payments
    ADD CONSTRAINT ck_payments_amount CHECK (amount > 0);
ALTER TABLE payments
    ADD CONSTRAINT ck_payments_paid_state CHECK (
        (status = 'PAID' AND paid_at IS NOT NULL)
        OR (status <> 'PAID' AND paid_at IS NULL)
    );

ALTER TABLE schedule_events
    ADD CONSTRAINT ck_schedule_duration CHECK (duration_minutes BETWEEN 1 AND 1440);

ALTER TABLE workout_plans
    ADD CONSTRAINT ck_workout_weeks CHECK (weeks BETWEEN 1 AND 520);
ALTER TABLE workout_plans
    ADD CONSTRAINT ck_workout_sessions CHECK (sessions_per_week BETWEEN 1 AND 7);

ALTER TABLE monthly_revenues
    ADD CONSTRAINT ck_monthly_revenue_values CHECK (revenue >= 0 AND expenses >= 0);

ALTER TABLE student_progress_points
    ADD CONSTRAINT ck_progress_values CHECK (
        performance BETWEEN 0 AND 100 AND consistency BETWEEN 0 AND 100
    );
