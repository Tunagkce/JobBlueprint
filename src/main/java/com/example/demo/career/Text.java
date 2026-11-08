package com.example.demo.career;

final class Text {
	private Text() {
	}

	/** Trims input and stores blank optional text as null. */
	static String clean(String value) {
		if (value == null) return null;
		String stripped = value.strip();
		return stripped.isEmpty() ? null : stripped;
	}
}
