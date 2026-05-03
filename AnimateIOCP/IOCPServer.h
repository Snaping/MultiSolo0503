
#pragma once

#include &lt;vector&gt;
#include &lt;queue&gt;
#include &lt;memory&gt;

enum IOOperationType
{
    IO_OP_ACCEPT,
    IO_OP_READ,
    IO_OP_WRITE,
    IO_OP_UNKNOWN
};

struct PER_IO_CONTEXT
{
    OVERLAPPED Overlapped;
    WSABUF wsaBuf;
    char Buffer[1024];
    IOOperationType OperationType;
    int ClientId;
};

struct PER_HANDLE_CONTEXT
{
    SOCKET Socket;
    int ClientId;
};

typedef void(*OnIOEventCallback)(int clientId, const CString&amp; eventType, const CString&amp; details);

class CIOCPServer
{
public:
    CIOCPServer();
    virtual ~CIOCPServer();

    bool Initialize(int port, int threadCount, OnIOEventCallback callback);
    void Shutdown();
    bool Start();
    void Stop();
    bool IsRunning() const { return m_bRunning; }
    
    int GetActiveClientCount() const { return (int)m_Clients.size(); }
    int GetPendingIOCount() const { return (int)m_PendingIOs.size(); }

private:
    static UINT WINAPI WorkerThread(LPVOID pParam);
    static UINT WINAPI AcceptThread(LPVOID pParam);
    
    void WorkerLoop();
    void AcceptLoop();
    bool CreateIOCompletionPort();
    bool CreateListenSocket();
    bool PostAccept(PER_HANDLE_CONTEXT* pClient);
    void HandleIOCompletion(PER_HANDLE_CONTEXT* pHandleContext, PER_IO_CONTEXT* pIoContext, DWORD bytesTransferred);
    void Cleanup();

    HANDLE m_hCompletionPort;
    SOCKET m_ListenSocket;
    int m_nPort;
    int m_nThreadCount;
    bool m_bRunning;
    
    std::vector&lt;CWinThread*&gt; m_WorkerThreads;
    CWinThread* m_pAcceptThread;
    
    std::vector&lt;PER_HANDLE_CONTEXT*&gt; m_Clients;
    std::queue&lt;PER_IO_CONTEXT*&gt; m_PendingIOs;
    
    CCriticalSection m_ClientLock;
    CCriticalSection m_IOLock;
    
    OnIOEventCallback m_pEventCallback;
    int m_nNextClientId;
};
