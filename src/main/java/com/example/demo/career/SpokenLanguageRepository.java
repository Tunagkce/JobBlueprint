package com.example.demo.career;

import java.util.List;

public interface SpokenLanguageRepository extends OwnedRepository<SpokenLanguage> {
	List<SpokenLanguage> findByOwnerKeyAndLanguageIgnoreCase(String ownerKey, String language);
}
