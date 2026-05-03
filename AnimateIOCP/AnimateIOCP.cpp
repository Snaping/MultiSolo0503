
#include "pch.h"
#include "framework.h"
#include "AnimateIOCP.h"
#include "AnimateIOCPDlg.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CAnimateIOCPApp::CAnimateIOCPApp()
{
}

CAnimateIOCPApp theApp;

BEGIN_MESSAGE_MAP(CAnimateIOCPApp, CWinApp)
END_MESSAGE_MAP()

BOOL CAnimateIOCPApp::InitInstance()
{
    CWinApp::InitInstance();

    SetRegistryKey(_T("应用程序向导生成的本地应用程序"));

    CAnimateIOCPDlg dlg;
    m_pMainWnd = &amp;dlg;
    INT_PTR nResponse = dlg.DoModal();
    if (nResponse == IDOK)
    {
    }
    else if (nResponse == IDCANCEL)
    {
    }

    return FALSE;
}
