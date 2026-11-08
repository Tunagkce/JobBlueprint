package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/")
	public String home() {
		return "redirect:/myprofile";
	}

	@GetMapping("/myprofile")
	public String profile() {
		return "forward:/index.html";
	}
}
