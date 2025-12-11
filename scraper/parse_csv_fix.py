import csv
import re
import sys

def get_known_countries():
    return [
        "New Zealand", "Australia", "India", "South Africa", "England", 
        "Sri Lanka", "West Indies", "Afghanistan", "Bangladesh", "Ireland",
        "Zimbabwe", "Pakistan", "Scotland", "Netherlands", "Nepal", "USA", "UAE", "Namibia", "Oman"
    ]

def get_known_teams():
    return ["CSK", "DC", "GT", "KKR", "LSG", "MI", "PBKS", "RCB", "RR", "SRH"]

def parse_line_full(line):
    # Try comma separated first (lines 1-8ish)
    # Expected: List Sr. No., Set No., 2026 Set, First Name, Surname, Country, State Assoc, DOB, Age, Specialism, Style, Test caps, ODI caps, T20 caps, IPL, 2025 Team, 2025 IPL, C/U/A,Reserve Price, Surname
    if line.count(',') > 15:
        parts = next(csv.reader([line]))
        if len(parts) >= 15:
            # Check for Bowling Style insertion at Index 11 (Test caps)
            # If parts[11] is text (like "RIGHT ARM..."), it's likely a shift.
            # Real test caps should be a number (or empty).
            
            # Helper to check if string looks like a number
            def is_stat(s):
                return re.match(r'^\d*$', s.strip()) is not None
            
            # Base indices
            idx_test = 11
            
            # If Test Caps is NOT a number and has text, assume shift
            if not is_stat(parts[idx_test]) and len(parts[idx_test].strip()) > 0:
                # Shift indices by 1
                shift = 1
            else:
                shift = 0
                
            idx_test += shift
            idx_odi = 12 + shift
            idx_t20 = 13 + shift
            idx_ipl = 14 + shift
            idx_team = 15 + shift
            idx_ipl25 = 16 + shift
            idx_status = 17 + shift
            idx_price = 18 + shift
            idx_surname = 19 + shift
            
            # Identify Status Index to realign
            # Search for Capped/Uncapped in the remaining parts
            remaining_parts = parts[idx_team:]
            
            status_idx_rel = -1
            for i, p in enumerate(remaining_parts):
                if p.strip() in ["Capped", "Uncapped"]:
                    status_idx_rel = i
                    break
            
            val_team = ""
            val_ipl25 = ""
            val_status = ""
            val_price = ""
            val_surname = ""
            
            if status_idx_rel != -1:
                # Found status.
                # parts[idx_team + status_idx_rel] is Status.
                abs_status_idx = idx_team + status_idx_rel
                val_status = parts[abs_status_idx].strip()
                
                # Items before Status (from idx_team to abs_status_idx)
                # Could be (Team, IPL25) or (Team) or ()
                between_tokens = parts[idx_team:abs_status_idx]
                
                if len(between_tokens) == 2:
                    val_team = between_tokens[0].strip()
                    val_ipl25 = between_tokens[1].strip()
                elif len(between_tokens) == 1:
                    # check if it looks like IPL Num or Team
                    # Heuristic: Teams are words, IPL25 is num
                    t = between_tokens[0].strip()
                    if t.isdigit():
                        val_ipl25 = t
                    else:
                        val_team = t
                
                # Items after Status
                # Expect Price, Surname
                post_tokens = parts[abs_status_idx+1:]
                if len(post_tokens) >= 1: val_price = post_tokens[0].strip()
                if len(post_tokens) >= 2: val_surname = post_tokens[1].strip()
            else:
                # No status found? Fallback to fixed indexing
                val_team = get_part(idx_team)
                val_ipl25 = get_part(idx_ipl25)
                val_status = get_part(idx_status)
                val_price = get_part(idx_price)
                val_surname = get_part(idx_surname)

            return {
                "List Sr. No.": parts[0].strip(),
                "Set No.": parts[1].strip(),
                "2026 Set": parts[2].strip(),
                "First Name": parts[3].strip(),
                "Surname": parts[4].strip(),
                "Country": parts[5].strip(),
                "State Assoc": parts[6].strip(),
                "DOB": parts[7].strip(),
                "Age": parts[8].strip(),
                "Specialism": parts[9].strip(),
                "Style": parts[10].strip(),
                "Test caps": get_part(idx_test),
                "ODI caps": get_part(idx_odi),
                "T20 caps": get_part(idx_t20),
                "IPL": get_part(idx_ipl),
                "2025 Team": val_team,
                "2025 IPL": val_ipl25,
                "C/U/A": val_status,
                "Reserve Price": val_price,
                "Surname_End": val_surname
            }

    # Malformed Parsing
    # 1. Anchors: DOB, Status
    
    # Clean line
    line = line.strip()
    
    # ANCHOR: DOB (\d{1,2}/\d{1,2}/\d{4})
    dob_match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', line)
    if not dob_match:
        return None
    
    dob = dob_match.group(1)
    pre_dob = line[:dob_match.start()].strip()
    post_dob = line[dob_match.end():].strip()
    
    # --- PART 1: Pre-DOB (Sr, Set, 2026Set, Name, Country, State) ---
    # Heuristic: Sr, Set, 2026Set are usually distinct at start.
    # But clean commas might be missing or partial.
    # Text: "9, 2 AL1 Deepak Hooda India RCA"
    # Text: "8, 2 AL1 Wanindu Hasaranga Sri Lanka"
    
    # Remove initial commas and split
    pre_tokens = re.split(r'[,\s]+', pre_dob)
    # Filter empty
    pre_tokens = [t for t in pre_tokens if t]
    
    if len(pre_tokens) < 4:
        return None
        
    sr_no = pre_tokens[0]
    set_no = pre_tokens[1]
    set_2026 = pre_tokens[2]
    
    # Remaining tokens: Name components + Country + [State]
    name_geo_tokens = pre_tokens[3:]
    name_geo_text = " ".join(name_geo_tokens)
    
    # Find Country from right
    known_countries = get_known_countries()
    sorted_countries = sorted(known_countries, key=len, reverse=True)
    
    country = ""
    state_assoc = ""
    name_part = name_geo_text
    
    # Check for State Assoc (2-5 UPPERCASE letters at end, not Country)
    # Assuming State is last
    potential_state_match = re.search(r'\b([A-Z]{2,6})$', name_geo_text)
    if potential_state_match:
        cand_state = potential_state_match.group(1)
        # Verify it's not a country name (USA, UAE)
        if cand_state not in ["USA", "UAE", "OMAN"]: # rudimentary check
             # Also check if it's part of the country name? "South Africa" -> Africa? No.
             # Actually, if Country is "India", "RCA" is distinct.
             # Let's try to match Country first.
             pass

    # Strategy: Find valid Country string.
    # It might be followed by State.
    country_found_idx = -1
    found_country_name = ""
    
    for c in sorted_countries:
        # Case insensitive regex search
        # Match 'Country' as whole word(s)
        # Escape for regex
        c_esc = re.escape(c)
        pattern = re.compile(r'\b' + c_esc + r'\b', re.IGNORECASE)
        match = pattern.search(name_geo_text)
        if match:
             # If multiple matches?? Take the last one?
             # Usually only one country.
             country_found_idx = match.start()
             found_country_name = c # Standardize case? Or use match?
             # Use the actual text case to remove it properly? Or just index.
             # Let's use clean name
             country = c
             break
             
    if country:
        # Name is before country
        name_part = name_geo_text[:country_found_idx].strip()
        # State is after country
        # End of country match
        country_end = country_found_idx + len(found_country_name) # Approx if regex matched len
        # Actually regex match object has .end()
        # But let's assume we grabbed it.
        remainder_after_country = name_geo_text[country_found_idx:].replace(found_country_name, "", 1).strip()
        # If remainder exists, it's likely State
        state_assoc = remainder_after_country.replace(",", "").strip() # Clean commas
    else:
        # No country found? Fail or assume tokens?
        pass

    # Split Name
    name_tokens = name_part.split()
    if len(name_tokens) > 0:
        first_name = name_tokens[0]
        surname = " ".join(name_tokens[1:])
    else:
        first_name = ""
        surname = ""

    # --- PART 2: Post-DOB (Age ... Status ... Surname) ---
    # Text: "30 ALL-ROUNDER RHB RIGHT ARM Off Spin 10 21 125 CSK 7 Capped 75 Hooda"
    
    # ANCHOR: Status (Capped/Uncapped)
    status_match = re.search(r'\b(Capped|Uncapped)\b', post_dob)
    if not status_match:
        return None
        
    status = status_match.group(1)
    
    # Text BEFORE Status: "30 ALL-ROUNDER ... 7 "
    middle_text = post_dob[:status_match.start()].strip()
    
    # Text AFTER Status: " 75 Hooda" (Reserve Price, Surname)
    end_text = post_dob[status_match.end():].strip()
    end_tokens = end_text.split()
    
    reserve_price = ""
    surname_end = ""
    if len(end_tokens) >= 1:
        reserve_price = end_tokens[0]
        if len(end_tokens) >= 2:
            surname_end = " ".join(end_tokens[1:])
            
    # Parse Middle Text
    # "30 ALL-ROUNDER RHB RIGHT ARM Off Spin 10 21 125 CSK 7"
    middle_tokens = middle_text.split()
    
    age = middle_tokens[0] if middle_tokens else ""
    
    # Specialism (BATTER, ALL-ROUNDER, BOWLER, WICKETKEEPER)
    specialism = ""
    spec_idx = 1
    # Check if index 1 is Specialism
    if len(middle_tokens) > 1 and middle_tokens[1] in ["BATTER", "BOWLER", "ALL-ROUNDER", "WICKETKEEPER"]:
        specialism = middle_tokens[1]
        spec_idx = 2
    
    # Style (LHB, RHB)
    style = ""
    style_idx = spec_idx
    if len(middle_tokens) > style_idx and middle_tokens[style_idx] in ["LHB", "RHB"]:
        style = middle_tokens[style_idx]
        style_idx += 1
        
    # Bowling Style?
    # Anything between Style and the first Digit?
    # "RIGHT ARM Off Spin" -> 4 tokens.
    # Stats (Test, ODI, T20, IPL) start with digits.
    # Team (CSK etc) is Uppercase.
    
    # Consume tokens until we hit a digit (Stats)
    next_idx = style_idx
    while next_idx < len(middle_tokens):
        token = middle_tokens[next_idx]
        if re.match(r'^\d+$', token):
            break
        next_idx += 1
        
    # Consumed tokens are bowling style (ignored for specific column, but consumed)
    
    # Remaining: Stats + Team
    remaining_tokens = middle_tokens[next_idx:]
    
    # Mapping stats is heuristic because columns can be missing/merged?
    # "10 21 125 CSK 7" -> 5 tokens.
    # "4 68 90 37 RR 11" -> 6 tokens.
    # "11 6 12 1 LSG 1" -> 6 tokens.
    # Standard: Test, ODI, T20, IPL_Caps, Team, IPL_2025_Matches?
    # Wait, in the full CSV header: `Test caps, ODI caps, T20 caps, IPL, 2025 Team, 2025 IPL` (6 cols)
    
    test_caps = ""
    odi_caps = ""
    t20_caps = ""
    ipl_caps = ""
    team_2025 = ""
    ipl_2025 = ""
    
    known_teams = get_known_teams()
    
    # Identify Team index in remaining_tokens
    team_idx = -1
    for i, t in enumerate(remaining_tokens):
        if t in known_teams:
            team_idx = i
            team_2025 = t
            break
            
    if team_idx != -1:
        # Tokens before team are caps
        caps_tokens = remaining_tokens[:team_idx]
        # Tokens after team are 2025 IPL
        post_team_tokens = remaining_tokens[team_idx+1:]
        
        # Populate caps from right to left? or Left to right.
        # usually Test, ODI, T20, IPL
        if len(caps_tokens) >= 1: test_caps = caps_tokens[0]
        if len(caps_tokens) >= 2: odi_caps = caps_tokens[1]
        if len(caps_tokens) >= 3: t20_caps = caps_tokens[2]
        if len(caps_tokens) >= 4: ipl_caps = caps_tokens[3]
        
        if len(post_team_tokens) >= 1: ipl_2025 = post_team_tokens[0]
    else:
        # No team found. All tokens are stats?
        # Or maybe Team is missing?
        caps_tokens = remaining_tokens
        if len(caps_tokens) >= 1: test_caps = caps_tokens[0]
        if len(caps_tokens) >= 2: odi_caps = caps_tokens[1]
        if len(caps_tokens) >= 3: t20_caps = caps_tokens[2]
        if len(caps_tokens) >= 4: ipl_caps = caps_tokens[3]
        if len(caps_tokens) >= 5: ipl_2025 = caps_tokens[4] # ??

    return {
        "List Sr. No.": sr_no,
        "Set No.": set_no,
        "2026 Set": set_2026,
        "First Name": first_name,
        "Surname": surname,
        "Country": country,
        "State Assoc": state_assoc,
        "DOB": dob,
        "Age": age,
        "Specialism": specialism,
        "Style": style,
        "Test caps": test_caps,
        "ODI caps": odi_caps,
        "T20 caps": t20_caps,
        "IPL": ipl_caps,
        "2025 Team": team_2025,
        "2025 IPL": ipl_2025,
        "C/U/A": status,
        "Reserve Price": reserve_price,
        "Surname_End": surname_end
    }

def main():
    input_file = 'scraper/players.csv'
    output_file = 'scraper/players_full.csv'
    
    rows = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    headers = [
        "List Sr. No.", "Set No.", "2026 Set", "First Name", "Surname", "Country", 
        "State Assoc", "DOB", "Age", "Specialism", "Style", 
        "Test caps", "ODI caps", "T20 caps", "IPL", "2025 Team", "2025 IPL", 
        "C/U/A", "Reserve Price", "Surname"
    ]
    
    start_idx = 1
    
    for i in range(start_idx, len(lines)):
        line = lines[i].strip()
        if not line: continue
        
        parsed = parse_line_full(line)
        if parsed:
            # Rename Surname_End to Surname for output?
            # User output has two "Surname" columns? "First Name, Surname ... Surname"
            # DictWriter keys must match headers. 
            # We can use "Surname" twice if we construct the row as list? No, DictWriter needs distinct keys?
            # Actually CSV allows duplicate headers.
            # But DictWriter data dict keys are unique.
            # We'll map "Surname_End" to the last column data.
            # We need to write manually or use a trick.
            
            # Let's map to a dict that matches headers but uniqueness is an issue for DictWriter?
            # Actually we can just write using list writer for simplicity or map keys carefully.
            
            # Use distinct keys internally, map to list for writing.
            row_data = [
                parsed.get("List Sr. No.", ""),
                parsed.get("Set No.", ""),
                parsed.get("2026 Set.", parsed.get("2026 Set", "")),
                parsed.get("First Name", ""),
                parsed.get("Surname", ""),
                parsed.get("Country", ""),
                parsed.get("State Assoc", ""),
                parsed.get("DOB", ""),
                parsed.get("Age", ""),
                parsed.get("Specialism", ""),
                parsed.get("Style", ""),
                parsed.get("Test caps", ""),
                parsed.get("ODI caps", ""),
                parsed.get("T20 caps", ""),
                parsed.get("IPL", ""),
                parsed.get("2025 Team", ""),
                parsed.get("2025 IPL", ""),
                parsed.get("C/U/A", ""),
                parsed.get("Reserve Price", ""),
                parsed.get("Surname_End", "")
            ]
            rows.append(row_data)
        else:
            print(f"Skipping line {i+1}: Could not parse.", file=sys.stderr)

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
        
    print(f"Successfully processed {len(rows)} lines. Output saved to {output_file}")

if __name__ == "__main__":
    main()
