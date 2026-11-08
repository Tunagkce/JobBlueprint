package com.example.demo.career;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * JSON errors the frontend can show next to form fields:
 * {"message": "...", "fieldErrors": {"company": "must not be blank"}}.
 * Messages are ones this app writes; internal exception details are never sent.
 */
@RestControllerAdvice
public class ApiErrorHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException exception) {
		Map<String, String> fieldErrors = new LinkedHashMap<>();
		exception.getBindingResult().getFieldErrors()
				.forEach(error -> fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));
		return ResponseEntity.badRequest()
				.body(Map.of("message", "Please correct the highlighted fields.", "fieldErrors", fieldErrors));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ResponseEntity<Map<String, Object>> unreadable(HttpMessageNotReadableException exception) {
		return ResponseEntity.badRequest().body(Map.of("message", "The request could not be read."));
	}

	@ExceptionHandler(ResponseStatusException.class)
	ResponseEntity<Map<String, Object>> status(ResponseStatusException exception) {
		String reason = exception.getReason() != null ? exception.getReason()
				: HttpStatus.valueOf(exception.getStatusCode().value()).getReasonPhrase();
		return ResponseEntity.status(exception.getStatusCode()).body(Map.of("message", reason));
	}
}
