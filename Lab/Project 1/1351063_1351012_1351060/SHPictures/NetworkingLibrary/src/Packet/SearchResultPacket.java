package Packet;

import java.io.Serializable;
import java.util.ArrayList;

import Entity.SearchResult;

public class SearchResultPacket extends Packet implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4363232827109216605L;
	public static final String PACKET_TYPE = "SEARCHRESULT";

	ArrayList<SearchResult> results = new ArrayList<>();
	
	public SearchResultPacket(ArrayList<SearchResult> results) {
		super.packetType = PACKET_TYPE;
		if (results != null)
			this.results = results;
	}
	
	public void addSearchResult(SearchResult result) {
		results.add(result);
	}
	
	public ArrayList<SearchResult> getSearchResults(){
		return results;
	}
}
