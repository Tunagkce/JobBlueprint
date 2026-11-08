package com.example.demo.profile;

import com.example.demo.auth.OwnerKeys;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

	private final ProfileRepository profiles;

	public ProfileController(ProfileRepository profiles) {
		this.profiles = profiles;
	}

	@GetMapping
	public Profile getProfile(Authentication authentication) {
		String ownerKey = ownerKey(authentication);
		return profiles.findByOwnerKey(ownerKey)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile has not been created yet"));
	}

	@PutMapping
	public Profile saveProfile(@RequestBody ProfileRequest request, Authentication authentication) {
		String ownerKey = ownerKey(authentication);
		Profile profile = profiles.findByOwnerKey(ownerKey).orElseGet(() -> {
			Profile newProfile = new Profile();
			newProfile.setOwnerKey(ownerKey);
			return newProfile;
		});
		profile.setFullName(request.fullName());
		profile.setEmail(request.email());
		profile.setPhone(request.phone());
		profile.setPhoneCountryCode(request.phoneCountryCode());
		profile.setPhoneCountryIso(request.phoneCountryIso());
		profile.setCity(request.city());
		profile.setCountry(request.country());
		profile.setLinkedInUrl(request.linkedInUrl());
		profile.setPortfolioUrl(request.portfolioUrl());
		profile.setProfessionalSummary(request.professionalSummary());
		return profiles.save(profile);
	}

	private String ownerKey(Authentication authentication) {
		return OwnerKeys.of(authentication);
	}

	public record ProfileRequest(
			String fullName,
			String email,
			String phone,
			String phoneCountryCode,
			String phoneCountryIso,
			String city,
			String country,
			String linkedInUrl,
			String portfolioUrl,
			String professionalSummary) {
	}
}
