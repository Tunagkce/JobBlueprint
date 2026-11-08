package com.example.demo.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

/**
 * Maps the signed-in identity to the key that owns that user's data rows.
 * Every user-owned table filters by this key, so it is the single source of
 * truth for data isolation between accounts.
 */
public final class OwnerKeys {

	private OwnerKeys() {
	}

	public static String of(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign-in is required");
		}
		if (authentication.getPrincipal() instanceof AppAccount account && account.getId() != null) {
			return "local:" + account.getId();
		}
		if (authentication instanceof OAuth2AuthenticationToken oauth) {
			return "oauth:" + oauth.getAuthorizedClientRegistrationId() + ":" + oauth.getName();
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unsupported sign-in identity");
	}
}
