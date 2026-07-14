import os
import time
import sys
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def ensure_playwright():
    """Ensure Playwright browsers are installed."""
    try:
        import subprocess
        with sync_playwright() as p:
            try:
                executable = p.chromium.executable_path
                if not os.path.exists(executable):
                    raise Exception("Executable missing")
            except Exception:
                subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
    except Exception:
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)

def _login(page, user_id_np, pass_np, selected_distributor, URL_LOGIN, TIMEOUT_MS, ui_log):
    ui_log("info", f"Connecting to {URL_LOGIN}...", {"step": "login"})
    
    page.goto(URL_LOGIN, wait_until="domcontentloaded")
    ui_log("info", "DOM ready. Injecting credentials...", {"step": "login"})
    
    page.locator("id=txtUserid").fill(user_id_np)
    page.locator("id=txtPasswd").fill(pass_np)
    page.locator("id=btnLogin").click(force=True)
    
    try:
        btn = page.locator("id=SYS_ASCX_btnContinue")
        btn.wait_for(state="visible", timeout=5_000)
        ui_log("info", "Active session interceptor detected. Bypassing...", {"step": "login"})
        btn.click(force=True)
    except Exception: 
        ui_log("info", "No interceptor detected. Clean session acquired.", {"step": "login"})
    
    page.wait_for_url("**/Default.aspx", timeout=TIMEOUT_MS, wait_until="domcontentloaded")
    ui_log("success", "Login successful. Session established.", {"step": "login_success"})

def _navigate_to_import_export(page, TIMEOUT_MS, ui_log):
    ui_log("info", "Navigating to System module...", {"step": "navigate"})
    page.wait_for_timeout(1000)
    
    try:
        sys_tab = page.locator("id=pag_Sys_Root_tab_Detail_tab_Header")
        if sys_tab.is_visible():
            sys_tab.click(force=True)
            page.wait_for_timeout(800)
    except:
        pass

    ui_log("info", "Searching for Import/Export Job module in DOM...", {"step": "navigate"})
    target_id = "pag_Sys_Root_tab_Detail_itm_Job"
    
    try:
        page.wait_for_selector(f"id={target_id}", state="attached", timeout=TIMEOUT_MS)
        ui_log("info", "Module found in DOM. Executing JS click bypass...", {"step": "navigate"})
        page.evaluate(f"document.getElementById('{target_id}').click()")
        page.wait_for_timeout(1500)
    except Exception as e:
        ui_log("warning", "ID-based JS click failed, trying brute-force...", {"step": "navigate"})
        try:
            parent = page.locator("[id*='itm_SysAdminSetup']").first
            if parent.is_visible():
                parent.click(force=True)
                page.wait_for_timeout(1000)
            page.get_by_text("Import/Export Job").first.click(force=True)
        except:
            ui_log("error", "Navigation failed. System menu might be blocked.", {"step": "navigate"})
            raise e

    page.wait_for_timeout(1000)
    
    ui_log("info", "Opening new job [Add Value]...", {"step": "navigate"})
    btn_add = page.locator("id=pag_FW_SYS_INTF_JOB_btn_Add_Value")
    btn_add.wait_for(state="visible", timeout=TIMEOUT_MS)
    btn_add.click(force=True)
    page.wait_for_timeout(500)

def _dispatch_extraction_job(page, TIMEOUT_MS, WAREHOUSE, ui_log):
    ui_log("info", "Setting job type: Export [E], desc: Text Inventory Master...", {"step": "extract"})
    page.locator("id=pag_FW_SYS_INTF_JOB_NewGeneral_JOB_TYPE_Value").select_option("E")
    page.wait_for_timeout(1000)
    page.locator("id=pag_FW_SYS_INTF_JOB_NewGeneral_JOB_DESC_Value").fill("Text Inventory Master")
    page.locator("id=pag_FW_SYS_INTF_JOB_NewGeneral_JOB_TIMEOUT_Value").fill("9999999")
    page.locator("id=pag_FW_SYS_INTF_JOB_NewGeneral_EXE_TYPE_Value").select_option("M")
    page.wait_for_timeout(1000)
    
    ui_log("info", "Proceeding to next step...", {"step": "extract"})
    page.locator("id=pag_FW_SYS_INTF_JOB_RootNew_btn_Next_Value").click(force=True)
    page.wait_for_timeout(1000)
    
    ui_log("info", "Bypassing disclaimer prompt...", {"step": "extract"})
    ok_btn = page.locator("id=pag_FW_DisclaimerMessage_btn_okay_Value")
    ok_btn.wait_for(state="visible", timeout=TIMEOUT_MS)
    ok_btn.click(force=True)
    page.wait_for_timeout(500)
    
    ui_log("info", "Opening interface selection popup...", {"step": "extract"})
    page.locator("id=pag_FW_SYS_INTF_JOB_DTL_PopupNew_INTF_ID_SelectButton").click(force=True)
    page.wait_for_timeout(1000)
    
    ui_log("info", "Searching target interface: E_20150315090000028...", {"step": "extract"})
    search_field = page.locator("id=pop_Dynamic_gft_List_2_FilterField_Value")
    search_field.wait_for(state="visible", timeout=max(TIMEOUT_MS, 180000))
    search_field.fill("E_20150315090000028")
    page.locator("id=pop_Dynamic_grd_Main_SearchForm_ButtonSearch_Value").click(force=True)
    page.wait_for_timeout(800)
    
    ui_log("info", "Selecting target interface from results...", {"step": "extract"})
    target_text = page.get_by_text("E_20150315090000028", exact=True)
    target_text.wait_for(state="visible", timeout=max(TIMEOUT_MS, 180000))
    target_text.click(force=True)
    page.wait_for_timeout(800)
    
    ui_log("info", "Setting file type: Delimited [D], separator: standard...", {"step": "extract"})
    page.locator("id=pag_FW_SYS_INTF_JOB_DTL_PopupNew_FILE_TYPE_Value").select_option("D")
    page.locator("id=pag_FW_SYS_INTF_JOB_DTL_PopupNew_FLD_SEPARATOR_STD_Value_0").check()
    page.wait_for_timeout(2000)
    
    ui_log("info", f"Applying warehouse filter: [{WAREHOUSE}]...", {"step": "extract"})
    page.locator("id=pag_FW_SYS_INTF_JOB_DTL_PopupNew_grd_DynamicFilter_ctl02_dyn_Field_txt_Value").fill(WAREHOUSE)
    page.wait_for_timeout(1500)
    
    ui_log("info", "Committing parameters to job definition...", {"step": "extract"})
    page.locator("id=pag_FW_SYS_INTF_JOB_DTL_PopupNew_btn_Add_Value").click(force=True)
    page.wait_for_timeout(2000)
    
    ui_log("info", "Saving job and dispatching execution to server...", {"step": "execute"})
    page.locator("id=pag_FW_SYS_INTF_JOB_RootNew_btn_Save_Value").click(force=True)
    
    ui_log("info", "Awaiting server confirmation prompt...", {"step": "execute"})
    page.locator("id=TF_Prompt_btn_Ok_Value").wait_for(state="visible", timeout=TIMEOUT_MS)
    page.locator("id=TF_Prompt_btn_Ok_Value").click(force=True)
    
    ui_log("info", "Intercepting download link — this may take up to 4 minutes...", {"step": "download"})
    with page.expect_download(timeout=240000) as download_info:
        download_btn = page.locator("id=pag_FW_SYS_INTF_STATUS_JOB_btn_Download_Value")
        download_btn.wait_for(state="visible", timeout=240000)
        download_btn.click(force=True)
    
    download = download_info.value
    real_filename = download.suggested_filename
    
    # Save into an output directory
    os.makedirs("output", exist_ok=True)
    file_path = os.path.join("output", f"ext_{real_filename}")
    
    ui_log("success", f"Download captured: {real_filename}.", {"step": "download"})
    download.save_as(file_path)
    
    return real_filename, file_path

def run_initial_stock(job_id: str, params: dict, write_log, update_job, is_cancel_requested) -> dict:
    """
    Executes the stock extraction Playwright automation.
    """
    # Create a wrapper for logging that maps to our dashboard's `write_log`
    def ui_log(level: str, message: str, metadata: dict = None):
        write_log(job_id, level, message, metadata)

    user_id_np = os.environ.get("PORTAL_USERNAME")
    pass_np = os.environ.get("PORTAL_PASSWORD")
    URL_LOGIN = os.environ.get("PORTAL_URL", "https://rb-id.np.accenture.com/RB_ID/Logon.aspx")
    selected_distributor = os.environ.get("PORTAL_DISTRIBUTOR", "DEFAULT")
    WAREHOUSE = params.get("warehouse", "GOOD_WHS")
    TIMEOUT_MS = 60000

    if not user_id_np or not pass_np:
        raise ValueError("PORTAL_USERNAME and PORTAL_PASSWORD must be set in .env")

    ensure_playwright()

    with sync_playwright() as p:
        ui_log("info", "Spawning browser context with isolated session...", {"step": "init"})
        update_job(job_id, progress=5)
        
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(no_viewport=True)
        page = context.new_page()
        
        try:
            if is_cancel_requested(job_id): raise Exception("Job cancelled by user")
            
            # 1. Login
            _login(page, user_id_np, pass_np, selected_distributor, URL_LOGIN, TIMEOUT_MS, ui_log)
            update_job(job_id, progress=25)
            
            if is_cancel_requested(job_id): raise Exception("Job cancelled by user")
            
            # 2. Navigate
            _navigate_to_import_export(page, TIMEOUT_MS, ui_log)
            update_job(job_id, progress=50)
            
            if is_cancel_requested(job_id): raise Exception("Job cancelled by user")
            
            # 3. Extract & Download
            real_filename, file_path = _dispatch_extraction_job(page, TIMEOUT_MS, WAREHOUSE, ui_log)
            update_job(job_id, progress=90)
            
            file_size = os.path.getsize(file_path)
            ui_log("success", f"Extraction finished. Saved to {file_path} ({file_size} bytes)", {"step": "done"})
            
            return {
                "summary": "Initial stock completed",
                "filename": real_filename,
                "file_size": file_size,
                "success_count": 1,
                "failed_count": 0,
                "total_records": 1,
            }
            
        finally:
            browser.close()
            ui_log("info", "Browser closed. Releasing session memory...", {"step": "cleanup"})
