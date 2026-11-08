package com.example.demo.career;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "spoken_language")
public class SpokenLanguage extends OwnedEntity {

	/** CEFR levels, the scale EU and Turkish application forms use, plus native. */
	public enum Proficiency { A1, A2, B1, B2, C1, C2, NATIVE }

	@Column(nullable = false, length = 80)
	private String language;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Proficiency proficiency;

	public String getLanguage() { return language; }
	public void setLanguage(String language) { this.language = language; }
	public Proficiency getProficiency() { return proficiency; }
	public void setProficiency(Proficiency proficiency) { this.proficiency = proficiency; }
}
