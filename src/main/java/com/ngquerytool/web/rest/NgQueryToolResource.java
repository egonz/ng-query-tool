package com.ngquerytool.web.rest;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ngquerytool.service.NgQueryToolMetaService;
import com.ngquerytool.service.NgQueryToolSearchService;
import com.ngquerytool.web.rest.dto.NgQueryToolMetaDTO;
import com.ngquerytool.web.rest.dto.NgQueryToolSearchResultDTO;

/**
 * REST controller for NgQueryTool.
 */
@RestController
@RequestMapping("/app")
public class NgQueryToolResource {

	@Inject
	NgQueryToolMetaService ngQueryToolMetaService;
	
	@Inject
	NgQueryToolSearchService ngQueryToolSearchService;

	public static final String ADMIN = "ROLE_ADMIN";
	
	@RequestMapping(value = "/rest/ngquerytool/meta", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	@RolesAllowed(ADMIN)
	public ResponseEntity<NgQueryToolMetaDTO> meta() {
		return new ResponseEntity<>(
	            ngQueryToolMetaService.getMeta(),
	            HttpStatus.OK);
	}
	
	@RequestMapping(value = "/rest/ngquerytool/search", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	@RolesAllowed(ADMIN)
	public ResponseEntity<NgQueryToolSearchResultDTO> search(@RequestParam(value = "sql") String sql,
			@RequestParam(value = "page") Integer page, @RequestParam(value = "rp") Integer rp,
			@RequestParam(value = "bindVars[]") String[] bindVars) {
		return new ResponseEntity<>(
				ngQueryToolSearchService.search(sql, bindVars, page, rp),
	            HttpStatus.OK);
	}
	
}