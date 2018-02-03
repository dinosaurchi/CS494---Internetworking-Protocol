// client.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "client.h"
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
		CSocket client;
		char s_str[100], r_str[100];

		AfxSocketInit(NULL);

		//1. Tao socket
		client.Create();

		// njhap dc IP cua server
		if (client.Connect("127.0.0.1",1234))
		{
			do
			{
				int len = client.Receive(r_str,2,0);
				r_str[len] = 0;
				printf("\n Server: %s",r_str);

				printf("\n Client: ");
				 gets(s_str);
				client.Send(s_str,strlen(s_str),0);
			} while (strcmp(r_str,"exit") && strcmp(s_str,"exit"));

			client.Close();

		}
		else
			printf("Khong connect duoc toi server....");
	}

	return nRetCode;
}


