package Packet;

import java.io.Serializable;

public abstract class Packet implements Serializable{
	private static final long serialVersionUID = 5950169519310163575L;

	protected String packetType = null;
	public String getPacketType(){
		return packetType;
	}
}
