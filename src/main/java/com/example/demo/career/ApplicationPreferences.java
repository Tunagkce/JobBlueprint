package com.example.demo.career;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/** Standard answers most application forms ask for. One row per owner. */
@Entity
@Table(name = "application_preferences")
public class ApplicationPreferences extends OwnedEntity {

	public enum WorkMode { REMOTE, HYBRID, ONSITE }

	/** Common on Turkish application forms ("askerlik durumu"). */
	public enum MilitaryServiceStatus { COMPLETED, EXEMPT, POSTPONED, NOT_APPLICABLE }

	@Column(length = 1000)
	private String desiredTitles;

	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private WorkMode preferredWorkMode;

	private Boolean willingToRelocate;

	@Column(length = 500)
	private String workAuthorization;

	private Boolean requiresSponsorship;

	private Integer noticePeriodDays;

	private LocalDate availableFrom;

	private Integer salaryMin;

	private Integer salaryMax;

	@Column(length = 3)
	private String salaryCurrency;

	@Enumerated(EnumType.STRING)
	@Column(length = 30)
	private MilitaryServiceStatus militaryServiceStatus;

	@Column(length = 50)
	private String drivingLicense;

	public String getDesiredTitles() { return desiredTitles; }
	public void setDesiredTitles(String desiredTitles) { this.desiredTitles = desiredTitles; }
	public WorkMode getPreferredWorkMode() { return preferredWorkMode; }
	public void setPreferredWorkMode(WorkMode preferredWorkMode) { this.preferredWorkMode = preferredWorkMode; }
	public Boolean getWillingToRelocate() { return willingToRelocate; }
	public void setWillingToRelocate(Boolean willingToRelocate) { this.willingToRelocate = willingToRelocate; }
	public String getWorkAuthorization() { return workAuthorization; }
	public void setWorkAuthorization(String workAuthorization) { this.workAuthorization = workAuthorization; }
	public Boolean getRequiresSponsorship() { return requiresSponsorship; }
	public void setRequiresSponsorship(Boolean requiresSponsorship) { this.requiresSponsorship = requiresSponsorship; }
	public Integer getNoticePeriodDays() { return noticePeriodDays; }
	public void setNoticePeriodDays(Integer noticePeriodDays) { this.noticePeriodDays = noticePeriodDays; }
	public LocalDate getAvailableFrom() { return availableFrom; }
	public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }
	public Integer getSalaryMin() { return salaryMin; }
	public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }
	public Integer getSalaryMax() { return salaryMax; }
	public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }
	public String getSalaryCurrency() { return salaryCurrency; }
	public void setSalaryCurrency(String salaryCurrency) { this.salaryCurrency = salaryCurrency; }
	public MilitaryServiceStatus getMilitaryServiceStatus() { return militaryServiceStatus; }
	public void setMilitaryServiceStatus(MilitaryServiceStatus militaryServiceStatus) { this.militaryServiceStatus = militaryServiceStatus; }
	public String getDrivingLicense() { return drivingLicense; }
	public void setDrivingLicense(String drivingLicense) { this.drivingLicense = drivingLicense; }
}
