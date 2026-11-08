package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * The React app (built from /frontend into static/app) is served at /app/. Its client-side routes
 * (paths without a file extension) all load index.html; real files such as /app/assets/x.js are
 * served as static resources.
 */
@Controller
public class HomeController {

	public static final String APP_HOME = "/app/";

	// /myprofile is kept so old bookmarks keep working.
	@GetMapping({ "/", "/app", "/myprofile" })
	public String home() {
		return "redirect:" + APP_HOME;
	}

	@GetMapping({ "/app/", "/app/{page:[^.]+}", "/app/{section:[^.]+}/{page:[^.]+}" })
	public String app() {
		return "forward:/app/index.html";
	}
}
