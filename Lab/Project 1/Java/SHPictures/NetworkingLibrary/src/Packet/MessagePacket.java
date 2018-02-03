package Packet;

import java.io.Serializable;

public class MessagePacket extends Packet implements Serializable{
	private static final long serialVersionUID = -1531738219812520637L;

	public static final String PACKET_TYPE = "MESSAGE";
	private String message = null;
	
	public MessagePacket(){
		super.packetType = PACKET_TYPE;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	
	
}
