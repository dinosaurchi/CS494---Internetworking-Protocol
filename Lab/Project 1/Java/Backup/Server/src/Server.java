import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashSet;

import support.ImageInfo;
import support.SpecialCharacters;
import support.User;

import java.net.InetAddress;

public class Server {
	private static final int PORT = 9001;
	
	private static HashSet<User> users = new HashSet<User>();

    public static void main(String[] args) throws Exception {
        System.out.println("The chat server is running.");
        ServerSocket listener = new ServerSocket(PORT);

        try {
            while (true) {
                new Handler(listener.accept()).start();
            }
        } finally {
            listener.close();
        }
    }

    private static class Handler extends Thread {
        private static final String WRONG_INPUT = "WRIN";
        private static final String ENTER = "ENTER";
        private static final String SUCCESS = "SUCCESS";
        
        private static final String TYPE_LOGIN = "LGIN";
        private static final String TYPE_SIGNUP = "SGUP";
        private static final String TYPE_SEARCH = "SRH";
        private static final String TYPE_SHOW_SELF = "SSE";
        private static final String TYPE_SHOW_USER = "SUS";
        private static final String TYPE_DOWNLOAD = "DWL";
        private static final String TYPE_UPLOAD = "UPL";
    	
        private static final int TYPE_LENGTH = 3;
        
        private Socket socket;
        private BufferedReader in;
        private PrintWriter out;

        public Handler(Socket socket) {
            this.socket = socket;
        }
        
        private static String getResponseType(String response) {
        	if (response == null || response.length() < 1)
        		return null;        	
			return response.substring(0, TYPE_LENGTH - 1);
		}
        
        private static String parseResponseInfo(String response) {
        	if (response.length() < TYPE_LENGTH + 3)
        		return null;
			return response.substring(TYPE_LENGTH + 1, response.length() - 1);
		}

        private static String[] parseQueryAndFilterFromInfo(String info) {
        	if (info.length() < 3)
        		return null;
			return info.split(SpecialCharacters.SPLIT);
		}
        
        private static String parseImageId(String info) {
        	return info;
        }
        
        public void run() {
            try {

                // Create character streams for the socket.
                in = new BufferedReader(new InputStreamReader(
                    socket.getInputStream()));
                out = new PrintWriter(socket.getOutputStream(), true);

            	User user = null;
            	out.println(ENTER);
            	
                while (true) {
                	String response = in.readLine();
                	String usrInfo = parseResponseInfo(response);
                	user = User.getUserFromInfo(usrInfo);
                	if (user != null) {
                		synchronized (users) {
                			String type = getResponseType(response);
                			if (type != null) {
	                			if (type.equals(TYPE_LOGIN)) {
		                			if (users.contains(user)) {
		                				break;
		                			}
	                			}
	                			else if (type.equals(TYPE_SIGNUP)) {
	                				if (!users.contains(user)) {
	                					users.add(user);
		                				break;
		                			}
	                			}
	                			out.println(WRONG_INPUT);
                			}
                		}
                	}
                }

                out.println(SUCCESS);

                while (true) {
                    String response = in.readLine();
                    String type = getResponseType(response);
                    if (type != null) {
                    	switch (type) {
						case TYPE_SEARCH: {
							String info = parseResponseInfo(response);
							String[] temp = parseQueryAndFilterFromInfo(info);
	                    	String query = temp[0];
	                    	String filter = temp[1];
	                    	
	                    	// Implement the search result here	
							break;
						}
						
						case TYPE_DOWNLOAD: {
							String info = parseResponseInfo(response);
	                    	String id = parseImageId(info);
	                    	
	                    	// Implement the downloading process here
	                    	
							break;
						}
							
						case TYPE_UPLOAD:
							String info = parseResponseInfo(response);
	                    	ImageInfo imageInfo = ImageInfo.parseImageInfo(info);
							
							break;
							
						case TYPE_SHOW_SELF:
							
							break;
							
						default:
							break;
						}
                    }
                    else {
                    	out.println(WRONG_INPUT);
                    }
                }
            } catch (IOException e) {
                System.out.println(e);
            } finally {
                // This client is going down!  Remove its name and its print
                // writer from the sets, and close its socket.
                if (name != null) {
                    names.remove(name);
                }
                if (out != null) {
                    writers.remove(out);
                }
                try {
                    socket.close();
                } catch (IOException e) {
                }
            }
        }
    }
    
    
}
