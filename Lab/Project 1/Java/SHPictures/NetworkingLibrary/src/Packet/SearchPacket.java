package Packet;

import java.io.Serializable;

public class SearchPacket extends Packet implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = -633607458577250870L;
	public static final String PACKET_TYPE = "SEARCH";
	
	private String content;
	private String filter;
	
	public SearchPacket() {
		super.packetType = PACKET_TYPE;
	}
	
	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getFilter() {
		return filter;
	}

	public void setFilter(String filter) {
		this.filter = filter;
	}
	
}
