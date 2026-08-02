CREATE TABLE pix_charges (
    id UUID NOT NULL,
    payment_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_charge_id VARCHAR(255) NOT NULL,
    copy_paste VARCHAR(2000) NOT NULL,
    qr_code_payload VARCHAR(4000) NOT NULL,
    status VARCHAR(30) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_pix_charges PRIMARY KEY (id),
    CONSTRAINT uk_pix_charges_payment UNIQUE (payment_id),
    CONSTRAINT uk_pix_charges_provider_id UNIQUE (provider_charge_id),
    CONSTRAINT fk_pix_charges_payment
        FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE
);

CREATE TABLE pix_webhook_events (
    id UUID NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    provider_charge_id VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_pix_webhook_events PRIMARY KEY (id),
    CONSTRAINT uk_pix_webhook_event_id UNIQUE (event_id)
);

CREATE INDEX idx_pix_webhook_charge ON pix_webhook_events (provider_charge_id);
