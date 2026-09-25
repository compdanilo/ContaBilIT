package com.contabot.controller;

import com.contabot.dto.DashboardResponse;
import com.contabot.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService service;
    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping public DashboardResponse resumo() { return service.resumo(); }
}
