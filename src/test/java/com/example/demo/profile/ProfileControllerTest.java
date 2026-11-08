package com.example.demo.profile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.auth.AppAccount;

class ProfileControllerTest {
	private ProfileRepository profiles;
	private ProfileController controller;

	@BeforeEach
	void setUp() {
		profiles = org.mockito.Mockito.mock(ProfileRepository.class);
		controller = new ProfileController(profiles);
		when(profiles.findByOwnerKey(anyString())).thenReturn(Optional.empty());
		when(profiles.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));
	}

	@Test
	void localAccountsReceiveDifferentProfiles() {
		AppAccount firstAccount = new AppAccount("first@example.com", "hash");
		AppAccount secondAccount = new AppAccount("second@example.com", "hash");
		ReflectionTestUtils.setField(firstAccount, "id", 10L);
		ReflectionTestUtils.setField(secondAccount, "id", 11L);

		Profile first = controller.saveProfile(emptyRequest(), authenticated(firstAccount));
		Profile second = controller.saveProfile(emptyRequest(), authenticated(secondAccount));

		assertEquals("local:10", first.getOwnerKey());
		assertEquals("local:11", second.getOwnerKey());
	}

	@Test
	void oauthIdentitiesAreScopedByProviderAndSubject() {
		Profile google = controller.saveProfile(emptyRequest(), oauth("google", "subject-1"));
		Profile linkedin = controller.saveProfile(emptyRequest(), oauth("linkedin", "subject-1"));

		assertEquals("oauth:google:subject-1", google.getOwnerKey());
		assertEquals("oauth:linkedin:subject-1", linkedin.getOwnerKey());
	}

	private ProfileController.ProfileRequest emptyRequest() {
		return new ProfileController.ProfileRequest(null, null, null, null, null,
				null, null, null, null, null);
	}

	private org.springframework.security.core.Authentication authenticated(AppAccount account) {
		return new org.springframework.security.authentication.TestingAuthenticationToken(
				account, "ignored", "ROLE_USER");
	}

	private OAuth2AuthenticationToken oauth(String registrationId, String subject) {
		var authority = new SimpleGrantedAuthority("ROLE_USER");
		var principal = new DefaultOAuth2User(List.of(authority), Map.of("sub", subject), "sub");
		return new OAuth2AuthenticationToken(principal, principal.getAuthorities(), registrationId);
	}
}
