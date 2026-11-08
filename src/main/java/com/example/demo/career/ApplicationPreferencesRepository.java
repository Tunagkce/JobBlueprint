package com.example.demo.career;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationPreferencesRepository extends JpaRepository<ApplicationPreferences, Long> {
	Optional<ApplicationPreferences> findByOwnerKey(String ownerKey);
}
