#include "pch.h"
#include "IOCPServer.h"

CIOCPServer::CIOCPServer()
    : m_hCompletionPort(NULL)
    , m_nPort(8888)
    , m_nThreadCount(4)
    , m_bRunning(false)
    , m_nActiveClients(0)
    , m_nPendingIOs(0)
    , m_pEventCallback(NULL)
{
}

CIOCPServer::~CIOCPServer()
{
    Shutdown();
}

bool CIOCPServer::Initialize(int port, int threadCount, void (*callback)(int, LPCTSTR, LPCTSTR))
{
    m_nPort = port;
    m_nThreadCount = threadCount;
    m_pEventCallback = callback;

    m_hCompletionPort = CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, m_nThreadCount);
    if (m_hCompletionPort == NULL)
    {
        return false;
    }

    return true;
}

bool CIOCPServer::Start()
{
    if (m_bRunning)
        return true;

    m_bRunning = true;
    return true;
}

void CIOCPServer::Stop()
{
    if (!m_bRunning)
        return;

    m_bRunning = false;
}

void CIOCPServer::Shutdown()
{
    Stop();

    if (m_hCompletionPort)
    {
        CloseHandle(m_hCompletionPort);
        m_hCompletionPort = NULL;
    }
}
