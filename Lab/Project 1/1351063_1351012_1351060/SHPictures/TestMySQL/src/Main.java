import java.sql.SQLException;

public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
			DatabaseConnect dbc = new DatabaseConnect();
			try {
				dbc.getData("SELECT * FROM USER");
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			System.out.println("Finished!");
	}

}
