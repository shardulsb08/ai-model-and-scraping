from transformers import AutoModelForCausalLM, AutoTokenizer
import pymongo

# Load the model and tokenizer
model_name = "Qwen/Qwen2.5-7B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Set the pad token if not already set
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Move model to correct device
device = "cpu"
model.to(device)

# Connect to MongoDB
client = pymongo.MongoClient("mongodb+srv://harsh:harsh9359@cluster0.axgoi9y.mongodb.net/")
db = client["portfolio-chat"]
website_content_collection = db["websitecontents"]

def fetch_website_content(domain):
    """Fetch the scraped content from MongoDB based on the domain."""
    content_doc = website_content_collection.find_one({ "domain": domain })
    return content_doc["content"] if content_doc else ""

def generate_response(prompt, domain):
    """Generate a concise and accurate response to the user's question."""
    # Fetch the website content from MongoDB
    website_content = fetch_website_content(domain)

    if not website_content:
        return "Sorry, I couldn't find any content for this website."

#TODO: Improve the prompt for better response.
    full_prompt = (
        f"Pretend you are my assistant, helping users navigate my portfolio.\n"
        f"Use only the given website content {website_content}\n"
        f"Keep responses polite, short, and informative.\n\n"
        f"Please answer the following question concisely and accurately, based only on the given information.\n"
        f"Question: {prompt}\n"
        f"Short Answer:"
    )

    # Tokenize input
    inputs = tokenizer(full_prompt, return_tensors="pt", padding=True, truncation=True)
    inputs = { key: value.to(device) for key, value in inputs.items() }

    # Generate response with constraints
#TODO: Check if top_k and top_p need to be updated based on the model used.
    outputs = model.generate(
        inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        pad_token_id=tokenizer.pad_token_id,
        max_new_tokens=500,  # Limit response to 100 tokens
        num_return_sequences=1,
        temperature=0.7,
        top_k=50,
        top_p=0.9,
        do_sample=True
    )

    # Decode the response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Extract answer after "Short Answer:"
    if "Short Answer:" in response:
        answer = response.split("Short Answer:")[-1].strip()
    else:
        answer = response.strip()

    # Keep only the first sentence to ensure brevity
    answer = answer.split("\n")[0]

    return answer

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python chatbot.py <prompt> <domain>")
        sys.exit(1)

    prompt = sys.argv[1]
    domain = sys.argv[2]
    answer = generate_response(prompt, domain)
    print(f"Question: {prompt}")
    print(f"Answer: {answer}")
