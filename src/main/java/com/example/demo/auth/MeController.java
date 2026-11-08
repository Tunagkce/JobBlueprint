package com.example.demo.auth;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Who is signed in, for display only (e.g. the top bar). Never used for authorization. */
@RestController
public class MeController {

	public record Me(String name, String provider) {
	}

	@GetMapping("/api/me")
	public Me me(Authentication authentication) {
		OwnerKeys.of(authentication); // rejects anonymous or unsupported identities
		if (authentication.getPrincipal() instanceof AppAccount account) {
			return new Me(account.getEmail(), "email");
		}
		OAuth2AuthenticationToken oauth = (OAuth2AuthenticationToken) authentication;
		Map<String, Object> attributes = oauth.getPrincipal().getAttributes();
		// Google/LinkedIn expose "email"; GitHub may hide it, so fall back to the username.
		// (GitHub sends "email": null rather than omitting it, hence the explicit null checks.)
		for (String key : new String[] { "email", "login", "name" }) {
			if (attributes.get(key) instanceof String value && !value.isBlank()) {
				return new Me(value, oauth.getAuthorizedClientRegistrationId());
			}
		}
		return new Me("", oauth.getAuthorizedClientRegistrationId());
	}
}
