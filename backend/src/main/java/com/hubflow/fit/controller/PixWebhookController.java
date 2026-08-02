package com.hubflow.fit.controller;

import com.hubflow.fit.dto.PixWebhookRequest;
import com.hubflow.fit.service.PixChargeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks/pix")
public class PixWebhookController {

    private final PixChargeService pixChargeService;

    public PixWebhookController(PixChargeService pixChargeService) {
        this.pixChargeService = pixChargeService;
    }

    @PostMapping("/local")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void localWebhook(
            @Valid @RequestBody PixWebhookRequest request,
            @RequestHeader("X-HubFlow-Webhook-Secret") String webhookSecret
    ) {
        pixChargeService.processWebhook(request, webhookSecret);
    }
}
