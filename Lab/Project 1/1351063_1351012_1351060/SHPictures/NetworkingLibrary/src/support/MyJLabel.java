package support;

import javax.swing.JLabel;

public class MyJLabel extends JLabel {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String imageId;
	public MyJLabel(String imageId) {
		this.setImageId(imageId);
	}
	public String getImageId() {
		return imageId;
	}
	public void setImageId(String imageId) {
		this.imageId = imageId;
	}
	
	
}
