package com.example.demo.profile;

import java.text.Collator;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metadata")
public class CountryMetadataController {

	private final PhoneNumberUtil phoneNumberUtil = PhoneNumberUtil.getInstance();
	private final Set<String> supportedRegions = phoneNumberUtil.getSupportedRegions();

	@GetMapping("/countries")
	public List<CountryOption> getCountries() {
		Collator collator = Collator.getInstance(Locale.ENGLISH);

		return Arrays.stream(Locale.getISOCountries())
				.map(this::countryOption)
				.filter(option -> option != null)
				.sorted((first, second) -> collator.compare(first.name(), second.name()))
				.toList();
	}

	private CountryOption countryOption(String iso) {
		if (!supportedRegions.contains(iso)) {
			return null;
		}

		int callingCode = phoneNumberUtil.getCountryCodeForRegion(iso);
		if (callingCode == 0) {
			return null;
		}

		Locale countryLocale = new Locale.Builder().setRegion(iso).build();
		String name = countryLocale.getDisplayCountry(Locale.ENGLISH);
		String format = exampleFormat(iso, callingCode);
		return new CountryOption(iso, name, "+" + callingCode, format);
	}

	private String exampleFormat(String iso, int callingCode) {
		PhoneNumber example = phoneNumberUtil.getExampleNumberForType(iso, PhoneNumberType.MOBILE);
		if (example == null) {
			return "xxx xxx xxxx";
		}

		String international = phoneNumberUtil.format(example, PhoneNumberFormat.INTERNATIONAL);
		String nationalPart = international.replaceFirst("^\\+" + callingCode + "\\s*", "");
		return nationalPart.replaceAll("[0-9]", "x");
	}

	public record CountryOption(String iso, String name, String dial, String format) {
	}
}
