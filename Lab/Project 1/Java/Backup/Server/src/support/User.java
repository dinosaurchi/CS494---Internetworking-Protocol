package support;

public class User {
	private static final Character[] 
			illegalPasswordCharacters = {
					'\n'}; 
	private static final Character[] 
			illegalUserNameCharacters = {
					'\n', '"', '\\', ':', '?', ']', '[', '<', '>',
					',', '\'', '!', '#', '$', '%', '^', '&', '*',
					'(', ')', '+', '=', '~', '`', '|'};
	
	private String userName = null;
	private String password = null;
	
	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof User))
            return false;
        if (obj == this)
            return true;
        
        if (userName.equals(((User) obj).userName) &&
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
			this.userName = userName;
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
		return userName;
	}
	
	public static User getUserFromInfo(String usrInfo){
		if (usrInfo == null || usrInfo.length() < 3){
			return null;
		}
		
		if (usrInfo == null || usrInfo.length() < 3)
			return null;
		
		String[] temp = usrInfo.split(SpecialCharacters.SPLIT);
		String uName = temp[0];
		String uPass = temp[1];
		if (!isLegalUserName(uName) || !isLegalPassword(uPass))
			return null;
		
		User user = new User();
		user.setUserName(uName);
		user.setPassword(uPass);
		
		return user;
	}
}
