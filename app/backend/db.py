import psycopg2 as pg
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

params = {
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': os.getenv('DB_PORT')
}

def connect():
    """ Connect to the PostgreSQL database server and fetch data from Users table """
    conn = None
    try:
        # Connect to the PostgreSQL server
        print('Connecting to the PostgreSQL database...')
        conn = pg.connect(**params)

        # Create a cursor
        cur = conn.cursor()

        # Execute a SELECT statement
        cur.execute("SELECT * FROM Users;")
        
        # Fetch all rows
        rows = cur.fetchall()

        # Close the cursor
        cur.close()

        return rows

    except (Exception, pg.DatabaseError) as error:
        print(error)
        return None
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')

def add_rule(rule_text):
    """ Add a new rule to the database if it does not already exist """
    conn = None
    try:
        # Connect to the PostgreSQL server
        conn = pg.connect(**params)

        # Create a cursor
        cur = conn.cursor()

        # Check if the rule already exists
        cur.execute("SELECT COUNT(*) FROM rules WHERE rule = %s;", (rule_text,))
        count = cur.fetchone()[0]

        if count > 0:
            # If the rule already exists, return False
            print("Rule already exists in the database.")
            return False

        # Insert the rule into the database
        cur.execute("INSERT INTO rules (rule) VALUES (%s)", (rule_text,))

        # Commit the changes
        conn.commit()

        # Close the cursor
        cur.close()

        return True

    except (Exception, pg.DatabaseError) as error:
        print(error)
        return False
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')

def get_rules():
    """ Fetch all rules from the database """
    conn = None
    try:
        # Connect to the PostgreSQL server
        conn = pg.connect(**params)

        # Create a cursor
        cur = conn.cursor()

        # Execute a SELECT statement to fetch all rules
        cur.execute("SELECT * FROM rules;")
        
        # Fetch all rows
        rows = cur.fetchall()

        # Close the cursor
        cur.close()

        return rows

    except (Exception, pg.DatabaseError) as error:
        print(error)
        return None
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')

def update_rule_in_db(rule_id: int, new_rule_text: str) -> bool:
    """
    Update a rule in the database by rule ID.

    Parameters:
        rule_id (int): The ID of the rule to be updated.
        new_rule_text (str): The new text for the rule.

    Returns:
        bool: True if the update was successful, False otherwise.
    """
    conn = None
    try:
        # Connect to the PostgreSQL server
        conn = pg.connect(**params)

        # Create a cursor
        cur = conn.cursor()

        # Update the rule in the database
        cur.execute("UPDATE rules SET rule = %s WHERE id = %s;", (new_rule_text, rule_id))

        # Commit the changes
        conn.commit()

        # Check if any rows were updated
        if cur.rowcount == 0:
            print(f"No rule found with ID: {rule_id}")
            return False  # No rule found with the given ID
        
        print(f"Rule with ID {rule_id} updated successfully.")
        return True  # Update successful

    except (Exception, pg.DatabaseError) as error:
        print(error)
        return False  # Update failed

    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')
