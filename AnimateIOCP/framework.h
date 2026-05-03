
#pragma once

#ifndef WINVER
#define WINVER 0x0501
#endif

#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0501
#endif                        

#ifndef _WIN32_WINDOWS
#define _WIN32_WINDOWS 0x0410
#endif

#ifndef _WIN32_IE
#define _WIN32_IE 0x0600
#endif

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS

#include &lt;afxwin.h&gt;
#include &lt;afxext.h&gt;

#ifndef _AFX_NO_OLE_SUPPORT
#include &lt;afxole.h&gt;
#include &lt;afxodlgs.h&gt;
#include &lt;afxdisp.h&gt;
#endif

#ifndef _AFX_NO_DB_SUPPORT
#include &lt;afxdb.h&gt;
#endif

#ifndef _AFX_NO_DAO_SUPPORT
#include &lt;afxdao.h&gt;
#endif

#ifndef _AFX_NO_OLE_SUPPORT
#include &lt;afxdtctl.h&gt;
#endif

#ifndef _AFX_NO_AFXCMN_SUPPORT
#include &lt;afxcmn.h&gt;
#endif
