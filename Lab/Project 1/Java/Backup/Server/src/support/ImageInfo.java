package support;

public class ImageInfo {
	private String imageId = null;
	private String imageName = null;
	private String theme = null;
	private String type = null;
	private int height = 0;
	private int width = 0;
	private String note = null;
	
	public static ImageInfo parseImageInfo(String info) {
		if (info == null || info.length() < 1)
			return null;
		String[] temp = info.split(SpecialCharacters.SPLIT);
		if (temp.length < 6)
			return null;
		
		ImageInfo image = new ImageInfo();
		image.setImageName(temp[0]);
		image.setTheme(temp[1]);
		image.setType(temp[2]);
		image.setHeight(Integer.parseInt(temp[3]));
		image.setWidth(Integer.parseInt(temp[4]));
		image.setNote(temp[5]);
		
		return image;
	}


	public String getImageId() {
		return imageId;
	}


	public void setImageId(String imageId) {
		this.imageId = imageId;
	}


	public String getImageName() {
		return imageName;
	}


	public void setImageName(String imageName) {
		this.imageName = imageName;
	}


	public int getHeight() {
		return height;
	}


	public void setHeight(int height) {
		this.height = height;
	}


	public int getWidth() {
		return width;
	}


	public void setWidth(int width) {
		this.width = width;
	}


	public String getNote() {
		return note;
	}


	public void setNote(String note) {
		this.note = note;
	}


	public String getTheme() {
		return theme;
	}


	public void setTheme(String theme) {
		this.theme = theme;
	}


	public String getType() {
		return type;
	}


	public void setType(String type) {
		this.type = type;
	}

	
	
}
