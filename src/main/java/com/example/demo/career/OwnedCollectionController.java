package com.example.demo.career;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.auth.OwnerKeys;

import jakarta.validation.Valid;

/**
 * List/create/update/delete for one kind of career-profile item. All reads and
 * writes are filtered by the caller's owner key; another user's id yields 404.
 */
public abstract class OwnedCollectionController<E extends OwnedEntity, R> {

	static final int MAX_ITEMS_PER_USER = 50;

	private final OwnedRepository<E> repository;
	private final Sort order;
	private final String duplicateMessage;

	protected OwnedCollectionController(OwnedRepository<E> repository, Sort order, String duplicateMessage) {
		this.repository = repository;
		this.order = order;
		this.duplicateMessage = duplicateMessage;
	}

	protected abstract E newEntity();

	/** Copies the request onto the entity; throws 400 for cross-field problems. */
	protected abstract void apply(E entity, R request);

	/** Whether the owner already has an equivalent item (excluding {@code exceptId}, which may be null). */
	protected boolean isDuplicate(String owner, R request, Long exceptId) {
		return false;
	}

	@GetMapping
	public List<E> list(Authentication authentication) {
		return repository.findAllByOwnerKey(OwnerKeys.of(authentication), order);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public E create(@Valid @RequestBody R request, Authentication authentication) {
		String owner = OwnerKeys.of(authentication);
		if (repository.countByOwnerKey(owner) >= MAX_ITEMS_PER_USER) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"You can save up to " + MAX_ITEMS_PER_USER + " items here.");
		}
		if (isDuplicate(owner, request, null)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, duplicateMessage);
		}
		E entity = newEntity();
		entity.setOwnerKey(owner);
		apply(entity, request);
		return save(entity);
	}

	@PutMapping("/{id}")
	public E update(@PathVariable("id") Long id, @Valid @RequestBody R request, Authentication authentication) {
		E entity = find(id, authentication);
		if (isDuplicate(entity.getOwnerKey(), request, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, duplicateMessage);
		}
		apply(entity, request);
		return save(entity);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable("id") Long id, Authentication authentication) {
		repository.delete(find(id, authentication));
	}

	private E find(Long id, Authentication authentication) {
		return repository.findByIdAndOwnerKey(id, OwnerKeys.of(authentication))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found."));
	}

	private E save(E entity) {
		try {
			return repository.saveAndFlush(entity);
		} catch (DataIntegrityViolationException e) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, duplicateMessage);
		}
	}

	protected static ResponseStatusException badRequest(String message) {
		return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
	}
}
