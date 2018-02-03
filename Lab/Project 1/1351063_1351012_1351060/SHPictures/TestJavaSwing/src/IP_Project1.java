import java.awt.EventQueue;

import javax.swing.JFrame;
import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JTextField;
import javax.swing.JTabbedPane;
import javax.swing.JPanel;
import javax.swing.JTextArea;
import javax.swing.JLabel;
import javax.swing.JList;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.awt.event.ActionEvent;
import javax.swing.JFileChooser;



public class IP_Project1 {

	private JFrame frame;
	private JTextField textFieldName;
	private JTextField textFieldTheme;
	private JTextField textFieldBrowse;

	/**
	 * Launch the application.
	 */
	public static void main(String[] args) {
		EventQueue.invokeLater(new Runnable() {
			public void run() {
				try {
					IP_Project1 window = new IP_Project1();
					window.frame.setVisible(true);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * Create the application.
	 */
	public IP_Project1() {
		initialize();
	}

	/**
	 * Initialize the contents of the frame.
	 */
	private void initialize() {
		frame = new JFrame();
		frame.setBounds(100, 100, 900, 900);
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.getContentPane().setLayout(null);
		
		JTabbedPane tabbedPane = new JTabbedPane(JTabbedPane.TOP);
		tabbedPane.setBounds(0, 0, 872, 821);
		frame.getContentPane().add(tabbedPane);
		
		JPanel panelLogin = new JPanel();
		tabbedPane.addTab("Login", null, panelLogin, null);
		panelLogin.setLayout(null);
		
		JButton btnLogin = new JButton("Login");
		btnLogin.setBounds(387, 134, 155, 37);
		panelLogin.add(btnLogin);
		
		JTextArea textAreaUsername = new JTextArea();
		textAreaUsername.setBounds(149, 24, 696, 31);
		panelLogin.add(textAreaUsername);
		
		JTextArea textAreaPassword = new JTextArea();
		textAreaPassword.setBounds(149, 79, 696, 31);
		panelLogin.add(textAreaPassword);
		
		JLabel lblUsername = new JLabel("Username");
		lblUsername.setBounds(22, 26, 124, 29);
		panelLogin.add(lblUsername);
		
		JLabel lblPassword = new JLabel("Password");
		lblPassword.setBounds(22, 81, 104, 29);
		panelLogin.add(lblPassword);
		
		JPanel panelSearch = new JPanel();
		tabbedPane.addTab("Search", null, panelSearch, null);
		panelSearch.setLayout(null);
		
		JButton btnNewButton = new JButton("Search");
		btnNewButton.setBounds(22, 70, 155, 37);
		panelSearch.add(btnNewButton);
		
		JTabbedPane tabbedPane_1 = new JTabbedPane(JTabbedPane.TOP);
		tabbedPane_1.setBounds(205, 24, 640, 84);
		panelSearch.add(tabbedPane_1);
		
		JPanel panelName = new JPanel();
		tabbedPane_1.addTab("Name", null, panelName, null);
		panelName.setLayout(null);
		
		textFieldName = new JTextField();
		textFieldName.setBounds(0, 0, 635, 41);
		panelName.add(textFieldName);
		textFieldName.setColumns(10);
		
		JPanel panelTheme = new JPanel();
		tabbedPane_1.addTab("Theme", null, panelTheme, null);
		panelTheme.setLayout(null);
		
		textFieldTheme = new JTextField();
		textFieldTheme.setBounds(0, 0, 635, 41);
		panelTheme.add(textFieldTheme);
		textFieldTheme.setColumns(10);
		
		JLabel labelImage = new JLabel("Image");
		labelImage.setBounds(22, 147, 104, 29);
		panelSearch.add(labelImage);
		
		JList list = new JList();
		list.setBounds(22, 182, 823, 572);
		panelSearch.add(list);
		
		JPanel panelUpload = new JPanel();
		tabbedPane.addTab("Upload", null, panelUpload, null);
		panelUpload.setLayout(null);
	
		
	}
}
