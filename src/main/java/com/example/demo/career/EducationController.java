package com.example.demo.career;

import java.time.LocalDate;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/career/education")
public class EducationController extends OwnedCollectionController<Education, EducationController.Request> {

	public record Request(
			@NotBlank @Size(max = 200) String institution,
			@Size(max = 200) String degree,
			@Size(max = 200) String fieldOfStudy,
			LocalDate startDate,
			// May be in the future for an expected graduation date.
			LocalDate endDate,
			@Size(max = 50) String grade,
			@Size(max = 2000) String description) {
	}

	public EducationController(EducationRepository repository) {
		super(repository, Sort.by(Sort.Order.desc("endDate").nullsFirst(), Sort.Order.desc("startDate")),
				"This education entry is already saved.");
	}

	@Override
	protected Education newEntity() {
		return new Education();
	}

	@Override
	protected void apply(Education entity, Request request) {
		if (request.startDate() != null && request.endDate() != null
				&& request.endDate().isBefore(request.startDate())) {
			throw badRequest("The end date must be after the start date.");
		}
		entity.setInstitution(request.institution().strip());
		entity.setDegree(Text.clean(request.degree()));
		entity.setFieldOfStudy(Text.clean(request.fieldOfStudy()));
		entity.setStartDate(request.startDate());
		entity.setEndDate(request.endDate());
		entity.setGrade(Text.clean(request.grade()));
		entity.setDescription(Text.clean(request.description()));
	}
}
