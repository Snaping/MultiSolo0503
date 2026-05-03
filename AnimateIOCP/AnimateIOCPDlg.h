#pragma once

#include "pch.h"
#include "IOCPServer.h"

enum AnimationState
{
    ANIM_IDLE,
    ANIM_RUNNING,
    ANIM_PAUSED
};

struct ClientNode
{
    int id;
    CPoint pos;
    CString state;
    COLORREF color;
    bool active;
};

struct WorkItem
{
    int clientId;
    CString type;
    CPoint pos;
    bool moving;
    int targetX;
    int progress;
};

class CAnimateIOCPDlg : public CDialog
{
public:
    CAnimateIOCPDlg(CWnd* pParent = nullptr);

    enum { IDD = IDD_ANIMATEIOCP_DIALOG };

protected:
    virtual void DoDataExchange(CDataExchange* pDX);
    virtual BOOL OnInitDialog();
    afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
    afx_msg void OnPaint();
    afx_msg HCURSOR OnQueryDragIcon();
    DECLARE_MESSAGE_MAP()

public:
    afx_msg void OnBnClickedButtonStart();
    afx_msg void OnBnClickedButtonStop();
    afx_msg void OnBnClickedButtonReset();
    afx_msg void OnHScroll(UINT nSBCode, UINT nPos, CScrollBar* pScrollBar);
    afx_msg void OnTimer(UINT_PTR nIDEvent);

private:
    static void IOEventCallback(int clientId, LPCTSTR eventType, LPCTSTR details);
    void OnIOEvent(int clientId, LPCTSTR eventType, LPCTSTR details);

    void InitializeAnimation();
    void DrawAnimation(CDC* pDC);
    void UpdateAnimation();
    void AddLog(LPCTSTR log);

    void SimulateNewClient();
    void SimulateIOEvent();

    CIOCPServer m_IOCPServer;

    CButton m_btnStart;
    CButton m_btnStop;
    CButton m_btnReset;
    CEdit m_editLog;
    CSliderCtrl m_sliderSpeed;
    CWnd m_staticAnimation;

    HICON m_hIcon;

    AnimationState m_AnimState;
    int m_nAnimationSpeed;
    UINT_PTR m_nTimer;

    std::vector<ClientNode> m_Clients;
    std::vector<WorkItem> m_WorkItems;
    std::vector<CPoint> m_WorkerPositions;

    CCriticalSection m_LogLock;

    int m_nSimulatedClientId;
    int m_nNextClientPos;
};
