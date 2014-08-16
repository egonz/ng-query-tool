package com.ngquerytool.web.rest.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.annotation.JsonValue;

public class Row {

	private List<String> colNames;
	private List<RowValue> colValues;
	
	public Row() {

	}
	
	public List<String> getColNames() {
		return colNames;
	}


	public void setColNames(List<String> colNames) {
		this.colNames = colNames;
	}


	public List<RowValue> getColValues() {
		return colValues;
	}


	public void setColValues(List<RowValue> colValues) {
		this.colValues = colValues;
	}
	
	@JsonValue
    @JsonRawValue
    public String value() {
		StringBuffer json = new StringBuffer();
		
		json.append("{");
		
		for (int i = 0; i < colNames.size(); i++) {
			json.append("\"").append(colNames.get(i)).append("\":");
			
			switch (colValues.get(i).getType()) {
				case java.sql.Types.BIGINT:
	            case java.sql.Types.BOOLEAN:
	            case java.sql.Types.DOUBLE:
	            case java.sql.Types.FLOAT:
	            case java.sql.Types.INTEGER:
	            case java.sql.Types.SMALLINT:
	            case java.sql.Types.TINYINT:
	            	json.append(colValues.get(i).getValue());
	            	break;
	
	            case java.sql.Types.NVARCHAR :
	            case java.sql.Types.VARCHAR:
	            case java.sql.Types.DATE:
	            case java.sql.Types.TIMESTAMP:
	            	json.append("\"").append(colValues.get(i).getValue()).append("\"");
			}
			
			if ((i + 1) < colNames.size()) {
				json.append(",");
			}
		}
		
		json.append("}");
		
        return json.toString();
    }
	
}
