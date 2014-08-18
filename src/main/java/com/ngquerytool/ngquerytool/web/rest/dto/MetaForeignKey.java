package com.ngquerytool.web.rest.dto;


public class MetaForeignKey {

	private String name;
	
	private String label;
	
	private String reverseLabel;
	
	private String fkTableName;
	
	private String pkColumnNames;
	
	private String fkColumnNames;
	
	public MetaForeignKey() {
		
	}
	
	public MetaForeignKey(String name, String label, String reverseLabel, 
		String fkTableName, String pkColumnNames, String fkColumnNames) {
		this.name = name;
		this.label = label;
		this.reverseLabel = reverseLabel; 
		this.fkTableName = fkTableName; 
		this.pkColumnNames = pkColumnNames;
		this.fkColumnNames = fkColumnNames;
	}
	

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getReverseLabel() {
		return reverseLabel;
	}

	public void setReverseLabel(String reverseLabel) {
		this.reverseLabel = reverseLabel;
	}

	public String getFkTableName() {
		return fkTableName;
	}

	public void setFkTableName(String fkTableName) {
		this.fkTableName = fkTableName;
	}

	public String getPkColumnNames() {
		return pkColumnNames;
	}

	public void setPkColumnNames(String pkColumnNames) {
		this.pkColumnNames = pkColumnNames;
	}

	public String getFkColumnNames() {
		return fkColumnNames;
	}

	public void setFkColumnNames(String fkColumnNames) {
		this.fkColumnNames = fkColumnNames;
	}
	

	
}
