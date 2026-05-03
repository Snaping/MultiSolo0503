
#ifndef PCH_H
#define PCH_H

#ifndef VC_EXTRALEAN
#define VC_EXTRALEAN            
#endif

#include "targetver.h"

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS      
#define _AFX_ALL_WARNINGS

#include &lt;afxwin.h&gt;         
#include &lt;afxext.h&gt;         
#include &lt;afxdisp.h&gt;        

#ifndef _AFX_NO_OLE_SUPPORT
#include &lt;afxdtctl.h&gt;       
#endif
#ifndef _AFX_NO_AFXCMN_SUPPORT
#include &lt;afxcmn.h&gt;         
#endif 

#include &lt;winsock2.h&gt;
#include &lt;mswsock.h&gt;
#include &lt;ws2tcpip.h&gt;
#pragma comment(lib, "ws2_32.lib")

#endif
