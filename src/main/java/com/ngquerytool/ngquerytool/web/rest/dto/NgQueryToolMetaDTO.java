package com.ngquerytool.web.rest.dto;

import java.util.ArrayList;
import java.util.List;

public class NgQueryToolMetaDTO {

	private List<MetaType> types;
	
	private List<MetaTable> tables;
	
	public NgQueryToolMetaDTO() {
		types = new ArrayList<MetaType>();
		tables = new ArrayList<MetaTable>();
	}
	
	public NgQueryToolMetaDTO(List<MetaType> types, 
			List<MetaTable> tables) {
		this.types = types;
		this.tables = tables;
	}

	public List<MetaType> getTypes() {
		return types;
	}
	
	public void setTypes(List<MetaType> types) {
		this.types = types;
	}
	
	public List<MetaTable> getTables() {
		return tables;
	}
	
	public void setTables(List<MetaTable> tables) {
		this.tables = tables;
	}
	
}
