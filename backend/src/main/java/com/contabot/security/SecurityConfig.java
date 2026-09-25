package com.contabot.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtService jwtService) {
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, authEx) -> {
                    res.setStatus(401);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"status\":401,\"message\":\"Autenticação necessária.\"}");
                })
                .accessDeniedHandler((req, res, accessDeniedEx) -> {
                    res.setStatus(403);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"status\":403,\"message\":\"Acesso negado.\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/clientes").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.POST, "/api/v1/clientes").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/clientes/*").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/clientes/*").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.POST, "/api/v1/competencias").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/competencias/*/status").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/documentos/*").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.POST, "/api/v1/pendencias").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/pendencias/*/status").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.POST, "/api/v1/relatorios/**").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/lancamentos/*").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers("/api/v1/dashboard").hasAnyRole("ADMIN", "CONTADOR")
                .requestMatchers("/api/v1/usuarios/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthFilter(jwtService, userDetailsService), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
