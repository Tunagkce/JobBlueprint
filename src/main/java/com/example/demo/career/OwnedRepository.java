package com.example.demo.career;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface OwnedRepository<E extends OwnedEntity> extends JpaRepository<E, Long> {
	List<E> findAllByOwnerKey(String ownerKey, Sort sort);

	Optional<E> findByIdAndOwnerKey(Long id, String ownerKey);

	long countByOwnerKey(String ownerKey);
}
