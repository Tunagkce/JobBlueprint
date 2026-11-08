package com.example.demo.career;

import java.time.LocalDate;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/career/experience")
public class WorkExperienceController
		extends OwnedCollectionController<WorkExperience, WorkExperienceController.Request> {

	public record Request(
			@NotBlank @Size(max = 200) String company,
			@NotBlank @Size(max = 200) String title,
			@Size(max = 200) String location,
			WorkExperience.EmploymentType employmentType,
			@NotNull @PastOrPresent LocalDate startDate,
			LocalDate endDate,
			// Boxed so it may be omitted (Jackson 3 rejects missing primitives); null means false.
			Boolean current,
			@Size(max = 5000) String description) {

		boolean isCurrent() {
			return Boolean.TRUE.equals(current);
		}
	}

	public WorkExperienceController(WorkExperienceRepository repository) {
		// Most recent role first.
		super(repository, Sort.by(Sort.Order.desc("current"), Sort.Order.desc("startDate")),
				"This role is already saved.");
	}

	@Override
	protected WorkExperience newEntity() {
		return new WorkExperience();
	}

	@Override
	protected void apply(WorkExperience entity, Request request) {
		if (request.isCurrent() && request.endDate() != null) {
			throw badRequest("A current role can't have an end date.");
		}
		if (request.endDate() != null && request.endDate().isBefore(request.startDate())) {
			throw badRequest("The end date must be after the start date.");
		}
		entity.setCompany(request.company().strip());
		entity.setTitle(request.title().strip());
		entity.setLocation(Text.clean(request.location()));
		entity.setEmploymentType(request.employmentType());
		entity.setStartDate(request.startDate());
		entity.setEndDate(request.endDate());
		entity.setCurrent(request.isCurrent());
		entity.setDescription(Text.clean(request.description()));
	}
}
