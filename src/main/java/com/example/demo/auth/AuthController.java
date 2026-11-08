package com.example.demo.auth;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Controller
public class AuthController {
	private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
	private final AppAccountRepository accounts;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final SecurityContextRepository contextRepository;
	private final ClientRegistrationRepository clientRegistrations;

	public AuthController(AppAccountRepository accounts, PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager, SecurityContextRepository contextRepository,
			ClientRegistrationRepository clientRegistrations) {
		this.accounts = accounts;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.contextRepository = contextRepository;
		this.clientRegistrations = clientRegistrations;
	}

	@GetMapping("/api/auth/csrf")
	@ResponseBody
	public Map<String, String> csrf(CsrfToken token) {
		return Map.of("parameterName", token.getParameterName(), "token", token.getToken());
	}

	@GetMapping("/api/auth/providers")
	@ResponseBody
	public Map<String, Boolean> providers() {
		Map<String, Boolean> result = new LinkedHashMap<>();
		result.put("google", clientRegistrations.findByRegistrationId("google") != null);
		result.put("github", clientRegistrations.findByRegistrationId("github") != null);
		result.put("linkedin", clientRegistrations.findByRegistrationId("linkedin") != null);
		return result;
	}

	@PostMapping("/api/auth/register")
	public String register(@RequestParam String email, @RequestParam String password,
			@RequestParam String confirmPassword, HttpServletRequest request, HttpServletResponse response) {
		String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
		if (!EMAIL.matcher(normalizedEmail).matches()) return "redirect:/auth.html?error=email";
		if (password.length() < 12 || password.length() > 72) return "redirect:/auth.html?error=password";
		if (!password.equals(confirmPassword)) return "redirect:/auth.html?error=match";
		if (accounts.existsByEmail(normalizedEmail)) return "redirect:/auth.html?error=exists";

		accounts.save(new AppAccount(normalizedEmail, passwordEncoder.encode(password)));
		Authentication authentication = authenticationManager.authenticate(
				UsernamePasswordAuthenticationToken.unauthenticated(normalizedEmail, password));
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(authentication);
		SecurityContextHolder.setContext(context);
		contextRepository.saveContext(context, request, response);
		return "redirect:" + com.example.demo.HomeController.APP_HOME;
	}

}
