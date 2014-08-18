package com.ngquerytool.web.rest.dto;

import java.util.List;

public class MetaTable {

	private String name;
	
	private String label;
	
	private List<MetaColumn> columns;
	
	private List<MetaForeignKey> fks;
	
	public MetaTable() {
		
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

	public List<MetaColumn> getColumns() {
		return columns;
	}
	
	public void setColumns(List<MetaColumn> columns) {
		this.columns = columns;
	}

	public List<MetaForeignKey> getFks() {
		return fks;
	}

	public void setFks(List<MetaForeignKey> fks) {
		this.fks = fks;
	}
	
}
