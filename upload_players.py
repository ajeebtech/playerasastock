import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_PROJECT_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_ANON_KEY")
service_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Ideally use service role for writes if RLS is on, but anon might work if policy allows or if just testing

if not url or not key:
    print("Error: Supabase URL or Key not found in environment variables.")
    exit(1)

# Use service key if available, else fall back to anon key (anon key might not have write permissions depending on policies)
# Given the user context, we will try with the available key. If it fails, user might need to adjust policies.
supabase: Client = create_client(url, service_key if service_key else key)

def upload_players():
    csv_path = 'scraper/players.csv'
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    # Read CSV
    df = pd.read_csv(csv_path)

    # Helper to safely convert to int, handling NaNs and floats
    def safe_int(val):
        if pd.isna(val) or val == '':
            return None
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return None

    # Clean and Prepare Data
    records = []
    for index, row in df.iterrows():
        # Handle duplicate Surname column in CSV manually by picking indices or just letting pandas handle it (pandas usually suffixes duplicates)
        # The CSV header has 'Surname' twice. Pandas usually renames the second one to 'Surname.1'.
        
        # Construct Name
        first_name = str(row['First Name']).strip() if pd.notna(row['First Name']) else ''
        surname = str(row['Surname']).strip() if pd.notna(row['Surname']) else ''
        name = f"{first_name} {surname}".strip()

        record = {
            "list_sr_no": safe_int(row['List Sr. No.']),
            "set_no": safe_int(row['Set No.']),
            "set_2026": row['2026 Set'] if pd.notna(row['2026 Set']) else None,
            "first_name": first_name,
            "surname": surname,
            "country": row['Country'] if pd.notna(row['Country']) else None,
            "state_assoc": row['State Assoc'] if pd.notna(row['State Assoc']) else None,
            "dob": row['DOB'] if pd.notna(row['DOB']) else None,
            "age": safe_int(row['Age']),
            "specialism": row['Specialism'] if pd.notna(row['Specialism']) else None,
            "batting_style": row['Batting Style'] if pd.notna(row['Batting Style']) else None,
            "bowling_style": row['Bowling Style'] if pd.notna(row['Bowling Style']) else None,
            "test_caps": safe_int(row['Test caps']),
            "odi_caps": safe_int(row['ODI caps']),
            "t20_caps": safe_int(row['T20 caps']),
            "ipl": safe_int(row['IPL']),
            "team_2025": row['2025 Team'] if pd.notna(row['2025 Team']) else None,
            "ipl_2025": safe_int(row['2025 IPL']),
            "cua": row['C/U/A'] if pd.notna(row['C/U/A']) else None,
            "reserve_price": row['Reserve Price'] if pd.notna(row['Reserve Price']) else None,
            "name": name
        }
        records.append(record)

    # Insert into Supabase
    print(f"Uploading {len(records)} records to 'players' table...")
    
    # Upload in chunks to avoid payload limits
    chunk_size = 100
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        data, count = supabase.table('players').upsert(chunk).execute()
        print(f"Uploaded batch {i // chunk_size + 1}")

    print("Upload complete!")

if __name__ == "__main__":
    upload_players()
