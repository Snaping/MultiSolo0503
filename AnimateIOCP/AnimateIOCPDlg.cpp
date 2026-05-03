#include "pch.h"
#include "AnimateIOCP.h"
#include "AnimateIOCPDlg.h"
#include <algorithm>

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

static CAnimateIOCPDlg* g_pMainDlg = nullptr;

CAnimateIOCPDlg::CAnimateIOCPDlg(CWnd* pParent)
    : CDialog(IDD, pParent)
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
    CDialog::DoDataExchange(pDX);
    DDX_Control(pDX, IDC_BUTTON_START, m_btnStart);
    DDX_Control(pDX, IDC_BUTTON_STOP, m_btnStop);
    DDX_Control(pDX, IDC_BUTTON_RESET, m_btnReset);
    DDX_Control(pDX, IDC_EDIT_LOG, m_editLog);
    DDX_Control(pDX, IDC_SLIDER_SPEED, m_sliderSpeed);
    DDX_Control(pDX, IDC_STATIC_ANIMATION, m_staticAnimation);
}

BEGIN_MESSAGE_MAP(CAnimateIOCPDlg, CDialog)
    ON_WM_SYSCOMMAND()
    ON_WM_PAINT()
    ON_WM_QUERYDRAGICON()
    ON_BN_CLICKED(IDC_BUTTON_START, &CAnimateIOCPDlg::OnBnClickedButtonStart)
    ON_BN_CLICKED(IDC_BUTTON_STOP, &CAnimateIOCPDlg::OnBnClickedButtonStop)
    ON_BN_CLICKED(IDC_BUTTON_RESET, &CAnimateIOCPDlg::OnBnClickedButtonReset)
    ON_WM_HSCROLL()
    ON_WM_TIMER()
END_MESSAGE_MAP()

BOOL CAnimateIOCPDlg::OnInitDialog()
{
    CDialog::OnInitDialog();

    CMenu* pSysMenu = GetSystemMenu(FALSE);
    if (pSysMenu != nullptr)
    {
        pSysMenu->AppendMenu(MF_SEPARATOR);
    }

    m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
    SetIcon(m_hIcon, TRUE);
    SetIcon(m_hIcon, FALSE);

    InitializeAnimation();

    m_sliderSpeed.SetRange(10, 100);
    m_sliderSpeed.SetPos(m_nAnimationSpeed);

    m_btnStop.EnableWindow(FALSE);
    m_btnReset.EnableWindow(FALSE);

    AddLog(_T("IOCP Animation Demo Started"));
    AddLog(_T("Click 'Start Demo' to begin"));

    return TRUE;
}

void CAnimateIOCPDlg::OnSysCommand(UINT nID, LPARAM lParam)
{
    CDialog::OnSysCommand(nID, lParam);
}

void CAnimateIOCPDlg::OnPaint()
{
    if (IsIconic())
    {
        CPaintDC dc(this);
        SendMessage(WM_ICONERASEBKGND, reinterpret_cast<WPARAM>(dc.GetSafeHdc()), 0);
        int cxIcon = GetSystemMetrics(SM_CXICON);
        int cyIcon = GetSystemMetrics(SM_CYICON);
        CRect rect;
        GetClientRect(&rect);
        int x = (rect.Width() - cxIcon + 1) / 2;
        int y = (rect.Height() - cyIcon + 1) / 2;
        dc.DrawIcon(x, y, m_hIcon);
    }
    else
    {
        CDialog::OnPaint();
        CRect rect;
        m_staticAnimation.GetClientRect(&rect);
        m_staticAnimation.ClientToScreen(&rect);
        ScreenToClient(&rect);
        CClientDC dc(this);
        DrawAnimation(&dc);
    }
}

HCURSOR CAnimateIOCPDlg::OnQueryDragIcon()
{
    return static_cast<HCURSOR>(m_hIcon);
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
    m_staticAnimation.GetWindowRect(&rect);
    ScreenToClient(&rect);

    CRect iocpRect(rect.CenterPoint().x - 40, 15, rect.CenterPoint().x + 40, 55);

    pDC->FillSolidRect(&rect, RGB(240, 248, 255));

    pDC->SelectStockObject(NULL_BRUSH);
    pDC->Rectangle(&rect);

    CFont font;
    font.CreatePointFont(90, _T("Microsoft YaHei UI"));
    CFont* pOldFont = pDC->SelectObject(&font);

    CBrush iocpBrush(RGB(70, 130, 180));
    CBrush* pOldBrush = pDC->SelectObject(&iocpBrush);
    pDC->RoundRect(&iocpRect, CPoint(10, 10));
    pDC->SelectObject(pOldBrush);

    pDC->SetTextColor(RGB(255, 255, 255));
    pDC->SetBkMode(TRANSPARENT);
    pDC->DrawText(_T("IOCP"), &iocpRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

    for (size_t i = 0; i < m_WorkerPositions.size(); i++)
    {
        CRect workerRect(m_WorkerPositions[i].x - 30, m_WorkerPositions[i].y - 20,
            m_WorkerPositions[i].x + 30, m_WorkerPositions[i].y + 20);

        CBrush workerBrush(RGB(144, 238, 144));
        pOldBrush = pDC->SelectObject(&workerBrush);
        pDC->RoundRect(&workerRect, CPoint(8, 8));
        pDC->SelectObject(pOldBrush);

        pDC->SetTextColor(RGB(0, 100, 0));
        CString workerText;
        workerText.Format(_T("Worker %zu"), i + 1);
        pDC->DrawText(workerText, &workerRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

        CPoint lineStart(m_WorkerPositions[i].x, m_WorkerPositions[i].y - 20);
        CPoint lineEnd(rect.CenterPoint().x, 55);
        pDC->MoveTo(lineStart);
        pDC->LineTo(lineEnd);
    }

    for (const auto& client : m_Clients)
    {
        if (!client.active)
            continue;

        CRect clientRect(client.pos.x - 25, client.pos.y - 20,
            client.pos.x + 25, client.pos.y + 20);

        CBrush clientBrush(client.color);
        pOldBrush = pDC->SelectObject(&clientBrush);
        pDC->RoundRect(&clientRect, CPoint(8, 8));
        pDC->SelectObject(pOldBrush);

        pDC->SetTextColor(RGB(255, 255, 255));
        CString clientText;
        clientText.Format(_T("C%d"), client.id);
        pDC->DrawText(clientText, &clientRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

        CPoint lineStart(client.pos.x, client.pos.y - 20);
        CPoint lineEnd(rect.CenterPoint().x, 15);
        CPen pen(PS_DOT, 1, RGB(128, 128, 128));
        CPen* pOldPen = pDC->SelectObject(&pen);
        pDC->MoveTo(lineStart);
        pDC->LineTo(lineEnd);
        pDC->SelectObject(pOldPen);
    }

    for (const auto& item : m_WorkItems)
    {
        CRect itemRect(item.pos.x - 15, item.pos.y - 10,
            item.pos.x + 15, item.pos.y + 10);

        CBrush itemBrush(RGB(255, 165, 0));
        pOldBrush = pDC->SelectObject(&itemBrush);
        pDC->Ellipse(&itemRect);
        pDC->SelectObject(pOldBrush);

        pDC->SetTextColor(RGB(255, 255, 255));
        pDC->DrawText(item.type, &itemRect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
    }

    pDC->SelectObject(pOldFont);
}

void CAnimateIOCPDlg::UpdateAnimation()
{
    for (auto& item : m_WorkItems)
    {
        if (item.moving)
        {
            int dx = item.targetX - item.pos.x;
            if (abs(dx) > 5)
            {
                item.pos.x += (dx > 0 ? 5 : -5);
                item.progress++;
            }
            else
            {
                item.moving = false;
            }
        }
    }

    m_WorkItems.erase(std::remove_if(m_WorkItems.begin(), m_WorkItems.end(),
        [](const WorkItem& item) { return !item.moving && item.progress > 100; }),
        m_WorkItems.end());

    Invalidate(TRUE);
}

void CAnimateIOCPDlg::AddLog(LPCTSTR log)
{
    CSingleLock lock(&m_LogLock, TRUE);

    CTime time = CTime::GetCurrentTime();
    CString timeStr = time.Format(_T("[%H:%M:%S] "));

    int len = m_editLog.GetWindowTextLength();
    m_editLog.SetSel(len, len);
    m_editLog.ReplaceSel(timeStr + log + _T("\r\n"));

    len = m_editLog.GetWindowTextLength();
    m_editLog.LineScroll(m_editLog.GetLineCount());
}

void CAnimateIOCPDlg::IOEventCallback(int clientId, LPCTSTR eventType, LPCTSTR details)
{
    if (g_pMainDlg)
        g_pMainDlg->OnIOEvent(clientId, eventType, details);
}

void CAnimateIOCPDlg::OnIOEvent(int clientId, LPCTSTR eventType, LPCTSTR details)
{
    AddLog(details);

    if (_tcscmp(eventType, _T("CONNECT")) == 0)
    {
        ClientNode client;
        client.id = clientId;
        client.state = _T("Connected");
        client.color = RGB(100, 149, 237);
        client.active = true;

        int yPos = 130 + (m_nNextClientPos % 3) * 40;
        int xPos = 40 + (m_nNextClientPos / 3) * 80;
        if (xPos > 320) xPos = 40;

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
    if (xPos > 320) xPos = 40;

    client.pos = CPoint(xPos, yPos);
    m_Clients.push_back(client);
    m_nNextClientPos++;

    CString details;
    details.Format(_T("Simulated new client connection, ID: %d"), m_nSimulatedClientId);
    AddLog(details);
}

void CAnimateIOCPDlg::SimulateIOEvent()
{
    if (m_Clients.empty())
        return;

    int clientIdx = rand() % m_Clients.size();
    int workerIdx = rand() % m_WorkerPositions.size();

    LPCTSTR types[] = { _T("R"), _T("W"), _T("A") };
    LPCTSTR typeNames[] = { _T("Read"), _T("Write"), _T("Accept") };
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
    details.Format(_T("Client C%d -> Worker%d: %s request"),
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

    AddLog(_T("IOCP Animation Demo Started"));
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

    AddLog(_T("IOCP Animation Demo Paused"));
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

    Invalidate(TRUE);

    AddLog(_T("IOCP Animation Demo Reset"));
}

void CAnimateIOCPDlg::OnHScroll(UINT nSBCode, UINT nPos, CScrollBar* pScrollBar)
{
    if (pScrollBar->GetSafeHwnd() == m_sliderSpeed.GetSafeHwnd())
    {
        m_nAnimationSpeed = m_sliderSpeed.GetPos();

        if (m_nTimer)
        {
            KillTimer(m_nTimer);
            m_nTimer = SetTimer(1, 100 - m_nAnimationSpeed + 10, NULL);
        }
    }

    CDialog::OnHScroll(nSBCode, nPos, pScrollBar);
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

    CDialog::OnTimer(nIDEvent);
}
