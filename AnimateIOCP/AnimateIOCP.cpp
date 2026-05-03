#include "pch.h"
#include "AnimateIOCP.h"
#include "AnimateIOCPDlg.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CAnimateIOCPApp theApp;

BEGIN_MESSAGE_MAP(CAnimateIOCPApp, CWinApp)
END_MESSAGE_MAP()

BOOL CAnimateIOCPApp::InitInstance()
{
    CWinApp::InitInstance();

    SetRegistryKey(_T("Application Wizard Generated Local Application"));

    CAnimateIOCPDlg dlg;
    m_pMainWnd = &dlg;
    INT_PTR nResponse = dlg.DoModal();
    if (nResponse == IDOK)
    {
    }
    else if (nResponse == IDCANCEL)
    {
    }

    return FALSE;
}
