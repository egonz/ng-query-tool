package com.ngquerytool.web.rest.dto;

public class MetaColumn {

	private String name;
	
	private String label;
	
	private String type;
	
	private Integer size;
	
	public MetaColumn() {
		
	}
	
	public MetaColumn(String name, String label, 
			String type, Integer size) {
		this.name = name;
		this.label = label;
		this.type = type;
		this.size = size;
	}

	public String getName() {
		return name;
	}

	public String getLabel() {
		return label;
	}

	public String getType() {
		return type;
	}

	public Integer getSize() {
		return size;
	}
	
}
