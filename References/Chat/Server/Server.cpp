// Server.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "Server.h"
#include "afxsock.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// The one and only application object

CWinApp theApp;

using namespace std;

int _tmain(int argc, TCHAR* argv[], TCHAR* envp[])
{
	int nRetCode = 0;

	// initialize MFC and print and error on failure
	if (!AfxWinInit(::GetModuleHandle(NULL), NULL, ::GetCommandLine(), 0))
	{
		// TODO: change error code to suit your needs
		cerr << _T("Fatal Error: MFC initialization failed") << endl;
		nRetCode = 1;
	}
	else
	{
		// TODO: code your application's behavior here.
	//	socket
		CSocket server, client;
		char s_str[100], r_str[100];

		int len;
	
		AfxSocketInit(NULL);

		
		server.Create(1234);
		//server.Create(
		//server.GetLastError
		//server.Create(
		
		server.Listen();


		printf("Dang cho 1 ket noi..\n");

		if (server.Accept(client))
		{
			printf("Da chap nhan 1 ket noi..\n");
			do
			{
				printf("\nServer	: ");
				gets(s_str);
				len = strlen(s_str);
				client.Send(s_str,len,0);
				//client.Send(
				
				len = client.Receive(r_str,100,0);
				// gan ket thuc chuoi
				r_str[len] = 0;						
				// hien thi chuoi nhan duoc ra man hinh
				printf("\nCleint: %s",r_str);		

			}while (strcmp(r_str,"exit") && strcmp(s_str,"exit"));

			client.Close();

		}

		server.Close();
	}

	return nRetCode;
}


