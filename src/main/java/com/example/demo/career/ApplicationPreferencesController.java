package com.example.demo.career;

import java.time.LocalDate;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.auth.OwnerKeys;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/career/preferences")
public class ApplicationPreferencesController {

	public record Request(
			@Size(max = 1000) String desiredTitles,
			ApplicationPreferences.WorkMode preferredWorkMode,
			Boolean willingToRelocate,
			@Size(max = 500) String workAuthorization,
			Boolean requiresSponsorship,
			@Min(0) @Max(365) Integer noticePeriodDays,
			LocalDate availableFrom,
			@Min(0) Integer salaryMin,
			@Min(0) Integer salaryMax,
			@Pattern(regexp = "^[A-Za-z]{3}$", message = "must be a 3-letter currency code such as TRY or EUR")
			String salaryCurrency,
			ApplicationPreferences.MilitaryServiceStatus militaryServiceStatus,
			@Size(max = 50) String drivingLicense) {
	}

	private final ApplicationPreferencesRepository preferences;

	public ApplicationPreferencesController(ApplicationPreferencesRepository preferences) {
		this.preferences = preferences;
	}

	/** Returns saved answers, or an empty object if none are saved yet. */
	@GetMapping
	public ApplicationPreferences get(Authentication authentication) {
		return preferences.findByOwnerKey(OwnerKeys.of(authentication)).orElseGet(ApplicationPreferences::new);
	}

	@PutMapping
	public ApplicationPreferences save(@Valid @RequestBody Request request, Authentication authentication) {
		if (request.salaryMin() != null && request.salaryMax() != null && request.salaryMax() < request.salaryMin()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"The maximum salary must be at least the minimum.");
		}
		String owner = OwnerKeys.of(authentication);
		ApplicationPreferences entity = preferences.findByOwnerKey(owner).orElseGet(() -> {
			ApplicationPreferences created = new ApplicationPreferences();
			created.setOwnerKey(owner);
			return created;
		});
		entity.setDesiredTitles(Text.clean(request.desiredTitles()));
		entity.setPreferredWorkMode(request.preferredWorkMode());
		entity.setWillingToRelocate(request.willingToRelocate());
		entity.setWorkAuthorization(Text.clean(request.workAuthorization()));
		entity.setRequiresSponsorship(request.requiresSponsorship());
		entity.setNoticePeriodDays(request.noticePeriodDays());
		entity.setAvailableFrom(request.availableFrom());
		entity.setSalaryMin(request.salaryMin());
		entity.setSalaryMax(request.salaryMax());
		String currency = Text.clean(request.salaryCurrency());
		entity.setSalaryCurrency(currency == null ? null : currency.toUpperCase(Locale.ROOT));
		entity.setMilitaryServiceStatus(request.militaryServiceStatus());
		entity.setDrivingLicense(Text.clean(request.drivingLicense()));
		return preferences.save(entity);
	}
}
