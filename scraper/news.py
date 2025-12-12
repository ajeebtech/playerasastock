import os
import time
import random
from supabase import create_client, Client
from dotenv import load_dotenv
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Load environment variables
load_dotenv('.env')

url: str = os.environ.get("SUPABASE_PROJECT_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")
service_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Supabase URL or Key not found.")
    exit(1)

# Initialize Supabase
supabase: Client = create_client(url, service_key if service_key else key)

def get_driver():
    options = uc.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    driver = uc.Chrome(options=options, use_subprocess=True) 
    return driver

def scrape_news(driver, player_name):
    query = f"{player_name} cricket"
    print(f"Searching news for: {query}")
    
    # Go directly to News tab
    url = f"https://www.google.com/search?q={query}&tbm=nws"
    driver.get(url)
    
    # Random sleep
    time.sleep(random.uniform(2, 4))
    
    news_items = []
    
    try:
        # Wait for results
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "rso"))
        )
        
        # Find result containers
        # The structure of Google News results can vary, but usually they are in div#rso > div
        # Find all headings directly
        headings = driver.find_elements(By.CSS_SELECTOR, "div#rso div[role='heading']")
        
        for heading in headings:
            try:
                title = heading.text.strip()
                if not title:
                    continue
                    
                # Find parent anchor tag
                # xpath: ancestor::a[1]
                link_el = heading.find_element(By.XPATH, "./ancestor::a[1]")
                link = link_el.get_attribute("href")
                
                if link and title:
                     # Check if we already have this link to avoid duplicates
                    if not any(item['link'] == link for item in news_items):
                         news_items.append({"headline": title, "link": link})
                
                if len(news_items) >= 5:
                    break
            except Exception:
                continue
                
    except Exception as e:
        print(f"Error scraping news for {player_name}: {e}")
        
    return news_items

def main():
    print("Fetching players from Supabase...")
    try:
        # Order by list_sr_no to be deterministic
        response = supabase.table('players').select('list_sr_no, first_name, surname').order('list_sr_no', desc=False).execute()
        players = response.data
    except Exception as e:
        print(f"Supabase error: {e}")
        return

    if not players:
        print("No players found.")
        return

    print(f"Found {len(players)} players.")
    
    driver = get_driver()
    
    try:
        for p in players:
            pid = p['list_sr_no']
            name = f"{p['first_name']} {p['surname']}".strip()
            
            news = scrape_news(driver, name)
            
            if news:
                print(f"Found {len(news)} news items for {name}.")
                try:
                    # Update 'news' column (JSONB)
                    supabase.table('players').update({"news": news}).eq('list_sr_no', pid).execute()
                    print(f"Updated DB for {name}.")
                except Exception as e:
                    print(f"Error updating DB: {e}")
            else:
                 print(f"No news found for {name}.")
            
            time.sleep(random.uniform(2, 5))
            
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
