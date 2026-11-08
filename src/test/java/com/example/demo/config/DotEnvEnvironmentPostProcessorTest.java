package com.example.demo.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class DotEnvEnvironmentPostProcessorTest {

	@Test
	void parsesKeysSkipsCommentsBlanksAndStripsQuotes() {
		Map<String, Object> values = DotEnvEnvironmentPostProcessor.parse(List.of(
				"# comment",
				"",
				"DB_PASSWORD=secret=with=equals",
				"GOOGLE_CLIENT_ID = \"quoted\"",
				"EMPTY=",
				"not a pair"));

		assertThat(values).containsExactly(
				Map.entry("DB_PASSWORD", "secret=with=equals"),
				Map.entry("GOOGLE_CLIENT_ID", "quoted"));
	}
}
