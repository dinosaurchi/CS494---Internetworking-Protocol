package database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;

public class DatabaseConnect {
	private Connection connection;
	private Statement statement;
	private Integer DB_PORT = 3306;
	private String DB_NAME = "SHPictures";
	private String DB_USERNAME = "root";
	private String DB_PASSWORD = "";
	
	public DatabaseConnect() {
		try {
			Class.forName("com.mysql.jdbc.Driver");
			connection = DriverManager.
					getConnection("jdbc:mysql://localhost:" + 
							DB_PORT + "/" + 
							DB_NAME, 
							DB_USERNAME, 
							DB_PASSWORD);
			statement = connection.createStatement();
		} catch (Exception e) {
			System.out.println("ERROR: " + e);
			e.printStackTrace();
		}
	}
	
	public int putDataImageInfo(String query) throws SQLException {
		//int newId = statement.executeUpdate(query, Statement.RETURN_GENERATED_KEYS);
		System.out.println(query);
		PreparedStatement pstmt = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);  
		pstmt.executeUpdate();  
		ResultSet keys = pstmt.getGeneratedKeys();   
		keys.next();  
		int newId = keys.getInt(1);
		
		if (newId > 0)
			return newId;
		return -1;
	}
	
	public boolean putDataUser(String query) throws SQLException {
		return statement.executeUpdate(query) > 0;
	}
	
	public static final int RETRIEVE_ALL_ENTITIES = -1;
	public ArrayList<HashMap<String, String>> getData(String query, int maxNumberOfEntities) throws SQLException {
		System.out.println(query);
		ResultSet resultSet = statement.executeQuery(query);

		int count = 0;
		ArrayList<HashMap<String, String>> result = new ArrayList<>();
		while (resultSet.next()) {
			// If max number of entities is -1 => we just returns all of the retrieved entities
			if (maxNumberOfEntities > RETRIEVE_ALL_ENTITIES){
				if (count >= maxNumberOfEntities) 
					break;
				++count;
			}
			
			ResultSetMetaData rsmd = resultSet.getMetaData();
			
			int n = rsmd.getColumnCount();
			HashMap<String, String> entityMap = new HashMap<>();
			for (int i = 1 ; i <= n ; ++i) {
				String colum = rsmd.getColumnName(i);
				entityMap.put(colum, resultSet.getString(colum));
			}
			result.add(entityMap);
			
			++count;
		}
		
		return result;
	}

	public void update(String query) {
		try {
			statement.executeUpdate(query);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
