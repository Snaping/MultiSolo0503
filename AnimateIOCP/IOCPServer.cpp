
#include "pch.h"
#include "IOCPServer.h"

CIOCPServer::CIOCPServer()
    : m_hCompletionPort(NULL)
    , m_ListenSocket(INVALID_SOCKET)
    , m_nPort(8888)
    , m_nThreadCount(4)
    , m_bRunning(false)
    , m_pAcceptThread(NULL)
    , m_pEventCallback(NULL)
    , m_nNextClientId(1)
{
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &amp;wsaData);
}

CIOCPServer::~CIOCPServer()
{
    Shutdown();
    WSACleanup();
}

bool CIOCPServer::Initialize(int port, int threadCount, OnIOEventCallback callback)
{
    m_nPort = port;
    m_nThreadCount = threadCount;
    m_pEventCallback = callback;
    
    if (!CreateIOCompletionPort())
        return false;
    
    if (!CreateListenSocket())
        return false;
    
    return true;
}

bool CIOCPServer::CreateIOCompletionPort()
{
    m_hCompletionPort = CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, m_nThreadCount);
    if (m_hCompletionPort == NULL)
    {
        if (m_pEventCallback)
            m_pEventCallback(0, _T("ERROR"), _T("创建IOCP失败"));
        return false;
    }
    
    if (m_pEventCallback)
        m_pEventCallback(0, _T("CREATE"), _T("IOCP完成端口创建成功"));
    
    return true;
}

bool CIOCPServer::CreateListenSocket()
{
    m_ListenSocket = WSASocket(AF_INET, SOCK_STREAM, IPPROTO_TCP, NULL, 0, WSA_FLAG_OVERLAPPED);
    if (m_ListenSocket == INVALID_SOCKET)
    {
        if (m_pEventCallback)
            m_pEventCallback(0, _T("ERROR"), _T("创建监听Socket失败"));
        return false;
    }
    
    sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    addr.sin_port = htons(m_nPort);
    
    if (bind(m_ListenSocket, (sockaddr*)&amp;addr, sizeof(addr)) == SOCKET_ERROR)
    {
        closesocket(m_ListenSocket);
        m_ListenSocket = INVALID_SOCKET;
        if (m_pEventCallback)
            m_pEventCallback(0, _T("ERROR"), _T("绑定Socket失败"));
        return false;
    }
    
    if (m_pEventCallback)
        m_pEventCallback(0, _T("CREATE"), _T("监听Socket创建成功，端口: ") + CString(std::to_string(m_nPort).c_str()));
    
    return true;
}

bool CIOCPServer::Start()
{
    if (m_bRunning)
        return true;
    
    m_bRunning = true;
    
    if (m_pEventCallback)
        m_pEventCallback(0, _T("START"), _T("启动工作线程池，线程数: ") + CString(std::to_string(m_nThreadCount).c_str()));
    
    for (int i = 0; i &lt; m_nThreadCount; i++)
    {
        CWinThread* pThread = AfxBeginThread(WorkerThread, this, THREAD_PRIORITY_NORMAL, 0, CREATE_SUSPENDED);
        if (pThread)
        {
            pThread-&gt;ResumeThread();
            m_WorkerThreads.push_back(pThread);
        }
    }
    
    m_pAcceptThread = AfxBeginThread(AcceptThread, this, THREAD_PRIORITY_NORMAL, 0, CREATE_SUSPENDED);
    if (m_pAcceptThread)
        m_pAcceptThread-&gt;ResumeThread();
    
    if (listen(m_ListenSocket, 5) == SOCKET_ERROR)
    {
        Stop();
        return false;
    }
    
    if (m_pEventCallback)
        m_pEventCallback(0, _T("START"), _T("服务器启动成功，开始监听连接"));
    
    return true;
}

void CIOCPServer::Stop()
{
    if (!m_bRunning)
        return;
    
    m_bRunning = false;
    
    if (m_pEventCallback)
        m_pEventCallback(0, _T("STOP"), _T("正在关闭服务器..."));
    
    for (size_t i = 0; i &lt; m_WorkerThreads.size(); i++)
        PostQueuedCompletionStatus(m_hCompletionPort, 0, (ULONG_PTR)NULL, NULL);
    
    Sleep(100);
    
    if (m_ListenSocket != INVALID_SOCKET)
    {
        closesocket(m_ListenSocket);
        m_ListenSocket = INVALID_SOCKET;
    }
    
    Cleanup();
    
    if (m_pEventCallback)
        m_pEventCallback(0, _T("STOP"), _T("服务器已关闭"));
}

void CIOCPServer::Shutdown()
{
    Stop();
    Cleanup();
    
    if (m_hCompletionPort)
    {
        CloseHandle(m_hCompletionPort);
        m_hCompletionPort = NULL;
    }
}

void CIOCPServer::Cleanup()
{
    CSingleLock lock(&amp;m_ClientLock, TRUE);
    for (auto client : m_Clients)
    {
        if (client-&gt;Socket != INVALID_SOCKET)
            closesocket(client-&gt;Socket);
        delete client;
    }
    m_Clients.clear();
    lock.Unlock();
    
    CSingleLock ioLock(&amp;m_IOLock, TRUE);
    while (!m_PendingIOs.empty())
    {
        PER_IO_CONTEXT* pIo = m_PendingIOs.front();
        m_PendingIOs.pop();
        delete pIo;
    }
    ioLock.Unlock();
    
    m_WorkerThreads.clear();
    m_pAcceptThread = NULL;
}

UINT WINAPI CIOCPServer::WorkerThread(LPVOID pParam)
{
    CIOCPServer* pServer = (CIOCPServer*)pParam;
    if (pServer)
        pServer-&gt;WorkerLoop();
    return 0;
}

void CIOCPServer::WorkerLoop()
{
    DWORD bytesTransferred;
    ULONG_PTR completionKey;
    LPOVERLAPPED pOverlapped;
    
    while (m_bRunning)
    {
        BOOL result = GetQueuedCompletionStatus(
            m_hCompletionPort,
            &amp;bytesTransferred,
            &amp;completionKey,
            &amp;pOverlapped,
            INFINITE);
        
        if (!result || !pOverlapped)
        {
            if (!m_bRunning)
                break;
            continue;
        }
        
        if (bytesTransferred == 0 &amp;&amp; completionKey == 0)
            break;
        
        PER_HANDLE_CONTEXT* pHandleContext = (PER_HANDLE_CONTEXT*)completionKey;
        PER_IO_CONTEXT* pIoContext = (PER_IO_CONTEXT*)pOverlapped;
        
        if (pHandleContext &amp;&amp; pIoContext)
            HandleIOCompletion(pHandleContext, pIoContext, bytesTransferred);
    }
}

void CIOCPServer::HandleIOCompletion(PER_HANDLE_CONTEXT* pHandleContext, PER_IO_CONTEXT* pIoContext, DWORD bytesTransferred)
{
    CString details;
    
    switch (pIoContext-&gt;OperationType)
    {
    case IO_OP_ACCEPT:
        details.Format(_T("接受客户端连接，ID: %d，传输字节: %d"), pIoContext-&gt;ClientId, bytesTransferred);
        if (m_pEventCallback)
            m_pEventCallback(pIoContext-&gt;ClientId, _T("ACCEPT"), details);
        
        PostAccept(pHandleContext);
        break;
        
    case IO_OP_READ:
        details.Format(_T("读取数据完成，客户端ID: %d，读取字节: %d"), pIoContext-&gt;ClientId, bytesTransferred);
        if (m_pEventCallback)
            m_pEventCallback(pIoContext-&gt;ClientId, _T("READ"), details);
        
        pIoContext-&gt;OperationType = IO_OP_WRITE;
        if (m_pEventCallback)
            m_pEventCallback(pIoContext-&gt;ClientId, _T("POST"), _T("投递Write请求"));
        break;
        
    case IO_OP_WRITE:
        details.Format(_T("写入数据完成，客户端ID: %d，写入字节: %d"), pIoContext-&gt;ClientId, bytesTransferred);
        if (m_pEventCallback)
            m_pEventCallback(pIoContext-&gt;ClientId, _T("WRITE"), details);
        break;
    }
    
    {
        CSingleLock lock(&amp;m_IOLock, TRUE);
        m_PendingIOs.push(pIoContext);
    }
}

UINT WINAPI CIOCPServer::AcceptThread(LPVOID pParam)
{
    CIOCPServer* pServer = (CIOCPServer*)pParam;
    if (pServer)
        pServer-&gt;AcceptLoop();
    return 0;
}

void CIOCPServer::AcceptLoop()
{
    while (m_bRunning)
    {
        sockaddr_in clientAddr;
        int addrLen = sizeof(clientAddr);
        
        SOCKET clientSocket = accept(m_ListenSocket, (sockaddr*)&amp;clientAddr, &amp;addrLen);
        
        if (clientSocket == INVALID_SOCKET)
        {
            if (!m_bRunning)
                break;
            Sleep(100);
            continue;
        }
        
        PER_HANDLE_CONTEXT* pHandleContext = new PER_HANDLE_CONTEXT();
        pHandleContext-&gt;Socket = clientSocket;
        pHandleContext-&gt;ClientId = m_nNextClientId++;
        
        {
            CSingleLock lock(&amp;m_ClientLock, TRUE);
            m_Clients.push_back(pHandleContext);
        }
        
        CreateIoCompletionPort((HANDLE)clientSocket, m_hCompletionPort, (ULONG_PTR)pHandleContext, 0);
        
        PER_IO_CONTEXT* pIoContext = new PER_IO_CONTEXT();
        ZeroMemory(&amp;pIoContext-&gt;Overlapped, sizeof(OVERLAPPED));
        pIoContext-&gt;OperationType = IO_OP_READ;
        pIoContext-&gt;ClientId = pHandleContext-&gt;ClientId;
        pIoContext-&gt;wsaBuf.buf = pIoContext-&gt;Buffer;
        pIoContext-&gt;wsaBuf.len = sizeof(pIoContext-&gt;Buffer);
        
        if (m_pEventCallback)
            m_pEventCallback(pHandleContext-&gt;ClientId, _T("CONNECT"), _T("新客户端连接，ID: ") + CString(std::to_string(pHandleContext-&gt;ClientId).c_str()));
        
        if (m_pEventCallback)
            m_pEventCallback(pHandleContext-&gt;ClientId, _T("POST"), _T("投递Read请求"));
        
        DWORD flags = 0;
        WSARecv(clientSocket, &amp;pIoContext-&gt;wsaBuf, 1, NULL, &amp;flags, &amp;pIoContext-&gt;Overlapped, NULL);
    }
}

bool CIOCPServer::PostAccept(PER_HANDLE_CONTEXT* pClient)
{
    PER_IO_CONTEXT* pIoContext = new PER_IO_CONTEXT();
    ZeroMemory(&amp;pIoContext-&gt;Overlapped, sizeof(OVERLAPPED));
    pIoContext-&gt;OperationType = IO_OP_READ;
    pIoContext-&gt;ClientId = pClient-&gt;ClientId;
    pIoContext-&gt;wsaBuf.buf = pIoContext-&gt;Buffer;
    pIoContext-&gt;wsaBuf.len = sizeof(pIoContext-&gt;Buffer);
    
    DWORD flags = 0;
    WSARecv(pClient-&gt;Socket, &amp;pIoContext-&gt;wsaBuf, 1, NULL, &amp;flags, &amp;pIoContext-&gt;Overlapped, NULL);
    
    return true;
}
