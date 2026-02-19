import re
import os
import psycopg2
from datetime import datetime

def clean_val(val, table, col_idx):
    val = val.strip()
    if val == "NULL":
        return None
    if val.startswith("'") and val.endswith("'"):
        # Remove MySQL escapes and handle PG escapes
        val = val[1:-1].replace("\\'", "'").replace("\\\"", "\"").replace("\\\\", "\\").replace("\\n", "\n").replace("\\r", "\r")
        return val
    if val.lower() in ("true", "false"):
        return val.lower() == "true"
    try:
        if "." in val:
            return float(val)
        return int(val)
    except ValueError:
        return val

def migrate():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found")
        return

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    sql_file = "attached_assets/computer_store_backup_1771475079820.sql"
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

    table_map = {
        "_categorytoproduct": "_CategoryToProduct",
        "bankdetail": "BankDetail",
        "category": "Category",
        "invoice": "Invoice",
        "order": "Order",
        "orderitem": "OrderItem",
        "product": "Product",
        "productimage": "ProductImage",
        "quote": "Quote",
        "quoteitem": "QuoteItem",
        "serialnumber": "SerialNumber",
        "user": "User"
    }

    # Disable constraints
    cur.execute("SET session_replication_role = 'replica';")

    # Regex to find INSERT INTO `table` VALUES (...);
    # This needs to handle multiline VALUES
    insert_pattern = re.compile(r"INSERT INTO `([^`]+)` VALUES\s*(.*?);", re.DOTALL | re.IGNORECASE)
    
    for match in insert_pattern.finditer(content):
        mysql_table = match.group(1).lower()
        values_block = match.group(2).strip()
        
        pg_table = table_map.get(mysql_table)
        if not pg_table:
            print(f"Skipping table: {mysql_table}")
            continue

        print(f"Migrating {mysql_table} -> {pg_table}...")
        
        # Split rows by finding ),( that are NOT inside strings
        # This is a bit tricky, but we can try a simplified split for this specific dump
        # since it's standard MySQL output.
        rows = []
        current_row = []
        in_string = False
        escaped = False
        start = 0
        
        # Values block is like (val1, val2), (val3, val4)
        # We'll parse it character by character to be safe with commas and parens in strings
        i = 0
        while i < len(values_block):
            char = values_block[i]
            if char == "'" and not escaped:
                in_string = not in_string
            elif char == "\\" and not escaped:
                escaped = True
                i += 1
                continue
            elif char == "(" and not in_string and not escaped:
                start = i + 1
            elif char == ")" and not in_string and not escaped:
                row_str = values_block[start:i]
                # Split row_str by comma, but respect strings
                row_vals = []
                val_start = 0
                v_in_string = False
                v_escaped = False
                for j, v_char in enumerate(row_str):
                    if v_char == "'" and not v_escaped:
                        v_in_string = not v_in_string
                    elif v_char == "\\" and not v_escaped:
                        v_escaped = True
                        continue
                    elif v_char == "," and not v_in_string and not v_escaped:
                        row_vals.append(clean_val(row_str[val_start:j], pg_table, len(row_vals)))
                        val_start = j + 1
                    v_escaped = False
                row_vals.append(clean_val(row_str[val_start:], pg_table, len(row_vals)))
                rows.append(row_vals)
            
            escaped = False
            i += 1

        if rows:
            placeholders = ", ".join(["%s"] * len(rows[0]))
            cols = None # We'll let PG infer or we could specify if we had them
            
            # Since we don't have column names in the dump's INSERTs, 
            # we rely on the order matching the Prisma-generated table.
            # However, MySQL and PG column orders might differ if Prisma 
            # generated them differently. 
            # To be safer, we should probably fetch the column names from the PG table first.
            cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{pg_table}' AND table_schema = 'public' ORDER BY ordinal_position")
            pg_cols = [r[0] for r in cur.fetchall()]
            
            # Filter rows to match column count if necessary, or just try to insert
            insert_query = f"INSERT INTO \"{pg_table}\" ({', '.join([f'\"{c}\"' for c in pg_cols])}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
            
            for row in rows:
                if len(row) != len(pg_cols):
                    # Handle mismatch (e.g. Prisma added columns)
                    # This is common. We might need to padding with defaults or handle specificly.
                    if pg_table == "User" and len(row) < len(pg_cols):
                         # Just a guess, but let's try to match what we can
                         pass
                    print(f"Warning: Column mismatch in {pg_table}. Dump: {len(row)}, DB: {len(pg_cols)}")
                    # Try to insert anyway if dump has fewer, PG will use defaults
                    short_cols = pg_cols[:len(row)]
                    short_placeholders = ", ".join(["%s"] * len(row))
                    q = f"INSERT INTO \"{pg_table}\" ({', '.join([f'\"{c}\"' for c in short_cols])}) VALUES ({short_placeholders}) ON CONFLICT DO NOTHING"
                    cur.execute(q, row)
                else:
                    cur.execute(insert_query, row)

    # Re-enable constraints
    cur.execute("SET session_replication_role = 'origin';")
    conn.commit()
    cur.close()
    conn.close()
    print("Migration finished")

if __name__ == "__main__":
    migrate()
