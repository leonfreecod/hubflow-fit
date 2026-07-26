CREATE TABLE monthly_revenues (
    id UUID NOT NULL,
    month_label VARCHAR(20) NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL,
    expenses NUMERIC(12, 2) NOT NULL,
    display_order INTEGER NOT NULL,
    CONSTRAINT pk_monthly_revenues PRIMARY KEY (id)
);

CREATE UNIQUE INDEX uk_monthly_revenues_display_order
    ON monthly_revenues (display_order);

CREATE TABLE student_progress_points (
    id UUID NOT NULL,
    student_id UUID NOT NULL,
    month_label VARCHAR(20) NOT NULL,
    performance INTEGER NOT NULL,
    consistency INTEGER NOT NULL,
    display_order INTEGER NOT NULL,
    CONSTRAINT pk_student_progress_points PRIMARY KEY (id),
    CONSTRAINT fk_student_progress_points_student
        FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE UNIQUE INDEX uk_student_progress_points_student_order
    ON student_progress_points (student_id, display_order);
