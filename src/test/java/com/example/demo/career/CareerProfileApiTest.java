package com.example.demo.career;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.example.demo.auth.AppAccount;
import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@ActiveProfiles("test")
class CareerProfileApiTest {

	private static final String EXPERIENCE = """
			{"company":"Acme","title":"Backend Developer","startDate":"2022-03-01","current":true,
			 "employmentType":"FULL_TIME","description":"Built Spring Boot services"}""";

	@Autowired
	private WebApplicationContext context;

	@Autowired
	private WorkExperienceRepository experience;
	@Autowired
	private SkillRepository skills;
	@Autowired
	private ApplicationPreferencesRepository preferences;

	private MockMvc mvc;

	@BeforeEach
	void setUp() {
		mvc = MockMvcBuilders.webAppContextSetup(context)
				.apply(SecurityMockMvcConfigurers.springSecurity()).build();
		experience.deleteAll();
		skills.deleteAll();
		preferences.deleteAll();
	}

	@Test
	void usersCannotSeeOrChangeEachOthersItems() throws Exception {
		String body = mvc.perform(json(post("/api/career/experience"), EXPERIENCE).with(as(1)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.company").value("Acme"))
				.andExpect(jsonPath("$.ownerKey").doesNotExist())
				.andReturn().getResponse().getContentAsString();
		Number id = JsonPath.read(body, "$.id");

		mvc.perform(get("/api/career/experience").with(as(2)))
				.andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
		mvc.perform(json(put("/api/career/experience/" + id), EXPERIENCE).with(as(2)))
				.andExpect(status().isNotFound());
		mvc.perform(delete("/api/career/experience/" + id).with(as(2)).with(csrf()))
				.andExpect(status().isNotFound());

		mvc.perform(get("/api/career/experience").with(as(1)))
				.andExpect(jsonPath("$.length()").value(1));
		mvc.perform(delete("/api/career/experience/" + id).with(as(1)).with(csrf()))
				.andExpect(status().isNoContent());
		mvc.perform(get("/api/career/experience").with(as(1)))
				.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void invalidInputReturnsFieldErrors() throws Exception {
		mvc.perform(json(post("/api/career/experience"), """
				{"company":" ","title":"Dev","startDate":"2022-01-01"}""").with(as(1)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.company").exists());

		mvc.perform(json(post("/api/career/experience"), """
				{"company":"Acme","title":"Dev","startDate":"2022-01-01","endDate":"2023-01-01","current":true}""")
				.with(as(1)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("A current role can't have an end date."));

		mvc.perform(json(post("/api/career/experience"), """
				{"company":"Acme","title":"Dev","startDate":"2022-01-01","endDate":"2021-01-01"}""").with(as(1)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void duplicateSkillsAreRejectedIgnoringCase() throws Exception {
		mvc.perform(json(post("/api/career/skills"), "{\"name\":\"Java\",\"level\":\"ADVANCED\"}").with(as(1)))
				.andExpect(status().isCreated());
		mvc.perform(json(post("/api/career/skills"), "{\"name\":\" java \"}").with(as(1)))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("This skill is already in your profile."));
		// A different user may have the same skill.
		mvc.perform(json(post("/api/career/skills"), "{\"name\":\"Java\"}").with(as(2)))
				.andExpect(status().isCreated());
	}

	@Test
	void preferencesStartEmptyAndAreValidated() throws Exception {
		mvc.perform(get("/api/career/preferences").with(as(1)))
				.andExpect(status().isOk()).andExpect(jsonPath("$.salaryCurrency").isEmpty());

		mvc.perform(json(put("/api/career/preferences"), "{\"salaryMin\":5000,\"salaryMax\":1000}").with(as(1)))
				.andExpect(status().isBadRequest());

		mvc.perform(json(put("/api/career/preferences"), """
				{"preferredWorkMode":"HYBRID","salaryMin":60000,"salaryMax":80000,"salaryCurrency":"eur",
				 "militaryServiceStatus":"COMPLETED","noticePeriodDays":30}""").with(as(1)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.salaryCurrency").value("EUR"));

		mvc.perform(get("/api/career/preferences").with(as(2)))
				.andExpect(jsonPath("$.salaryCurrency").isEmpty());
	}

	@Test
	void signedOutRequestsAreRefused() throws Exception {
		// API calls get 401 (not a redirect to the HTML sign-in page) so the frontend can react.
		mvc.perform(get("/api/career/skills")).andExpect(status().isUnauthorized());
		mvc.perform(json(post("/api/career/skills"), "{\"name\":\"Java\"}")).andExpect(status().isUnauthorized());
		// Pages still redirect to sign-in.
		mvc.perform(get("/myprofile").accept(MediaType.TEXT_HTML)).andExpect(status().is3xxRedirection());
	}

	private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
		return request.contentType(MediaType.APPLICATION_JSON).content(body).with(csrf());
	}

	private static org.springframework.test.web.servlet.request.RequestPostProcessor as(long accountId) {
		AppAccount account = new AppAccount("user" + accountId + "@example.com", "hash");
		ReflectionTestUtils.setField(account, "id", accountId);
		return authentication(new TestingAuthenticationToken(account, null, "ROLE_USER"));
	}
}
