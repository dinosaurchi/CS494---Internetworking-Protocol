package support;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import Entity.MyImageInfo;

public class SupportFunction {
	public static boolean storeImage(String path, String extension, BufferedImage image) {
		String storePath = path;
		File outputfile = new File(storePath);
	    try {
			if (ImageIO.write(image, extension, outputfile))
				return true;
			return false;
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
	}
	
	public static String getStorePath(String imageStorageDir, MyImageInfo info) {
		return imageStorageDir + "/" + info.getImageId() + "." + info.getType();
	}
	
	public static String parseToQueryString(String[] allAttributeNames, boolean withUpperColon, boolean isIncludeImageId) {
		String a = "";
		if (withUpperColon)
			a = "'";
		if (allAttributeNames != null && allAttributeNames.length > 0) {
			String result = "(";
			int i = 1;
			if (isIncludeImageId)
				i = 0;;
			
			for (; i < allAttributeNames.length - 1; ++i) {
				result += a + allAttributeNames[i] + a + ", ";
			}
			if (allAttributeNames.length > 0)
				result += a + allAttributeNames[allAttributeNames.length - 1] + a;
			return result + ")";
		}
		return null;
	}
}
