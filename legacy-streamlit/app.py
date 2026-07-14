import streamlit as st
import database
from utils import inject_css, init_session_state, render_wakelock

# --- 1. CONFIG & UI HELPERS ---
st.set_page_config(page_title="Stock Adjustment Newspage", layout="wide")
inject_css()
supabase = database.init_supabase()
# Pre-warm the config cache so pages can access it without re-querying
_config = database.get_system_config(supabase)

# --- 2. STATE MANAGEMENT & STYLING ---
init_session_state(
    logged_in=True,
    current_user="admin",
    reconcile_result=None,
    reconcile_summary=None,
    np_df=None,
    is_bot_running=False,
    prev_file2=None,
    current_np_user_id="",
    execute_done=False,
)

render_wakelock()

# Define pages
dashboard_page = st.Page("pages/0_dashboard.py", title="Dashboard", url_path="dashboard", default=True)
inventory_page = st.Page("pages/1_inventory_adjustment.py", title="Inventory Adjustment", url_path="p1")
sales_page = st.Page("pages/2_sales_extraction.py", title="Sales Extraction", url_path="p2")
promotion_page = st.Page("pages/3_promotion_comparison.py", title="Promotion Comparison", url_path="p3")
mutation_page = st.Page("pages/4_stock_mutation.py", title="Stock Mutation", url_path="p4")
clearance_page = st.Page("pages/5_clearance_stock.py", title="Clearance Stock", url_path="p5")
initial_page = st.Page("pages/6_initial_stock.py", title="Initial Stock", url_path="p6")

# Run navigation
pg = st.navigation([dashboard_page, inventory_page, sales_page, promotion_page, mutation_page, clearance_page, initial_page], position="hidden")
pg.run()

