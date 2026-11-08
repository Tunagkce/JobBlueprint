package com.example.demo.career;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "work_experience")
public class WorkExperience extends OwnedEntity {

	public enum EmploymentType { FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, APPRENTICESHIP }

	@Column(nullable = false, length = 200)
	private String company;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(length = 200)
	private String location;

	@Enumerated(EnumType.STRING)
	@Column(length = 30)
	private EmploymentType employmentType;

	@Column(nullable = false)
	private LocalDate startDate;

	private LocalDate endDate;

	@Column(name = "is_current", nullable = false)
	private boolean current;

	@Column(length = 5000)
	private String description;

	public String getCompany() { return company; }
	public void setCompany(String company) { this.company = company; }
	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }
	public EmploymentType getEmploymentType() { return employmentType; }
	public void setEmploymentType(EmploymentType employmentType) { this.employmentType = employmentType; }
	public LocalDate getStartDate() { return startDate; }
	public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
	public LocalDate getEndDate() { return endDate; }
	public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
	public boolean isCurrent() { return current; }
	public void setCurrent(boolean current) { this.current = current; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
}
