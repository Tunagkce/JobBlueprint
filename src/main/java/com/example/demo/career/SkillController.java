package com.example.demo.career;

import java.util.Objects;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/career/skills")
public class SkillController extends OwnedCollectionController<Skill, SkillController.Request> {

	public record Request(@NotBlank @Size(max = 100) String name, Skill.Level level) {
	}

	private final SkillRepository skills;

	public SkillController(SkillRepository skills) {
		super(skills, Sort.by("name"), "This skill is already in your profile.");
		this.skills = skills;
	}

	@Override
	protected Skill newEntity() {
		return new Skill();
	}

	@Override
	protected boolean isDuplicate(String owner, Request request, Long exceptId) {
		return skills.findByOwnerKeyAndNameIgnoreCase(owner, request.name().strip()).stream()
				.anyMatch(existing -> !Objects.equals(existing.getId(), exceptId));
	}

	@Override
	protected void apply(Skill entity, Request request) {
		entity.setName(request.name().strip());
		entity.setLevel(request.level());
	}
}
