package Packet;

import java.io.Serializable;

public class EnteringPacket extends Packet implements Serializable{
	private static final long serialVersionUID = 6592468476289459664L;
	public static final String PACKET_TYPE = "ENTERING";
	private String userName = null;
	private String password = null;
	private String enteringType = null;
	
	public EnteringPacket(){
		super.packetType = PACKET_TYPE;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getEnteringType() {
		return enteringType;
	}

	public void setEnteringType(String enteringType) {
		this.enteringType = enteringType;
	}
	
	
}
