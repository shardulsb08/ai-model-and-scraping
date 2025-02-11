from transformers import AutoModelForCausalLM, AutoTokenizer

# Load the model and tokenizer
model_name = "HuggingFaceTB/SmolLM-1.7B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Set the pad token if not already set
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Move model to correct device
device = "cpu"
model.to(device)

# Load the formatted website content
with open("formatted_website_content.txt", "r", encoding="utf-8") as file:
    website_content = file.read()

def generate_response(prompt):
    """Generate a concise and accurate response to the user's question."""
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
    inputs = {key: value.to(device) for key, value in inputs.items()}

    # Generate response with constraints
    outputs = model.generate(
        inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        pad_token_id=tokenizer.pad_token_id,
        max_new_tokens=100,  # Limit response to 100 tokens
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
    prompt = sys.argv[1]
    answer = generate_response(prompt)
    print(f"Question: {prompt}")
    print(f"Answer: {answer}")
