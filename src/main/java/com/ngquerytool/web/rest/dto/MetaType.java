package com.ngquerytool.web.rest.dto;

import java.util.List;

public class MetaType {

	private String name;
	
	private String editor;
	
	private List<MetaOperator> operators;
	
	public MetaType() {
		
	}
	
	public MetaType(String name, String editor, List<MetaOperator> operators) {
		this.name = name;
		this.editor = editor;
		this.operators = operators;
	}

	public String getName() {
		return name;
	}

	public String getEditor() {
		return editor;
	}

	public List<MetaOperator> getOperators() {
		return operators;
	}
	
}
