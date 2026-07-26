package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.UserRole;
import com.hubflow.fit.exception.ForbiddenException;
import com.hubflow.fit.repository.AppUserRepository;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CurrentUserService {

    private static final String AUTHENTICATION_REQUIRED = "Autenticação necessária.";
    private static final String ADMIN_REQUIRED = "Esta operação é restrita a administradores.";
    private static final String STUDENT_LINK_REQUIRED =
            "O usuário autenticado não possui um aluno vinculado.";

    private final AppUserRepository appUserRepository;

    public CurrentUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public AppUser requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException(AUTHENTICATION_REQUIRED);
        }

        return appUserRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new AuthenticationCredentialsNotFoundException(AUTHENTICATION_REQUIRED)
                );
    }

    public boolean isAdmin(AppUser user) {
        return user.getRole() == UserRole.ADMIN;
    }

    public void requireAdmin(AppUser user) {
        if (!isAdmin(user)) {
            throw new ForbiddenException(ADMIN_REQUIRED);
        }
    }

    public UUID requireLinkedStudentId(AppUser user) {
        if (user.getLinkedStudent() == null || user.getLinkedStudent().getId() == null) {
            throw new ForbiddenException(STUDENT_LINK_REQUIRED);
        }
        return user.getLinkedStudent().getId();
    }

    public void requireStudentAccess(AppUser user, UUID studentId) {
        if (isAdmin(user)) {
            return;
        }
        if (!requireLinkedStudentId(user).equals(studentId)) {
            throw new ForbiddenException(
                    "Você não tem permissão para acessar os dados deste aluno."
            );
        }
    }
}
