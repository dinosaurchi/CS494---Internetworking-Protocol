package Entity;
import java.lang.Math;

public class User {
	private static final Character[] 
			illegalPasswordCharacters = {
					'\n'}; 
	private static final Character[] 
			illegalUserNameCharacters = {
					'\n', '"', '\\', ':', '?', ']', '[', '<', '>',
					',', '\'', '!', '#', '$', '%', '^', '&', '*',
					'(', ')', '+', '=', '~', '`', '|'};
	
	private String username = null;
	private String password = null;
	
	public static String[] getAllAttributeNames() {
		String [] a = {"username", "password"};
		return a;
	}
	
	public String[] getAllValues() {
		String[] a = {username, password};
		return a;
	}
	
	private int getHashCode(){
		int code = 0;
		String temp = username + password;
		for (int i = 0 ; i < temp.length(); ++i) {
			code += (temp.charAt(i)) * Math.pow(2, i);
		}
		return code;
	}
	
	@Override
	public int hashCode() {
		return getHashCode();
	}
	
	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof User))
            return false;
        if (obj == this)
            return true;
        
        if (username.equals(((User) obj).username) &&
        		password.equals(((User) obj).password)) {
        	return true;
        }
        
		return false;
	}
	
	public static boolean isLegalUserName(String userName){
		if (userName == null || userName.length() < 1)
			return false;
		
		for (int i = 0 ; i < userName.length(); ++i) {
			for (Character c : illegalUserNameCharacters){
				if (c.equals(userName.charAt(i)))
					return false;
			}
		}
		return true;
	}
	
	public boolean setUserName(String userName) {
		if (isLegalUserName(userName)){ 
			this.username = userName;
			return true;
		}
		return false;
	}
	
	public static boolean isLegalPassword(String password){
		if (password == null || password.length() < 1)
			return false;
		
		for (int i = 0 ; i < password.length(); ++i) {
			for (Character c : illegalPasswordCharacters){
				if (c.equals(password.charAt(i)))
					return false;
			}
		}
		return true;
	}
	
	public boolean setPassword(String password) {
		if (isLegalPassword(password)) {
			this.password = password;
			return true;
		}
		return false;
	}
	
	public String getPassword(){
		return password;
	}
	
	public String getUserName(){
		return username;
	}
}
