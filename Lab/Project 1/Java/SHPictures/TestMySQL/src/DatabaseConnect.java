

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnect {
	private Connection connection;
	private Statement statement;
	private ResultSet resultSet;
	
	public DatabaseConnect() {
		try {
			Class.forName("com.mysql.jdbc.Driver");
			connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/Hello", "root", "");
			statement = connection.createStatement();
			
		} catch (Exception e) {
			System.out.println("ERROR: " + e);
			e.printStackTrace();
		}
	}
	
	public void getData(String query) throws SQLException{
		resultSet = statement.executeQuery(query);
		while (resultSet.next()) {
			String name = resultSet.getString("username");
			String password = resultSet.getString("password");
			System.out.println("Username: " + name + " - Password: " + password);
		}
	}
}
