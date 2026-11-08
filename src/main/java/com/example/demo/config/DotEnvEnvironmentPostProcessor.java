package com.example.demo.config;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Local development only: loads KEY=VALUE pairs from a .env file in the working
 * directory so ".\mvnw.cmd spring-boot:run" picks up local secrets. Values in .env
 * take precedence over environment variables, so a stale value left in a terminal
 * cannot shadow it. The file is git- and docker-ignored, so production (Cloud Run)
 * never has one and keeps using its real environment and Secret Manager values.
 */
public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

	static final String PROPERTY_SOURCE_NAME = "localDotEnv";

	@Override
	public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
		Path file = Path.of(".env");
		if (!Files.isRegularFile(file) || environment.getPropertySources().contains(PROPERTY_SOURCE_NAME)) {
			return;
		}
		Map<String, Object> values = parse(read(file));
		if (!values.isEmpty()) {
			environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, values));
		}
	}

	static Map<String, Object> parse(List<String> lines) {
		Map<String, Object> values = new LinkedHashMap<>();
		for (String raw : lines) {
			String line = raw.strip();
			if (line.isEmpty() || line.startsWith("#")) continue;
			int eq = line.indexOf('=');
			if (eq <= 0) continue;
			String key = line.substring(0, eq).strip();
			String value = line.substring(eq + 1).strip();
			if (value.length() >= 2 && (value.startsWith("\"") && value.endsWith("\"")
					|| value.startsWith("'") && value.endsWith("'"))) {
				value = value.substring(1, value.length() - 1);
			}
			if (!value.isEmpty()) values.put(key, value);
		}
		return values;
	}

	private static List<String> read(Path file) {
		try {
			return Files.readAllLines(file, StandardCharsets.UTF_8);
		} catch (IOException e) {
			throw new UncheckedIOException("Could not read " + file.toAbsolutePath(), e);
		}
	}

	@Override
	public int getOrder() {
		return Ordered.LOWEST_PRECEDENCE;
	}
}
