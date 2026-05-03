
#pragma once

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

class CAnimateIOCPDlg : public CDialogEx
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
    static void IOEventCallback(int clientId, const CString&amp; eventType, const CString&amp; details);
    void OnIOEvent(int clientId, const CString&amp; eventType, const CString&amp; details);
    
    void InitializeAnimation();
    void DrawAnimation(CDC* pDC);
    void UpdateAnimation();
    void AddLog(const CString&amp; log);
    
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
    
    std::vector&lt;ClientNode&gt; m_Clients;
    std::vector&lt;WorkItem&gt; m_WorkItems;
    std::vector&lt;CPoint&gt; m_WorkerPositions;
    
    CCriticalSection m_LogLock;
    
    int m_nSimulatedClientId;
    int m_nNextClientPos;
};
