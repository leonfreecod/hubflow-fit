CREATE TABLE workout_sessions (
    id UUID NOT NULL,
    workout_plan_id UUID NOT NULL,
    week_number INTEGER NOT NULL,
    day_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    instructions VARCHAR(2000) NOT NULL,
    CONSTRAINT pk_workout_sessions PRIMARY KEY (id),
    CONSTRAINT fk_workout_sessions_plan
        FOREIGN KEY (workout_plan_id) REFERENCES workout_plans (id) ON DELETE CASCADE,
    CONSTRAINT ck_workout_session_week CHECK (week_number BETWEEN 1 AND 520),
    CONSTRAINT ck_workout_session_day CHECK (day_order BETWEEN 1 AND 7)
);

CREATE INDEX idx_workout_sessions_plan ON workout_sessions (workout_plan_id);

CREATE TABLE workout_exercises (
    id UUID NOT NULL,
    workout_session_id UUID NOT NULL,
    display_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    prescription VARCHAR(1000) NOT NULL,
    rest_seconds INTEGER NOT NULL,
    CONSTRAINT pk_workout_exercises PRIMARY KEY (id),
    CONSTRAINT fk_workout_exercises_session
        FOREIGN KEY (workout_session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
    CONSTRAINT ck_workout_exercise_rest CHECK (rest_seconds BETWEEN 0 AND 86400)
);

CREATE INDEX idx_workout_exercises_session ON workout_exercises (workout_session_id);

CREATE TABLE workout_completions (
    id UUID NOT NULL,
    workout_session_id UUID NOT NULL,
    student_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_workout_completions PRIMARY KEY (id),
    CONSTRAINT fk_workout_completions_session
        FOREIGN KEY (workout_session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_workout_completions_student
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT uk_workout_completion_student_session
        UNIQUE (student_id, workout_session_id)
);

CREATE INDEX idx_workout_completions_student ON workout_completions (student_id);
