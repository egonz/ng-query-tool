package com.ngquerytool.web.rest.dto;

public class MetaOperator {

	private String name;
	
	private String label;
	
	private String cardinality;
	
	public static final String DEFAULT_CARDINALITY = "ONE";
	
	public MetaOperator() {
		
	}
	
	public MetaOperator(String name, String label) {
		this.name = name;
		this.label = label;
		this.cardinality = DEFAULT_CARDINALITY;
	}
	
	public MetaOperator(String name, String label, String cardinality) {
		this.name = name;
		this.label = label;
		this.cardinality = cardinality;
	}

	public String getName() {
		return name;
	}

	public String getLabel() {
		return label;
	}

	public String getCardinality() {
		return cardinality;
	}
	
}
