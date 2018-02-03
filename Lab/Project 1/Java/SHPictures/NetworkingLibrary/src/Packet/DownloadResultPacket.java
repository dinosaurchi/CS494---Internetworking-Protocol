package Packet;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

import javax.imageio.ImageIO;

import Entity.MyImageInfo;

public class DownloadResultPacket extends Packet implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -8133763017302414903L;
	public static final String PACKET_TYPE = "DOWNLOADRESULT";
	
	private MyImageInfo imageInfo;
	transient private BufferedImage downloadImage;
	
	private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        out.writeInt(1);
        ImageIO.write(downloadImage, imageInfo.getType(), out);
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        final int imageCount = in.readInt();
        downloadImage = ImageIO.read(in);
    }
	
	public DownloadResultPacket() {
		super.packetType = PACKET_TYPE;
	}
	
	public void setDownloadImageInfo(MyImageInfo imageInfo) {
		this.imageInfo = imageInfo;
	}

	public MyImageInfo getDownloadImageInfo() {
		return imageInfo;
	}

	public BufferedImage getDownloadImage() {
		return downloadImage;
	}

	public void setDownloadImage(String imageLink) {
		try {
			this.downloadImage = ImageIO.read(new File(imageLink));
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
