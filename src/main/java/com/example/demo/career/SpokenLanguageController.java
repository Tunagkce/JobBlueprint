package com.example.demo.career;

import java.util.Objects;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/career/languages")
public class SpokenLanguageController
		extends OwnedCollectionController<SpokenLanguage, SpokenLanguageController.Request> {

	public record Request(@NotBlank @Size(max = 80) String language, @NotNull SpokenLanguage.Proficiency proficiency) {
	}

	private final SpokenLanguageRepository languages;

	public SpokenLanguageController(SpokenLanguageRepository languages) {
		super(languages, Sort.by("language"), "This language is already in your profile.");
		this.languages = languages;
	}

	@Override
	protected SpokenLanguage newEntity() {
		return new SpokenLanguage();
	}

	@Override
	protected boolean isDuplicate(String owner, Request request, Long exceptId) {
		return languages.findByOwnerKeyAndLanguageIgnoreCase(owner, request.language().strip()).stream()
				.anyMatch(existing -> !Objects.equals(existing.getId(), exceptId));
	}

	@Override
	protected void apply(SpokenLanguage entity, Request request) {
		entity.setLanguage(request.language().strip());
		entity.setProficiency(request.proficiency());
	}
}
