
#include "pch.h"
#include "AnimateIOCP.h"
#include "AnimateIOCPDlg.h"
#include "afxdialogex.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

static CAnimateIOCPDlg* g_pMainDlg = nullptr;

CAnimateIOCPDlg::CAnimateIOCPDlg(CWnd* pParent /*=nullptr*/)
    : CDialogEx(IDD_ANIMATEIOCP_DIALOG, pParent)
    , m_hIcon(NULL)
    , m_AnimState(ANIM_IDLE)
    , m_nAnimationSpeed(50)
    , m_nTimer(0)
    , m_nSimulatedClientId(0)
    , m_nNextClientPos(0)
{
    g_pMainDlg = this;
}

void CAnimateIOCPDlg::DoDataExchange(CDataExchange* pDX)
{
    CDialogEx::DoDataExchange(pDX);
    DDX_Control(pDX, IDC_BUTTON_START, m_btnStart);
    DDX_Control(pDX, IDC_BUTTON_STOP, m_btnStop);
    DDX_Control(pDX, IDC_BUTTON_RESET, m_btnReset);
    DDX_Control(pDX, IDC_EDIT_LOG, m_editLog);
    DDX_Control(pDX, IDC_SLIDER_SPEED, m_sliderSpeed);
    DDX_Control(pDX, IDC_STATIC_ANIMATION, m_staticAnimation);
}

BEGIN_MESSAGE_MAP(CAnimateIOCPDlg, CDialogEx)
    ON_WM_SYSCOMMAND()
    ON_WM_PAINT()
    ON_WM_QUERYDRAGICON()
    ON_BN_CLICKED(IDC_BUTTON_START, &amp;CAnimateIOCPDlg::OnBnClickedButtonStart)
    ON_BN_CLICKED(IDC_BUTTON_STOP, &amp;CAnimateIOCPDlg::OnBnClickedButtonStop)
    ON_BN_CLICKED(IDC_BUTTON_RESET, &amp;CAnimateIOCPDlg::OnBnClickedButtonReset)
    ON_WM_HSCROLL()
    ON_WM_TIMER()
END_MESSAGE_MAP()

BOOL CAnimateIOCPDlg::OnInitDialog()
{
    CDialogEx::OnInitDialog();

    ASSERT((IDM_ABOUTBOX &amp; 0xFFF0) == IDM_ABOUTBOX);
    ASSERT(IDM_ABOUTBOX &lt; 0xF000);

    CMenu* pSysMenu = GetSystemMenu(FALSE);
    if (pSysMenu != nullptr)
    {
        pSysMenu-&gt;AppendMenu(MF_SEPARATOR);
    }

    m_hIcon = AfxGetApp()-&gt;LoadIcon(IDR_MAINFRAME);
    SetIcon(m_hIcon, TRUE);
    SetIcon(m_hIcon, FALSE);

    InitializeAnimation();
    
    m_sliderSpeed.SetRange(10, 100);
    m_sliderSpeed.SetPos(m_nAnimationSpeed);
    
    m_btnStop.EnableWindow(FALSE);
    m_btnReset.EnableWindow(FALSE);
    
    AddLog(_T("IOCP工作原理演示程序已启动"));
    AddLog(_T("点击'启动演示'开始动画展示"));

    return TRUE;
}

void CAnimateIOCPDlg::OnSysCommand(UINT nID, LPARAM lParam)
{
    CDialogEx::OnSysCommand(nID, lParam);
}

void CAnimateIOCPDlg::OnPaint()
{
    if (IsIconic())
    {
        CPaintDC dc(this);

        SendMessage(WM_ICONERASEBKGND, reinterpret_cast&lt;WPARAM&gt;(dc.GetSafeHdc()), 0);

        int cxIcon = GetSystemMetrics(SM_CXICON);
        int cyIcon = GetSystemMetrics(SM_CYICON);
        CRect rect;
        GetClientRect(&amp;rect);
        int x = (rect.Width() - cxIcon + 1) / 2;
        int y = (rect.Height() - cyIcon + 1) / 2;

        dc.DrawIcon(x, y, m_hIcon);
    }
    else
    {
        CDialogEx::OnPaint();
        
        CRect rect;
        m_staticAnimation.GetClientRect(&amp;rect);
        m_staticAnimation.ClientToScreen(&amp;rect);
        ScreenToClient(&amp;rect);
        
        CClientDC dc(this);
        DrawAnimation(&amp;dc);
    }
}

HCURSOR CAnimateIOCPDlg::OnQueryDragIcon()
{
    return static_cast&lt;HCURSOR&gt;(m_hIcon);
}

void CAnimateIOCPDlg::InitializeAnimation()
{
    m_Clients.clear();
    m_WorkItems.clear();
    m_WorkerPositions.clear();
    
    m_WorkerPositions.push_back(CPoint(50, 80));
    m_WorkerPositions.push_back(CPoint(130, 80));
    m_WorkerPositions.push_back(CPoint(210, 80));
    m_WorkerPositions.push_back(CPoint(290, 80));
}

void CAnimateIOCPDlg::DrawAnimation(CDC* pDC)
{
    CRect rect;
    m_staticAnimation.GetWindowRect(&amp;rect);
    ScreenToClient(&amp;rect);
    
    CRect iocpRect(rect.CenterPoint().x - 40, 15, rect.CenterPoint().x + 40, 55);
    
    pDC-&gt;FillSolidRect(&amp;rect, RGB(240, 248, 255));
    
    pDC-&gt;SelectStockObject(NULL_BRUSH);
    pDC-&gt;Rectangle(&amp;rect);
    
    CFont font;
    font.CreatePointFont(90, _T("Microsoft YaHei UI"));
    CFont* pOldFont = pDC-&gt;SelectObject(&amp;font);
    
    CBrush iocpBrush(RGB(70, 130, 180));
    CBrush* pOldBrush = pDC-&gt;SelectObject(&amp;iocpBrush);
    pDC-&gt;RoundRect(&amp;iocpRect, CPoint(10, 10));
    pDC-&gt;SelectObject(pOldBrush);
    
    pDC-&gt;SetTextColor(RGB(255, 255, 255));
    pDC-&gt;SetBkMode(TRANSPARENT);
    pDC-&gt;DrawText(_T("IOCP"), &amp;iocpRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
    
    for (size_t i = 0; i &lt; m_WorkerPositions.size(); i++)
    {
        CRect workerRect(m_WorkerPositions[i].x - 30, m_WorkerPositions[i].y - 20,
                         m_WorkerPositions[i].x + 30, m_WorkerPositions[i].y + 20);
        
        CBrush workerBrush(RGB(144, 238, 144));
        pOldBrush = pDC-&gt;SelectObject(&amp;workerBrush);
        pDC-&gt;RoundRect(&amp;workerRect, CPoint(8, 8));
        pDC-&gt;SelectObject(pOldBrush);
        
        pDC-&gt;SetTextColor(RGB(0, 100, 0));
        CString workerText;
        workerText.Format(_T("Worker %zu"), i + 1);
        pDC-&gt;DrawText(workerText, &amp;workerRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
        
        CPoint lineStart(m_WorkerPositions[i].x, m_WorkerPositions[i].y - 20);
        CPoint lineEnd(rect.CenterPoint().x, 55);
        pDC-&gt;MoveTo(lineStart);
        pDC-&gt;LineTo(lineEnd);
    }
    
    for (const auto&amp; client : m_Clients)
    {
        if (!client.active)
            continue;
            
        CRect clientRect(client.pos.x - 25, client.pos.y - 20,
                        client.pos.x + 25, client.pos.y + 20);
        
        CBrush clientBrush(client.color);
        pOldBrush = pDC-&gt;SelectObject(&amp;clientBrush);
        pDC-&gt;RoundRect(&amp;clientRect, CPoint(8, 8));
        pDC-&gt;SelectObject(pOldBrush);
        
        pDC-&gt;SetTextColor(RGB(255, 255, 255));
        CString clientText;
        clientText.Format(_T("C%d"), client.id);
        pDC-&gt;DrawText(clientText, &amp;clientRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
        
        CPoint lineStart(client.pos.x, client.pos.y - 20);
        CPoint lineEnd(rect.CenterPoint().x, 15);
        CPen pen(PS_DOT, 1, RGB(128, 128, 128));
        CPen* pOldPen = pDC-&gt;SelectObject(&amp;pen);
        pDC-&gt;MoveTo(lineStart);
        pDC-&gt;LineTo(lineEnd);
        pDC-&gt;SelectObject(pOldPen);
    }
    
    for (const auto&amp; item : m_WorkItems)
    {
        CRect itemRect(item.pos.x - 15, item.pos.y - 10,
                      item.pos.x + 15, item.pos.y + 10);
        
        CBrush itemBrush(RGB(255, 165, 0));
        pOldBrush = pDC-&gt;SelectObject(&amp;itemBrush);
        pDC-&gt;Ellipse(&amp;itemRect);
        pDC-&gt;SelectObject(pOldBrush);
        
        pDC-&gt;SetTextColor(RGB(255, 255, 255));
        pDC-&gt;DrawText(item.type, &amp;itemRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
    }
    
    pDC-&gt;SelectObject(pOldFont);
}

void CAnimateIOCPDlg::UpdateAnimation()
{
    for (auto&amp; item : m_WorkItems)
    {
        if (item.moving)
        {
            int dx = item.targetX - item.pos.x;
            if (abs(dx) &gt; 5)
            {
                item.pos.x += (dx &gt; 0 ? 5 : -5);
                item.progress++;
            }
            else
            {
                item.moving = false;
            }
        }
    }
    
    m_WorkItems.erase(std::remove_if(m_WorkItems.begin(), m_WorkItems.end(),
        [](const WorkItem&amp; item) { return !item.moving &amp;&amp; item.progress &gt; 100; }),
        m_WorkItems.end());
    
    Invalidate(FALSE);
}

void CAnimateIOCPDlg::AddLog(const CString&amp; log)
{
    CSingleLock lock(&amp;m_LogLock, TRUE);
    
    CTime time = CTime::GetCurrentTime();
    CString timeStr = time.Format(_T("[%H:%M:%S] "));
    
    int len = m_editLog.GetWindowTextLength();
    m_editLog.SetSel(len, len);
    m_editLog.ReplaceSel(timeStr + log + _T("\r\n"));
    
    len = m_editLog.GetWindowTextLength();
    m_editLog.LineScroll(m_editLog.GetLineCount());
}

void CAnimateIOCPDlg::IOEventCallback(int clientId, const CString&amp; eventType, const CString&amp; details)
{
    if (g_pMainDlg)
        g_pMainDlg-&gt;OnIOEvent(clientId, eventType, details);
}

void CAnimateIOCPDlg::OnIOEvent(int clientId, const CString&amp; eventType, const CString&amp; details)
{
    AddLog(details);
    
    if (eventType == _T("CONNECT"))
    {
        ClientNode client;
        client.id = clientId;
        client.state = _T("Connected");
        client.color = RGB(100, 149, 237);
        client.active = true;
        
        int yPos = 130 + (m_nNextClientPos % 3) * 40;
        int xPos = 40 + (m_nNextClientPos / 3) * 80;
        if (xPos &gt; 320) xPos = 40;
        
        client.pos = CPoint(xPos, yPos);
        m_Clients.push_back(client);
        m_nNextClientPos++;
    }
}

void CAnimateIOCPDlg::SimulateNewClient()
{
    m_nSimulatedClientId++;
    
    ClientNode client;
    client.id = m_nSimulatedClientId;
    client.state = _T("Connected");
    client.color = RGB(100, 149, 237);
    client.active = true;
    
    int yPos = 130 + (m_nNextClientPos % 3) * 40;
    int xPos = 40 + (m_nNextClientPos / 3) * 80;
    if (xPos &gt; 320) xPos = 40;
    
    client.pos = CPoint(xPos, yPos);
    m_Clients.push_back(client);
    m_nNextClientPos++;
    
    CString details;
    details.Format(_T("模拟新客户端连接，ID: %d"), m_nSimulatedClientId);
    AddLog(details);
}

void CAnimateIOCPDlg::SimulateIOEvent()
{
    if (m_Clients.empty())
        return;
    
    int clientIdx = rand() % m_Clients.size();
    int workerIdx = rand() % m_WorkerPositions.size();
    
    CString types[] = { _T("R"), _T("W"), _T("A") };
    CString typeNames[] = { _T("Read"), _T("Write"), _T("Accept") };
    int typeIdx = rand() % 3;
    
    WorkItem item;
    item.clientId = m_Clients[clientIdx].id;
    item.type = types[typeIdx];
    item.pos = m_Clients[clientIdx].pos;
    item.moving = true;
    item.targetX = m_WorkerPositions[workerIdx].x;
    item.progress = 0;
    
    m_WorkItems.push_back(item);
    
    CString details;
    details.Format(_T("客户端C%d 向 Worker%d 投递 %s 请求"), 
                   item.clientId, workerIdx + 1, typeNames[typeIdx]);
    AddLog(details);
}

void CAnimateIOCPDlg::OnBnClickedButtonStart()
{
    if (m_AnimState == ANIM_RUNNING)
        return;
    
    m_AnimState = ANIM_RUNNING;
    
    m_IOCPServer.Initialize(8888, 4, IOEventCallback);
    m_IOCPServer.Start();
    
    m_nTimer = SetTimer(1, 100 - m_nAnimationSpeed + 10, NULL);
    
    m_btnStart.EnableWindow(FALSE);
    m_btnStop.EnableWindow(TRUE);
    m_btnReset.EnableWindow(TRUE);
    
    AddLog(_T("IOCP动画演示已启动"));
}

void CAnimateIOCPDlg::OnBnClickedButtonStop()
{
    if (m_AnimState != ANIM_RUNNING)
        return;
    
    m_AnimState = ANIM_PAUSED;
    
    if (m_nTimer)
    {
        KillTimer(m_nTimer);
        m_nTimer = 0;
    }
    
    m_IOCPServer.Stop();
    
    m_btnStart.EnableWindow(TRUE);
    m_btnStop.EnableWindow(FALSE);
    
    AddLog(_T("IOCP动画演示已暂停"));
}

void CAnimateIOCPDlg::OnBnClickedButtonReset()
{
    m_AnimState = ANIM_IDLE;
    
    if (m_nTimer)
    {
        KillTimer(m_nTimer);
        m_nTimer = 0;
    }
    
    m_IOCPServer.Shutdown();
    
    InitializeAnimation();
    
    m_nSimulatedClientId = 0;
    m_nNextClientPos = 0;
    
    m_editLog.SetWindowText(_T(""));
    
    m_btnStart.EnableWindow(TRUE);
    m_btnStop.EnableWindow(FALSE);
    m_btnReset.EnableWindow(FALSE);
    
    Invalidate(FALSE);
    
    AddLog(_T("IOCP动画演示已重置"));
}

void CAnimateIOCPDlg::OnHScroll(UINT nSBCode, UINT nPos, CScrollBar* pScrollBar)
{
    if (pScrollBar-&gt;GetSafeHwnd() == m_sliderSpeed.GetSafeHwnd())
    {
        m_nAnimationSpeed = m_sliderSpeed.GetPos();
        
        if (m_nTimer)
        {
            KillTimer(m_nTimer);
            m_nTimer = SetTimer(1, 100 - m_nAnimationSpeed + 10, NULL);
        }
    }
    
    CDialogEx::OnHScroll(nSBCode, nPos, pScrollBar);
}

void CAnimateIOCPDlg::OnTimer(UINT_PTR nIDEvent)
{
    if (nIDEvent == 1)
    {
        static int tick = 0;
        tick++;
        
        if (tick % 3 == 0)
            SimulateNewClient();
        
        SimulateIOEvent();
        UpdateAnimation();
    }
    
    CDialogEx::OnTimer(nIDEvent);
}
