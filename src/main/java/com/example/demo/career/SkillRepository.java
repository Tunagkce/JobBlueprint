package com.example.demo.career;

import java.util.List;

public interface SkillRepository extends OwnedRepository<Skill> {
	List<Skill> findByOwnerKeyAndNameIgnoreCase(String ownerKey, String name);
}
