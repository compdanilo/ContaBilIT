package com.contabot.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> notFound(IllegalArgumentException ex) {
        return body(HttpStatus.NOT_FOUND.value(), ex.getMessage());
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, Object> acessoNegado(org.springframework.security.access.AccessDeniedException ex) {
        return body(HttpStatus.FORBIDDEN.value(), ex.getMessage());
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, Object> falhaAutenticacao(org.springframework.security.core.AuthenticationException ex) {
        return body(HttpStatus.UNAUTHORIZED.value(), "E-mail ou senha inválidos.");
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> conflito(IllegalStateException ex) {
        return body(HttpStatus.CONFLICT.value(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> validation(MethodArgumentNotValidException ex) {
        Map<String, Object> resposta = body(HttpStatus.BAD_REQUEST.value(), "Dados inválidos");
        resposta.put("errors", ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        e -> e.getField(),
                        e -> e.getDefaultMessage(),
                        (a, b) -> a,
                        LinkedHashMap::new)));
        return resposta;
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    public Map<String, Object> arquivoGrande(MaxUploadSizeExceededException ex) {
        return body(HttpStatus.PAYLOAD_TOO_LARGE.value(), "Arquivo(s) excedem o tamanho máximo permitido");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> erroInterno(Exception ex) {
        log.error("Erro não tratado", ex);
        return body(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Erro interno inesperado");
    }

    private Map<String, Object> body(int status, String message) {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("status", status);
        corpo.put("message", message);
        return corpo;
    }
}
