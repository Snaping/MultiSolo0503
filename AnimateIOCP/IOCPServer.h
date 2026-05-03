#pragma once

class CIOCPServer
{
public:
    CIOCPServer();
    virtual ~CIOCPServer();

    bool Initialize(int port, int threadCount, void (*callback)(int, LPCTSTR, LPCTSTR));
    void Shutdown();
    bool Start();
    void Stop();
    bool IsRunning() const { return m_bRunning; }

    int GetActiveClientCount() const { return m_nActiveClients; }
    int GetPendingIOCount() const { return m_nPendingIOs; }

private:
    HANDLE m_hCompletionPort;
    int m_nPort;
    int m_nThreadCount;
    bool m_bRunning;
    int m_nActiveClients;
    int m_nPendingIOs;
    void (*m_pEventCallback)(int, LPCTSTR, LPCTSTR);
};
