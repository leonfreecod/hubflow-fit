CREATE TABLE students (
    id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    plan VARCHAR(255) NOT NULL,
    monthly_fee NUMERIC(12, 2) NOT NULL,
    joined_at DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    goal VARCHAR(1000) NOT NULL,
    coach VARCHAR(255) NOT NULL,
    initials VARCHAR(4) NOT NULL,
    progress INTEGER NOT NULL,
    CONSTRAINT pk_students PRIMARY KEY (id),
    CONSTRAINT uk_students_email UNIQUE (email)
);

CREATE TABLE users (
    id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    linked_student_id UUID,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_linked_student UNIQUE (linked_student_id),
    CONSTRAINT fk_users_linked_student
        FOREIGN KEY (linked_student_id) REFERENCES students (id)
);

CREATE TABLE organization_settings (
    id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    pix_key VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    CONSTRAINT pk_organization_settings PRIMARY KEY (id)
);

CREATE TABLE payments (
    id UUID NOT NULL,
    student_id UUID NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at DATE,
    status VARCHAR(255) NOT NULL,
    method VARCHAR(255) NOT NULL,
    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT fk_payments_student
        FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE INDEX idx_payments_student_id ON payments (student_id);
CREATE INDEX idx_payments_due_date ON payments (due_date);

CREATE TABLE schedule_events (
    id UUID NOT NULL,
    student_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    CONSTRAINT pk_schedule_events PRIMARY KEY (id),
    CONSTRAINT fk_schedule_events_student
        FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE INDEX idx_schedule_events_student_id ON schedule_events (student_id);
CREATE INDEX idx_schedule_events_date_time ON schedule_events (date, time);

CREATE TABLE workout_plans (
    id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(255) NOT NULL,
    level VARCHAR(255) NOT NULL,
    weeks INTEGER NOT NULL,
    sessions_per_week INTEGER NOT NULL,
    updated_at DATE NOT NULL,
    description VARCHAR(2000) NOT NULL,
    CONSTRAINT pk_workout_plans PRIMARY KEY (id)
);

CREATE TABLE workout_plan_students (
    workout_plan_id UUID NOT NULL,
    student_id UUID NOT NULL,
    CONSTRAINT pk_workout_plan_students
        PRIMARY KEY (workout_plan_id, student_id),
    CONSTRAINT fk_workout_plan_students_workout_plan
        FOREIGN KEY (workout_plan_id) REFERENCES workout_plans (id),
    CONSTRAINT fk_workout_plan_students_student
        FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE INDEX idx_workout_plan_students_student_id
    ON workout_plan_students (student_id);
