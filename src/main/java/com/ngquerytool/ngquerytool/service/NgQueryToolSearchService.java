package com.ngquerytool.service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ngquerytool.web.rest.dto.NgQueryToolSearchResultDTO;
import com.ngquerytool.web.rest.dto.Row;
import com.ngquerytool.web.rest.dto.RowValue;

@Service
@Transactional
public class NgQueryToolSearchService {

	private final Logger log = LoggerFactory
			.getLogger(NgQueryToolSearchService.class);

	@Inject
	private DataSource dataSource;

	public NgQueryToolSearchResultDTO search(String sql, 
			String[] bindVars, Integer page, Integer rp) {
		NgQueryToolSearchResultDTO result = new NgQueryToolSearchResultDTO();

		Connection conn = null;

		try {
			conn = dataSource.getConnection();
			
			PreparedStatement st = conn.prepareStatement(sql);
            if (bindVars != null) {
                for (int i = 0; i < bindVars.length; i++) {
                    st.setString(i + 1, bindVars[i]);
                }
            }
            
            ResultSet rs = st.executeQuery();
            ResultSetMetaData rsmd = rs.getMetaData();
            int numColumns = rsmd.getColumnCount();
            
            int r0 = page * rp;
            int r1 = r0 + rp;
            
            List<Row> rows = new ArrayList<Row>();
            
            int count = -1;
            while (rs.next()) {
                count++;
                if (count < r0 || count >= r1) {
                    continue;
                }
                
                Row row = new Row();
                List<String> colNames = new ArrayList<String>();
            	List<RowValue> colValues = new ArrayList<RowValue>();
                
                for (int i = 1; i < numColumns + 1; i++) {
                	colNames.add(rsmd.getColumnName(i));
                	
                    // TODO 01 nulls!
                    switch (rsmd.getColumnType(i)) {
                    case java.sql.Types.BIGINT:
                    	colValues.add(new RowValue(rs.getInt(i), java.sql.Types.BIGINT));
                        break;
                    case java.sql.Types.BOOLEAN:
                    	colValues.add(new RowValue(rs.getBoolean(i), java.sql.Types.BOOLEAN));
                        break;
                    case java.sql.Types.DOUBLE:
                    	colValues.add(new RowValue(rs.getDouble(i), java.sql.Types.DOUBLE));
                        break;
                    case java.sql.Types.FLOAT:
                    	colValues.add(new RowValue(rs.getFloat(i), java.sql.Types.FLOAT));
                        break;
                    case java.sql.Types.INTEGER:
                    case java.sql.Types.SMALLINT:
                    case java.sql.Types.TINYINT:
                    	colValues.add(new RowValue(rs.getInt(i), java.sql.Types.INTEGER));
                        break;
                    case java.sql.Types.VARCHAR:
                    	colValues.add(new RowValue(rs.getString(i), java.sql.Types.VARCHAR));
                        break;
                    case java.sql.Types.DATE:
                    	colValues.add(new RowValue(rs.getDate(i), java.sql.Types.DATE));
                        break;
                    case java.sql.Types.TIMESTAMP:
                    	colValues.add(new RowValue(rs.getTimestamp(i), java.sql.Types.TIMESTAMP));
                        break;
                    default:
                    	colValues.add(new RowValue(rs.getString(i), java.sql.Types.VARCHAR));
                    }
                }
                
                row.setColNames(colNames);
                row.setColValues(colValues);
                rows.add(row);
            }
            
            result.setRows(rows);
            result.setPage(page + 1);
            result.setTotal(count + 1);
            
		} catch (SQLException e) {
			log.error("Error getting  database metadata.", e);
		} finally {
			if (conn != null) {
				try {
					conn.close();
				} catch (SQLException e) {
					log.error("Error closing Connection.", e);
				}
			}
		}

		return result;
	}
	
}
