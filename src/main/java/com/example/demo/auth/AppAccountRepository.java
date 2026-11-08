package com.example.demo.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppAccountRepository extends JpaRepository<AppAccount, Long> {
	Optional<AppAccount> findByEmail(String email);
	boolean existsByEmail(String email);
}
