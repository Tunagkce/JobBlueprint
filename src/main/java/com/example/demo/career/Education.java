package com.example.demo.career;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "education")
public class Education extends OwnedEntity {

	@Column(nullable = false, length = 200)
	private String institution;

	@Column(length = 200)
	private String degree;

	@Column(length = 200)
	private String fieldOfStudy;

	private LocalDate startDate;

	private LocalDate endDate;

	@Column(length = 50)
	private String grade;

	@Column(length = 2000)
	private String description;

	public String getInstitution() { return institution; }
	public void setInstitution(String institution) { this.institution = institution; }
	public String getDegree() { return degree; }
	public void setDegree(String degree) { this.degree = degree; }
	public String getFieldOfStudy() { return fieldOfStudy; }
	public void setFieldOfStudy(String fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }
	public LocalDate getStartDate() { return startDate; }
	public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
	public LocalDate getEndDate() { return endDate; }
	public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
	public String getGrade() { return grade; }
	public void setGrade(String grade) { this.grade = grade; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
}
