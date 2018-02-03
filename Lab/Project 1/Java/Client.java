import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.Socket;
import java.util.ArrayList;

import javax.imageio.ImageIO;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTabbedPane;
import javax.swing.JTextField;

import Entity.SearchResult;
import Packet.DownloadRequestPacket;
import Packet.DownloadResultPacket;
import Packet.EnteringPacket;
import Packet.MessagePacket;
import Packet.Packet;
import Packet.SearchPacket;
import Packet.SearchResultPacket;
import support.MyJLabel;
import support.SpecialCharacters;

public class Client {
	private ObjectInputStream inStream = null;
	private ObjectOutputStream outStream = null;
    private JFrame frame = new JFrame("SHPictures");
	
    public Client() {
    	frame = new JFrame();
    	frame.setTitle("SHPictures");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.getContentPane().setLayout(null);
    }

    private String getServerAddress() {
        return JOptionPane.showInputDialog(
            frame,
            "Enter IP Address of the Server:",
            "SHPictures",
            JOptionPane.QUESTION_MESSAGE);
    }

    private String getName() {
        return JOptionPane.showInputDialog(
            frame,
            "Choose a screen name:",
            "Screen name selection",
            JOptionPane.PLAIN_MESSAGE);
    }
    
    boolean isLoginSuccessful = false;
    
    private JTextField userNameField = new JTextField(40);
    private JTextField passwordField = new JTextField(40);
    
    private void initializeLogin() throws IOException{
        JPanel panelLogin = null;
        
    	frame.setBounds(100, 100, 500, 220);
    	//panelLogin = (JPanel) frame.getContentPane();
    	panelLogin = new JPanel();
    	panelLogin.setBounds(0, 0, 500, 220);
		panelLogin.setLayout(null);
		
		JLabel labelUsername = new JLabel("Username");
		labelUsername.setBounds(110, 26, 124, 29);
		panelLogin.add(labelUsername);
		
		JLabel labelPassword = new JLabel("Password");
		labelPassword.setBounds(110, 81, 124, 29);
		panelLogin.add(labelPassword);
		
		JButton buttonLogin = new JButton("Login");
		buttonLogin.setBounds(100, 134, 155, 30);
		buttonLogin.setVisible(true);
		buttonLogin.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				EnteringPacket enteringPacket = new EnteringPacket();
				enteringPacket.setEnteringType(SpecialCharacters.LOGIN);
				enteringPacket.setUserName(userNameField.getText());
		    	enteringPacket.setPassword(passwordField.getText());
		        try {
		        	outStream.writeObject(enteringPacket);
		        	Packet responsePacket = (Packet) inStream.readObject();
		        	if (responsePacket.getPacketType().equals(MessagePacket.PACKET_TYPE)){
		        		MessagePacket responseMessagePacket = (MessagePacket) responsePacket;
		        		String message = responseMessagePacket.getMessage();
		        		if (message.equals(SpecialCharacters.WRONG_INPUT)){
		        			isLoginSuccessful = false;
		        			JOptionPane.showMessageDialog(null, "This user is not existing");
		        		}
		        		else if (message.equals(SpecialCharacters.SUCCESS)) {
		        			isLoginSuccessful = true;
		        		}
		        		else if (message.equals(SpecialCharacters.HAS_BEEN_ONLINE)) {
		        			isLoginSuccessful = false;
		        			JOptionPane.showMessageDialog(null, "This user is online now");
		        		}
		        	}
				} catch (IOException e1) {
					e1.printStackTrace();
				} catch (ClassNotFoundException e1) {
					e1.printStackTrace();
				}
			}
		});
		panelLogin.add(buttonLogin);
				
		JButton buttonSignup = new JButton("Register");
		buttonSignup.setBounds(280, 134, 155, 30);
		buttonSignup.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				EnteringPacket enteringPacket = new EnteringPacket();
				enteringPacket.setEnteringType(SpecialCharacters.SIGNUP);
				enteringPacket.setUserName(userNameField.getText());
		    	enteringPacket.setPassword(passwordField.getText());
		        try {
					outStream.writeObject(enteringPacket);
					Packet responsePacket = (Packet) inStream.readObject();
					if (responsePacket.getPacketType().equals(MessagePacket.PACKET_TYPE)){
						MessagePacket responseMessagePacket = (MessagePacket) responsePacket;
						String message = responseMessagePacket.getMessage();
						if (message.equals(SpecialCharacters.WRONG_INPUT)){
							isLoginSuccessful = false;
							JOptionPane.showMessageDialog(null, "This user is already existing");
						}
						else if (message.equals(SpecialCharacters.SUCCESS)) {
							isLoginSuccessful = true;
						}
					}
				} catch (IOException e1) {
					e1.printStackTrace();
				} catch (ClassNotFoundException e1) {
					e1.printStackTrace();
				}
			}
		});
		panelLogin.add(buttonSignup);
				
		userNameField.setBounds(200, 26, 200, 29);
		panelLogin.add(userNameField);
		passwordField.setBounds(200, 81, 200, 29);
		panelLogin.add(passwordField);
		
		frame.add(panelLogin);
		frame.pack();
		frame.setBounds(100, 100, 500, 220);
		
		frame.setResizable(false);
		frame.setVisible(true);
    }
    
    JPanel resultImagePanel = null;
    JComboBox<String> filtersDropdownList = null;
    JTextField searchContentTextField = null;
    int i = 0;
    
    private void initializeFunctioning() {
    	frame.dispose();
    	frame = new JFrame("SHPictures");
    	frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		//frame.getContentPane().setLayout(null);
		
		JTabbedPane tabbedPane = new JTabbedPane(JTabbedPane.TOP);
		tabbedPane.setBounds(0, 0, 800, 600);
		frame.add(tabbedPane);
		
		JPanel panelSearch = new JPanel();
		tabbedPane.addTab("Search", null, panelSearch, null);
		panelSearch.setLayout(null);
		
		JButton buttonSearch = new JButton("Search");
		buttonSearch.setBounds(690, 20, 80, 28);
		buttonSearch.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				String searchContent = searchContentTextField.getText();
				String filter = filtersDropdownList.getSelectedItem().toString();
				SearchPacket searchPacket = new SearchPacket();
				searchPacket.setContent(searchContent);
				searchPacket.setFilter(filter);
				try {
					outStream.writeObject(searchPacket);
					Packet responsePacket = (Packet) inStream.readObject();
		        	if (responsePacket.getPacketType().equals(SearchResultPacket.PACKET_TYPE)){
		        		SearchResultPacket resultPacket = (SearchResultPacket) responsePacket;
		        		ArrayList<SearchResult> results = resultPacket.getSearchResults();
		        		if (results != null) {
		        			clearThumbnails();
		        			for (SearchResult r : results) {
		        				updateThumbnails(r.getThumbnail(), r.getImageId());
		        			}
		        		}
		        	}
				} catch (IOException e1) {
					e1.printStackTrace();
				} catch (ClassNotFoundException e1) {
					e1.printStackTrace();
				}
				System.out.println("Sent a search packet");
			}
		});
		panelSearch.add(buttonSearch);
		
		String[] filters = {"Owner", "Theme"};

		filtersDropdownList = new JComboBox<String>(filters);
		filtersDropdownList.setBounds(585, 20, 100, 30);
		filtersDropdownList.setSelectedIndex(0);
		panelSearch.add(filtersDropdownList);
		
		searchContentTextField = new JTextField(40);
		searchContentTextField.setBounds(15, 20, 550, 28);
		panelSearch.add(searchContentTextField);
						
		resultImagePanel = new JPanel(new GridLayout(0, 4, 5, 5));
		
		JScrollPane scrollingPanel = new JScrollPane(resultImagePanel);
		scrollingPanel.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
		scrollingPanel.setLocation(15,  60);
		scrollingPanel.setSize(750, 450);
		
		panelSearch.add(scrollingPanel);
		
		JPanel panelUpload = new JPanel();
		tabbedPane.addTab("Upload", null, panelUpload, null);
		panelUpload.setLayout(null);
		
		frame.pack();
		frame.setBounds(100, 100, 800, 600);
		frame.setResizable(false);
		frame.setVisible(true);
	}
    
    private void clearThumbnails() {
    	resultImagePanel.removeAll();
    	resultImagePanel.revalidate();
    	resultImagePanel.repaint();
    }
    
    private void updateThumbnails(BufferedImage thumbnail, String imageId) {
    	final MyJLabel label = new MyJLabel(imageId);
    	ImageIcon icon =  new ImageIcon(thumbnail);
    	Image image = icon.getImage(); // transform it 
    	Image newimg = image.getScaledInstance(180, 180,  java.awt.Image.SCALE_SMOOTH); // scale it the smooth way  
    	icon = new ImageIcon(newimg);  // transform it back
    	label.setIcon(icon);
    	label.addMouseListener(new MouseListener() {
			@Override
			public void mouseReleased(MouseEvent e) {}
			
			@Override
			public void mousePressed(MouseEvent e) {}
			
			@Override
			public void mouseExited(MouseEvent e) {}
			
			@Override
			public void mouseEntered(MouseEvent e) {}
			
			@Override
			public void mouseClicked(MouseEvent e) {
				String mess = "Do you want to download image '" + label.getImageId() + "' ? ";
				int dialogResult = JOptionPane.showConfirmDialog(null, mess, "Download", JOptionPane.YES_NO_OPTION);
				if (dialogResult == JOptionPane.YES_OPTION){
					DownloadRequestPacket packet = new DownloadRequestPacket();
					packet.setDownloadImageId(label.getImageId());
					try {
						outStream.writeObject(packet);
						Packet responsePacket = (Packet) inStream.readObject();
			        	if (responsePacket.getPacketType().equals(DownloadResultPacket.PACKET_TYPE)){
			        		DownloadResultPacket result = (DownloadResultPacket) responsePacket;
			        		if (storeImage(result.getDownloadImage())){
			        			JOptionPane.showConfirmDialog(null, result.getDownloadImageInfo().getInfoString(), "Download successful", JOptionPane.PLAIN_MESSAGE);
			        		}
			        	}
					} catch (IOException e1) {
						e1.printStackTrace();
					} catch (ClassNotFoundException e1) {
						e1.printStackTrace();
					}
				}
			}

			private boolean storeImage(BufferedImage downloadImage) {
				
				
				return false;
			}
		});
    	resultImagePanel.add(label);
    	resultImagePanel.revalidate();
    	resultImagePanel.repaint();
    }

    private void run() throws IOException, ClassNotFoundException {

        // Make connection and initialize streams
        // String serverAddress = getServerAddress();
        @SuppressWarnings("resource")
		Socket socket = new Socket("localhost", 9002);
                                
        outStream = new ObjectOutputStream(socket.getOutputStream());
        inStream = new ObjectInputStream(socket.getInputStream());
        
//        initializeLogin();
//        while (!isLoginSuccessful) {
//        	System.out.println(isLoginSuccessful);
//        };
        
        System.out.println("Login Successful");
        
        // Functioning
        
        initializeFunctioning();
        while (true) {
        	Packet responsePacket = inStream.readObject();
        }
    }

	public static void main(String[] args) throws Exception {
    	Client client = new Client();
		client.frame.setVisible(true);
        client.run();
    	
//    	EventQueue.invokeLater(new Runnable() {
//			public void run() {
//				try {
//					Client client = new Client();
//					client.frame.setVisible(true);
//			        client.run();
//				} catch (Exception e) {
//					e.printStackTrace();
//				}
//			}
//		});    	
    }
}