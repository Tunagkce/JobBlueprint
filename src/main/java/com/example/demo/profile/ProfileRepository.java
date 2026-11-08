package com.example.demo.profile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
	Optional<Profile> findByOwnerKey(String ownerKey);
}
