package com.example.demo.career;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

/** A row that belongs to exactly one signed-in identity. */
@MappedSuperclass
public abstract class OwnedEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@JsonIgnore
	@Column(nullable = false, length = 512)
	private String ownerKey;

	public Long getId() { return id; }

	public String getOwnerKey() { return ownerKey; }

	void setOwnerKey(String ownerKey) { this.ownerKey = ownerKey; }
}
