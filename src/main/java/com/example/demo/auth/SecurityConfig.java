package com.example.demo.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Configuration
public class SecurityConfig {
	private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SecurityConfig.class);

	@Bean
	UserDetailsService userDetailsService(AppAccountRepository accounts) {
		return email -> accounts.findByEmail(email.toLowerCase(Locale.ROOT))
				.orElseThrow(() -> new UsernameNotFoundException("Account not found"));
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	SecurityContextRepository securityContextRepository() {
		return new HttpSessionSecurityContextRepository();
	}

	@Bean
	ClientRegistrationRepository clientRegistrationRepository(Environment environment) {
		List<ClientRegistration> registrations = new ArrayList<>();
		addCommon(registrations, environment, "google", "app.oauth.google.client-id", "app.oauth.google.client-secret",
				CommonOAuth2Provider.GOOGLE, "openid", "profile", "email");
		addCommon(registrations, environment, "github", "app.oauth.github.client-id", "app.oauth.github.client-secret",
				CommonOAuth2Provider.GITHUB, "read:user", "user:email");

		String linkedinId = environment.getProperty("app.oauth.linkedin.client-id");
		String linkedinSecret = environment.getProperty("app.oauth.linkedin.client-secret");
		if (present(linkedinId) && present(linkedinSecret)) {
			Map<String, Object> metadata = Map.of(
					"issuer", "https://www.linkedin.com/oauth",
					"authorization_endpoint", "https://www.linkedin.com/oauth/v2/authorization",
					"token_endpoint", "https://www.linkedin.com/oauth/v2/accessToken",
					"userinfo_endpoint", "https://api.linkedin.com/v2/userinfo",
					"jwks_uri", "https://www.linkedin.com/oauth/openid/jwks");
			registrations.add(ClientRegistration.withRegistrationId("linkedin")
					.clientId(linkedinId).clientSecret(linkedinSecret)
					.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
					.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
					.redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
					.scope("openid", "profile", "email")
					.authorizationUri("https://www.linkedin.com/oauth/v2/authorization")
					.tokenUri("https://www.linkedin.com/oauth/v2/accessToken")
					.userInfoUri("https://api.linkedin.com/v2/userinfo")
					// Required to verify the signed OpenID Connect ID token LinkedIn returns.
					.jwkSetUri("https://www.linkedin.com/oauth/openid/jwks")
					.userNameAttributeName("sub")
					.clientName("LinkedIn")
					.providerConfigurationMetadata(metadata)
					// Must equal the "iss" claim in LinkedIn's ID tokens (see its OIDC discovery document).
					.issuerUri("https://www.linkedin.com/oauth")
					.build());
		}
		return registrationId -> registrations.stream()
				.filter(registration -> registration.getRegistrationId().equals(registrationId))
				.findFirst()
				.orElse(null);
	}

	private void addCommon(List<ClientRegistration> registrations, Environment environment, String id,
			String clientIdKey, String secretKey, CommonOAuth2Provider provider, String... scopes) {
		String clientId = environment.getProperty(clientIdKey);
		String secret = environment.getProperty(secretKey);
		if (present(clientId) && present(secret)) {
			registrations.add(provider.getBuilder(id).clientId(clientId).clientSecret(secret).scope(scopes).build());
		}
	}

	private boolean present(String value) { return value != null && !value.isBlank(); }

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository contextRepository,
			ObjectProvider<ClientRegistrationRepository> registrations)
			throws Exception {
		http
			.securityContext(context -> context.securityContextRepository(contextRepository))
			.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers("/auth.html", "/auth.js", "/styles.css",
						"/api/auth/**", "/login", "/oauth2/**", "/login/oauth2/**",
						"/api/metadata/countries", "/api/health").permitAll()
				.anyRequest().authenticated())
			// API calls from the frontend get a plain 401 instead of a redirect to the HTML sign-in page.
			.exceptionHandling(exceptions -> exceptions.defaultAuthenticationEntryPointFor(
					new org.springframework.security.web.authentication.HttpStatusEntryPoint(
							org.springframework.http.HttpStatus.UNAUTHORIZED),
					org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher
							.withDefaults().matcher("/api/**")))
			.formLogin(login -> login
				.loginPage("/auth.html")
				.loginProcessingUrl("/login")
				.usernameParameter("email")
				.defaultSuccessUrl(com.example.demo.HomeController.APP_HOME, true)
				.failureUrl("/auth.html?error=login"))
			.logout(logout -> logout.logoutSuccessUrl("/auth.html?logout"));
		if (registrations.getIfAvailable() != null) {
			http.oauth2Login(oauth -> oauth.loginPage("/auth.html").defaultSuccessUrl(com.example.demo.HomeController.APP_HOME, true)
					.failureHandler((request, response, exception) -> {
						// Log the provider's reason (e.g. invalid_id_token) without tokens or codes.
						log.warn("OAuth sign-in failed: {}", exception.getMessage());
						response.sendRedirect("/auth.html?error=oauth");
					}));
		}
		return http.build();
	}
}
