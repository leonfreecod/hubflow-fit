CREATE TABLE account_tokens (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    type VARCHAR(30) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_account_tokens PRIMARY KEY (id),
    CONSTRAINT uk_account_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_account_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_account_tokens_user_type ON account_tokens (user_id, type);
CREATE INDEX idx_account_tokens_expiration ON account_tokens (expires_at);
