import os
import time
import random
from supabase import create_client, Client
from dotenv import load_dotenv
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Load environment variables
load_dotenv('.env')

url: str = os.environ.get("SUPABASE_PROJECT_URL") or os.environ.get("SUPABASE_PROJECT_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_ANON_KEY")
service_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Supabase URL or Key not found.")
    exit(1)

# Initialize Supabase
supabase: Client = create_client(url, service_key if service_key else key)

def get_driver():
    options = uc.ChromeOptions()
    options.add_argument("--start-maximized")
    # options.add_argument("--headless=new") # Headless often triggers detection, use with caution
    
    # Custom User Agent
    options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Use undetected-chromedriver
    # version_main allows specifying Chrome version if auto-detection fails
    driver = uc.Chrome(options=options, use_subprocess=True) 
    return driver

def scrape_scores(driver, player_name):
    # 1. Google Search
    print(f"Searching for: {player_name} espncricinfo")
    driver.get("https://google.com")
    
    try:
        # Wait for search box using standard Selenium waits
        # uc uses standard selenium syntax once initialized
        search_box = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.NAME, "q"))
        )
        # Type slowly?
        for char in f"{player_name} espncricinfo":
            search_box.send_keys(char)
            time.sleep(random.uniform(0.05, 0.15))
            
        time.sleep(0.5)
        search_box.send_keys(Keys.RETURN)
        
        # 2. Click First Result
        # Wait for results
        first_result = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "h3"))
        )
        
        # Check link
        parent_link = first_result.find_element(By.XPATH, "./..")
        profile_url = parent_link.get_attribute("href")
        
        if "espncricinfo.com/player/" not in profile_url and "espncricinfo.com/cricketers/" not in profile_url:
             print(f"Skipping: First result not ESPNcricinfo ({profile_url})")
             return None

        print(f"Found profile: {profile_url}")
        
        # 3. Go to /matches
        matches_url = profile_url.rstrip('/') + "/matches"
        driver.get(matches_url)
        
        # Random sleep to mimic user reading
        time.sleep(random.uniform(2, 4))
        
        # 4. Scrape Batting Scores
        # Wait for "Recent Matches - Player"
        # Sometimes header structure changes, try catch
        try:
             WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Recent Matches - Player')]"))
            )
        except:
            print("Could not find Recent Matches table header. Checking page source...")
            # Detect Access Denied text
            if "Access Denied" in driver.page_source:
                print("ACCESS DENIED detected.")
                return None
            else:
                 pass # Fallback to looking for table
        
        # Locate table
        # Attempt to find the table that has 'Bat' column header
        tables = driver.find_elements(By.TAG_NAME, "table")
        target_table = None
        bat_index = -1
        
        for tbl in tables:
            headers = tbl.find_elements(By.TAG_NAME, "th")
            texts = [h.text.strip() for h in headers]
            if "Bat" in texts and "Match" in texts:
                target_table = tbl
                bat_index = texts.index("Bat")
                break
        
        if not target_table:
            print("Could not locate Recent Matches table with 'Bat' column.")
            return None, None
            
        rows = target_table.find_elements(By.CSS_SELECTOR, "tbody tr")
        
        # Determine Bowl index
        bowl_index = -1
        if "Bowl" in texts:
             bowl_index = texts.index("Bowl")
        
        bat_scores = []
        bowl_scores = []
        
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            
            # Batting
            if len(cols) > bat_index:
                val = cols[bat_index].text.strip()
                if val and val != '--':
                    if '&' in val:
                        parts = val.split('&')
                        for p in parts:
                            p_clean = p.strip()
                            if p_clean and p_clean != '--':
                                bat_scores.append(p_clean)
                    else:
                        bat_scores.append(val)
            
            # Bowling
            if bowl_index != -1 and len(cols) > bowl_index:
                val = cols[bowl_index].text.strip()
                if val and val != '--':
                    if '&' in val:
                        parts = val.split('&')
                        for p in parts:
                            p_clean = p.strip()
                            if p_clean and p_clean != '--':
                                bowl_scores.append(p_clean)
                    else:
                        bowl_scores.append(val)
            
            # Limit to 10? Logic implies 10 matches, but splitting test matches increases count.
            # Let's limit based on matches scraped (rows) or scores count?
            # User said "come back to supabase to store them in an array called batting_form"
            # It's safer to just take everything from the recent table (which is usually small) or top 10 rows.
            # But earlier code limited len(scores) >= 10.
            # If we want synchronous arrays (Bat/Bowl for same match), we should rely on row count.
            # However, test matches split scores (e.g. 2 inns bat, maybe 2 inns bowl).
            # It's hard to keep them aligned if we flatten.
            # User request "consider those as 0,37, with the rest of the array".
            # Implies flattening is fine.
            
            if len(bat_scores) >= 10: 
                 bat_scores = bat_scores[:10]
            if len(bowl_scores) >= 10:
                 bowl_scores = bowl_scores[:10]
            
            if len(bat_scores) >= 10 and len(bowl_scores) >= 10:
                break
                
        print(f"Bat Scores: {bat_scores}")
        print(f"Bowl Scores: {bowl_scores}")
        return bat_scores, bowl_scores

    except Exception as e:
        print(f"Error scraping {player_name}: {e}")
        return None, None

def main():
    # Fetch players
    print("Fetching players from Supabase...")
    try:
        response = supabase.table('players').select('list_sr_no, first_name, surname').order('list_sr_no', desc=False).execute()
        players = response.data
    except Exception as e:
        print(f"Supabase error: {e}")
        return # Exit if DB fails
    
    if not players:
        print("No players found in Supabase.")
        return

    print(f"Found {len(players)} players.")
    
    driver = get_driver()
    
    try:
        for p in players:
            pid = p['list_sr_no']
            name = f"{p['first_name']} {p['surname']}".strip()
            
            print(f"Processing {name}...")
            bat_scores, bowl_scores = scrape_scores(driver, name)
            
            updates = {}
            if bat_scores:
                updates['batting_form'] = bat_scores
            if bowl_scores:
                updates['bowling_form'] = bowl_scores
                
            if updates:
                # Update Supabase
                try:
                    data, count = supabase.table('players').update(updates).eq('list_sr_no', pid).execute()
                    print(f"Updated {name} in DB.")
                except Exception as e:
                    print(f"Error updating DB: {e}")
            
            # Sleep between players
            time.sleep(random.uniform(3, 7))
            
    finally:
        print("Closing driver...")
        driver.quit()

if __name__ == "__main__":
    main()
