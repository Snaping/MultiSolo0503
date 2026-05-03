#pragma once

#ifndef __AFXWIN_H__
    #error "Include 'pch.h' before including this file for PCH"
#endif

#include "resource.h"

class CAnimateIOCPApp : public CWinApp
{
public:
    CAnimateIOCPApp();

public:
    virtual BOOL InitInstance();

    DECLARE_MESSAGE_MAP()
};
