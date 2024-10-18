# main.py
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from db import connect, add_rule, get_rules, update_rule_in_db  # Make sure to import your update function
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
import time

# Creating server instance
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for adding rules
class Rule(BaseModel):
    rule_text: str

# Request model for updating rules
class RuleUpdate(BaseModel):
    rule_text: str

# Global variables for tracking IP addresses and their request counts
ip_request_counts = defaultdict(int)
delay_threshold = 5  # Standard value for delay threshold (e.g., 5 requests)
response_delay = 2   # Delay in seconds for users exceeding the threshold

@app.get('/', status_code=200)
async def fun(request: Request):
    ip_address = request.client.host
    ip_request_counts[ip_address] += 1
    
    # Check for delay
    if ip_request_counts[ip_address] > delay_threshold:
        time.sleep(response_delay)  # Delay the response
    
    return {"message": "Hello, World!"}

@app.post('/add-rules', status_code=201)
async def create_rule(rule: Rule, request: Request):
    ip_address = request.client.host
    ip_request_counts[ip_address] += 1

    # Check for delay
    if ip_request_counts[ip_address] > delay_threshold:
        time.sleep(response_delay)  # Delay the response
    
    success = add_rule(rule.rule_text)
    if not success:
        raise HTTPException(status_code=409, detail="Rule already exists in the database.")
    return {"message": "Rule added successfully!"}

@app.get('/rules', status_code=200)
async def get_all_rules(request: Request):
    ip_address = request.client.host
    ip_request_counts[ip_address] += 1

    # Check for delay
    if ip_request_counts[ip_address] > delay_threshold:
        time.sleep(response_delay)  # Delay the response

    rules = get_rules()
    if rules is None:
        raise HTTPException(status_code=500, detail="Unable to fetch rules from the database.")
    rules_list = [{"id": row[0], "rule_text": row[1]} for row in rules] 
    return {"rules": rules_list}

class RuleEvaluateRequest(BaseModel):
    rules: dict

class Node:
    def __init__(self, id=None, name=None, age=None, department=None, salary=None, spend=None, experience=None):
        self.id = id
        self.name = name
        self.age = age
        self.department = department
        self.salary = salary  # Changed income to salary
        self.spend = spend
        self.experience = experience  # Added experience field
        self.left = None
        self.right = None

    def __repr__(self):
        return (f"Node(id={self.id}, name='{self.name}', age={self.age}, department='{self.department}', "
                f"salary={self.salary}, spend={self.spend}, experience={self.experience})")

    def print_tree(self, depth=0, max_depth=3):
        if depth > max_depth:
            return "..."
        result = " " * (depth * 2) + repr(self) + "\n"
        if self.left:
            result += self.left.print_tree(depth + 1, max_depth)
        if self.right:
            result += self.right.print_tree(depth + 1, max_depth)
        return result

class AbstractSyntaxTree:
    def __init__(self):
        self.rule_nodes = {}

    def validate_users(self, rule):
        users = connect()
        if users is None:
            raise Exception("Unable to fetch users from the database.")
        
        tree_root = Node(name="Root", department="All Departments")
        rule_head = Node(name="Rule", department="Rule Department")

        cnt = 5
        for user in users:
            user_node = Node(id=user[0], name=user[1], age=user[2], department=user[3], salary=user[4], spend=user[5], experience=user[6])
            if cnt > 0:
                cnt -= 1
                print(user_node, rule, sep='\n')
            if self.apply_rule(user_node, rule):
                if not rule_head.left:
                    rule_head.left = user_node
                else:
                    current = rule_head.left
                    while current.right:
                        current = current.right
                    current.right = user_node
        
        if not tree_root.left:
            tree_root.left = rule_head
        else:
            current = tree_root.left
            while current.right:
                current = current.right
            current.right = rule_head

        return tree_root

    def apply_rule(self, user_node, rule):
        if 'AND' in rule:
            return all(self.apply_rule(user_node, subrule) for subrule in rule['AND'])
        elif 'OR' in rule:
            return any(self.apply_rule(user_node, subrule) for subrule in rule['OR'])
        else:
            field = rule.get("field")
            operator = rule.get("operator")
            value = rule.get("value")
    
            # Ensure field is a string and valid
            if not isinstance(field, str):
                print(f"Invalid field '{field}'. It should be a string.")
                return False
    
            # Corrected line: accessing the attribute from user_node
            attribute_value = getattr(user_node, field, None)
            if attribute_value is None:
                print(f"Field '{field}' not found in user node.")
                return False
    
            # Operator comparisons
            if operator == ">":
                return attribute_value > value
            elif operator == "<":
                return attribute_value < value
            elif operator == "=":
                return attribute_value == value
            elif operator == ">=":
                return attribute_value >= value
            elif operator == "<=":
                return attribute_value <= value
    
        return False

@app.post('/evaluate', status_code=200)
async def evaluate_rule(request: RuleEvaluateRequest, req: Request):
    ip_address = req.client.host
    ip_request_counts[ip_address] += 1

    # Check for delay
    if ip_request_counts[ip_address] > delay_threshold:
        time.sleep(response_delay)  # Delay the response
    
    rules = request.rules  # Accept the parsed rule JSON from the frontend
    print(rules)
    ast = AbstractSyntaxTree()
    try:
        print("Evaluating Rules:")
        tree = ast.validate_users(rules)
        if tree is None:
            raise HTTPException(status_code=500, detail=f"No valid users found: {str(e)}")
            
        # Collecting valid users
        valid_users = []
        
        # Traverse the tree to collect valid users
        def collect_valid_users(node):
            if not node:
                return
            if node.name != "Root" and node.name != "Rule":
                valid_users.append({
                    "id": node.id,
                    "name": node.name,
                    "age": node.age,
                    "department": node.department,
                    "salary": node.salary,
                    "spend": node.spend,
                    "experience": node.experience,
                })
            collect_valid_users(node.left)
            collect_valid_users(node.right)

        collect_valid_users(tree)

        if valid_users:
            return {
                "message": "Rule evaluated successfully",
                "valid_users": valid_users 
            }
        else:
            raise HTTPException(status_code=500, detail="No valid users found")

    except Exception as e:
        print("Error during rule evaluation:", str(e))
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
    
@app.patch('/rules/{rule_id}', status_code=200)
async def update_rule(rule_id: int, rule_update: RuleUpdate, request: Request):
    ip_address = request.client.host
    ip_request_counts[ip_address] += 1

    # Check for delay
    if ip_request_counts[ip_address] > delay_threshold:
        time.sleep(response_delay)  # Delay the response

    
    print(rule_id, rule_update)
    success = update_rule_in_db(rule_id, rule_update.rule_text)  # Implement this function to update the rule in your database

    if not success:
        raise HTTPException(status_code=404, detail="Rule not found or update failed.")
    
    return {"message": "Rule updated successfully!", "rule_id": rule_id}
