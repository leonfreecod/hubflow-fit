package com.hubflow.fit.repository;

import com.hubflow.fit.domain.AccountToken;
import com.hubflow.fit.domain.AccountTokenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountTokenRepository extends JpaRepository<AccountToken, UUID> {
    Optional<AccountToken> findByTokenHashAndType(String tokenHash, AccountTokenType type);
    void deleteAllByUserIdAndType(UUID userId, AccountTokenType type);
}
