package com.example.demo.career;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "skill")
public class Skill extends OwnedEntity {

	public enum Level { BEGINNER, INTERMEDIATE, ADVANCED, EXPERT }

	@Column(nullable = false, length = 100)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private Level level;

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public Level getLevel() { return level; }
	public void setLevel(Level level) { this.level = level; }
}
