package Packet;

import java.io.Serializable;

public class DownloadRequestPacket extends Packet implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3391960516820566338L;
	public static final String PACKET_TYPE = "DOWNLOAD";
	
	private String imageId;
	
	public DownloadRequestPacket() {
		super.packetType = PACKET_TYPE;
	}
	
	public String getRequestedImageId() {
		// TODO Auto-generated method stub
		return imageId;
	}

	public void setDownloadImageId(String imageId) {
		this.imageId = imageId;
	}
}
